import { z } from 'zod';

export const documentExtractionSchema = z.object({
  title: z.string().describe('The title of the document'),
  summary: z.string().describe('A brief summary of the document'),
  entities: z.array(z.string()).describe('Key entities extracted from the document'),
});

export type DocumentExtraction = z.infer<typeof documentExtractionSchema>;
