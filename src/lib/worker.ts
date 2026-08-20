import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import { redis } from './redis';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const worker = new Worker(
  'document-extraction',
  async (job: Job) => {
    console.log(`Processing job ${job.id}`);
    const { content } = job.data;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Extract information from the following document:\n\n${content}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    entities: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["title", "summary", "entities"]
            }
        }
      });
      
      const result = response.text;
      console.log(`Job ${job.id} completed. Result: `, result);
      return result;
    } catch (error) {
      console.error(`Failed to process job ${job.id}`, error);
      throw error;
    }
  },
  { connection: redis }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});
