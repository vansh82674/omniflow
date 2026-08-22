import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import { redis } from './redis';
import { GoogleGenAI, Type } from '@google/genai';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/omniflow';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const worker = new Worker(
  'document-extraction',
  async (job: Job) => {
    console.log(`[Worker] Processing job ${job.id} — file: ${job.data.filename}`);
    const { content, dbJobId, webhookUrl, extractionSchema } = job.data;

    // Mark as active in DB
    if (dbJobId) {
      // Delay to avoid SQLite lock contention with Next.js enqueue write
      await new Promise(r => setTimeout(r, 500));
      await prisma.job.update({
        where: { id: dbJobId },
        data: { status: 'active' },
      });
    }

    try {
      // Sprint 3: Dynamic Zod Schemas
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let responseSchema: any = {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'The main title or heading of the document',
          },
          summary: {
            type: Type.STRING,
            description: 'A concise 2-3 sentence summary of the document',
          },
          document_type: {
            type: Type.STRING,
            description: 'Type of document e.g. "Invoice", "Contract", "Report", "Email", "Resume", etc.',
          },
          language: {
            type: Type.STRING,
            description: 'The primary language of the document (e.g. "English")',
          },
          entities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key named entities: people, companies, dates, amounts, locations',
          },
          key_points: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Up to 5 most important points or facts from the document',
          },
          sentiment: {
            type: Type.STRING,
            description: 'Overall sentiment: "positive", "negative", "neutral", "mixed"',
          },
        },
        required: ['title', 'summary', 'document_type', 'language', 'entities', 'key_points'],
      };

      if (extractionSchema) {
        try {
          const parsedSchema = JSON.parse(extractionSchema);
          
          // Basic recursive mapper from standard JSON schema to Gemini Type enums
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapToGeminiType = (obj: any): any => {
            if (!obj || typeof obj !== 'object') return obj;
            
            const mapped = { ...obj };
            if (mapped.type) {
              if (mapped.type.toUpperCase() === 'STRING') mapped.type = Type.STRING;
              else if (mapped.type.toUpperCase() === 'NUMBER') mapped.type = Type.NUMBER;
              else if (mapped.type.toUpperCase() === 'INTEGER') mapped.type = Type.INTEGER;
              else if (mapped.type.toUpperCase() === 'BOOLEAN') mapped.type = Type.BOOLEAN;
              else if (mapped.type.toUpperCase() === 'ARRAY') mapped.type = Type.ARRAY;
              else if (mapped.type.toUpperCase() === 'OBJECT') mapped.type = Type.OBJECT;
            }
            
            if (mapped.properties) {
              for (const key in mapped.properties) {
                mapped.properties[key] = mapToGeminiType(mapped.properties[key]);
              }
            }
            if (mapped.items) {
              mapped.items = mapToGeminiType(mapped.items);
            }
            
            return mapped;
          };

          responseSchema = mapToGeminiType(parsedSchema);
          console.log(`[Worker] Using custom extraction schema for job ${job.id}`);
        } catch (schemaError) {
          console.error(`[Worker] Invalid custom schema provided for job ${job.id}, falling back to default.`, schemaError);
        }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `You are an expert document analyst. Extract structured information from the following document text.

Document:
---
${content.substring(0, 50000)} 
---

Extract the following fields accurately:`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const result = response.text;
      console.log(`[Worker] Job ${job.id} completed.`);

      // Save result to DB
      if (dbJobId) {
        await prisma.job.update({
          where: { id: dbJobId },
          data: { status: 'completed', result },
        });
      }

      // Sprint 2: Execute Webhook
      if (webhookUrl) {
        try {
          console.log(`[Worker] Triggering webhook for job ${job.id} to ${webhookUrl}`);
          const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jobId: dbJobId || job.id,
              status: 'completed',
              result: JSON.parse(result || "{}"),
            })
          });
          console.log(`[Worker] Webhook response: ${webhookResponse.status}`);
        } catch (webhookError) {
          console.error(`[Worker] Failed to execute webhook to ${webhookUrl}`, webhookError);
        }
      }

      return result;
    } catch (error) {
      console.error(`[Worker] Failed to process job ${job.id}`, error);

      // Mark as failed in DB
      if (dbJobId) {
        await prisma.job.update({
          where: { id: dbJobId },
          data: {
            status: 'failed',
            failedReason: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }

      throw error;
    }
  },
  { connection: redis }
);

worker.on('completed', (job) => {
  console.log(`[Worker] ✅ Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`[Worker] ❌ Job ${job?.id} has failed: ${err.message}`);
});

import * as http from 'http';

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err);
});

console.log('[Worker] 🚀 OmniFlow extraction worker started and listening...');

// Dummy HTTP server to satisfy Render's Web Service port binding requirement
const port = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Worker is alive');
});

server.listen(port, () => {
  console.log(`[Worker] Dummy HTTP server listening on port ${port} (Render Web Service bypass)`);
});
