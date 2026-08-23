# omniflow-sdk

The official TypeScript/JavaScript SDK for OmniFlow - the AI Workflow Automation Platform.

Extract structured JSON intelligence from unstructured documents (PDFs, Word Docs, Text) with ease.

## Installation

```bash
npm install omniflow-sdk
```

## Quick Start

```typescript
import { OmniFlow } from 'omniflow-sdk';
import * as fs from 'fs';

// Initialize the client with your API key
const client = new OmniFlow({
  apiKey: 'sk_live_YOUR_API_KEY'
});

async function main() {
  try {
    // 1. Read a document
    const fileBuffer = fs.readFileSync('./invoice.pdf');
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });

    // 2. Extract structured data
    const { jobId } = await client.extract(blob, {
      filename: 'invoice.pdf',
      
      // Optional: Define exactly what you want the AI to extract using a Zod-like schema
      schema: {
        type: "OBJECT",
        properties: {
          invoiceNumber: { type: "STRING" },
          totalAmount: { type: "NUMBER" },
          vendorName: { type: "STRING" },
          lineItems: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                description: { type: "STRING" },
                price: { type: "NUMBER" }
              }
            }
          }
        }
      }
    });

    console.log(`Document queued! Job ID: ${jobId}`);

    // 3. Poll for the result (or use Webhooks!)
    let job;
    do {
      await new Promise(resolve => setTimeout(resolve, 2000));
      job = await client.getJob(jobId);
      console.log(`Status: ${job.status}`);
    } while (job.status === 'waiting' || job.status === 'active');

    if (job.status === 'completed') {
      console.log('Extraction Result:', job.result);
    } else {
      console.error('Extraction Failed:', job.failedReason);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## Features
- **Isomorphic**: Works in Node.js, Next.js Edge, and Browser environments.
- **TypeScript**: Fully typed request and response objects.
- **Zero Dependencies**: Uses standard Web APIs (`fetch`, `FormData`, `Blob`).

## License
MIT
