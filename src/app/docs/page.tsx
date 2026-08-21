import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OmniFlow Docs | Quickstart',
  description: 'Get started with the OmniFlow API and SDK',
};

export default function DocsPage() {
  return (
    <div className="max-w-3xl prose prose-invert prose-indigo">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Quickstart</h1>
      <p className="text-xl text-white/60 mb-12">
        Learn how to integrate OmniFlow&apos;s document intelligence pipeline into your application in minutes.
      </p>

      <h2 className="text-2xl font-semibold mt-12 mb-4 border-b border-white/10 pb-2">1. Get your API Key</h2>
      <p className="text-white/80 mb-4">
        To use the OmniFlow API, you first need an API key. Log in to the OmniFlow dashboard and navigate to the <strong>API Keys</strong> section. Create a new key and save it securely.
      </p>

      <h2 className="text-2xl font-semibold mt-12 mb-4 border-b border-white/10 pb-2">2. Install the SDK</h2>
      <p className="text-white/80 mb-4">
        We provide an official, strongly-typed Node.js/TypeScript SDK to make integrations seamless.
      </p>
      <div className="bg-white/5 rounded-lg p-4 border border-white/10 font-mono text-sm mb-8">
        npm install @omniflow/sdk
      </div>

      <h2 className="text-2xl font-semibold mt-12 mb-4 border-b border-white/10 pb-2">3. Extract Data</h2>
      <p className="text-white/80 mb-4">
        Initialize the client and upload a document. The client will automatically poll the API and wait for the job to complete.
      </p>
      
      <div className="bg-white/5 rounded-lg p-4 border border-white/10 font-mono text-sm overflow-x-auto">
<pre className="text-indigo-300">
{`import { OmniFlowClient } from '@omniflow/sdk';
import fs from 'fs';

const client = new OmniFlowClient({
  apiKey: 'sk_live_your_api_key_here'
});

async function run() {
  // 1. Read a PDF file
  const fileBuffer = fs.readFileSync('./invoice.pdf');
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });

  // 2. Submit the job
  const job = await client.documents.extract({ content: blob });
  console.log('Job queued:', job.jobId);

  // 3. Wait for extraction
  const result = await client.jobs.waitForCompletion(job.jobId);
  console.log('Extraction Result:', result);
}

run();`}
</pre>
      </div>
    </div>
  );
}
