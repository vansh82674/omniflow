import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import { redis } from './redis';
import { GoogleGenAI, Type } from '@google/genai';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const dbUrl = 'file:' + process.cwd().split('\\').join('/') + '/prisma/dev.db';
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);


const worker = new Worker(
  'document-extraction',
  async (job: Job) => {
    console.log(`[Worker] Processing job ${job.id} — file: ${job.data.filename}`);
    const { content, dbJobId } = job.data;

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
          responseSchema: {
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
                description:
                  'Type of document e.g. "Invoice", "Contract", "Report", "Email", "Resume", etc.',
              },
              language: {
                type: Type.STRING,
                description: 'The primary language of the document (e.g. "English")',
              },
              entities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'Key named entities: people, companies, dates, amounts, locations',
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
          },
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

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err);
});

console.log('[Worker] 🚀 OmniFlow extraction worker started and listening...');
