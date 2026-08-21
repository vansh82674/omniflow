import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OmniFlowClient | OmniFlow SDK Reference',
  description: 'API reference for the OmniFlowClient class.',
};

export default function ClientPage() {
  return (
    <div className="max-w-4xl prose prose-invert prose-indigo">
      <h1 className="text-4xl font-bold tracking-tight mb-4">OmniFlowClient</h1>
      <p className="text-xl text-white/60 mb-12">
        The primary entry point for interacting with the OmniFlow API. It handles authentication, HTTP requests, and background job polling automatically.
      </p>

      <h2 className="text-2xl font-semibold mt-12 mb-4 border-b border-white/10 pb-2">Initialization</h2>
      <p className="text-white/80 mb-4">
        Create a new instance of <code>OmniFlowClient</code> by passing your API key.
      </p>

      <div className="bg-white/5 rounded-lg p-4 border border-white/10 font-mono text-sm overflow-x-auto mb-12">
<pre className="text-indigo-300">
{`import { OmniFlowClient } from '@omniflow/sdk';

const client = new OmniFlowClient({
  apiKey: process.env.OMNIFLOW_API_KEY,
});`}
</pre>
      </div>

      <h2 className="text-2xl font-semibold mt-12 mb-4 border-b border-white/10 pb-2">Methods</h2>

      {/* extract method */}
      <div className="mb-12">
        <h3 className="text-xl font-bold font-mono text-white mb-2">
          client.documents.extract(options)
        </h3>
        <p className="text-white/80 mb-4">
          Uploads a document to OmniFlow&apos;s processing queue. This method returns immediately once the file is enqueued.
        </p>
        
        <h4 className="font-semibold text-white/90 text-sm uppercase tracking-wider mb-2">Parameters</h4>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
          <ul className="list-none p-0 m-0 space-y-2">
            <li className="flex flex-col md:flex-row md:items-center gap-2 m-0 p-0">
              <code className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-sm">content</code>
              <span className="text-white/50 text-sm font-mono">string | Blob</span>
              <span className="text-white/80 text-sm ml-0 md:ml-4">The file content or text string to extract data from.</span>
            </li>
          </ul>
        </div>

        <h4 className="font-semibold text-white/90 text-sm uppercase tracking-wider mb-2">Returns</h4>
        <p className="text-white/80 text-sm font-mono mb-4">Promise&lt;UploadResponse&gt;</p>
      </div>

      {/* waitForCompletion method */}
      <div className="mb-12">
        <h3 className="text-xl font-bold font-mono text-white mb-2">
          client.jobs.waitForCompletion(id, pollIntervalMs?)
        </h3>
        <p className="text-white/80 mb-4">
          Polls the OmniFlow API until the specified job reaches a <code>completed</code> or <code>failed</code> state, returning the final result.
        </p>

        <h4 className="font-semibold text-white/90 text-sm uppercase tracking-wider mb-2">Parameters</h4>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
          <ul className="list-none p-0 m-0 space-y-3">
            <li className="flex flex-col md:flex-row md:items-start gap-2 m-0 p-0 border-b border-white/10 pb-3">
              <code className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-sm shrink-0">id</code>
              <span className="text-white/50 text-sm font-mono shrink-0">string</span>
              <span className="text-white/80 text-sm ml-0 md:ml-4">The Job ID returned by <code>extract()</code>.</span>
            </li>
            <li className="flex flex-col md:flex-row md:items-start gap-2 m-0 p-0">
              <code className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-sm shrink-0">pollIntervalMs</code>
              <span className="text-white/50 text-sm font-mono shrink-0">number?</span>
              <span className="text-white/80 text-sm ml-0 md:ml-4">Optional. How frequently to poll the API in milliseconds. Default is <code>2000</code>.</span>
            </li>
          </ul>
        </div>

        <h4 className="font-semibold text-white/90 text-sm uppercase tracking-wider mb-2">Returns</h4>
        <p className="text-white/80 text-sm font-mono mb-4">Promise&lt;JobResult&gt;</p>
      </div>

      {/* get method */}
      <div className="mb-12">
        <h3 className="text-xl font-bold font-mono text-white mb-2">
          client.jobs.get(id)
        </h3>
        <p className="text-white/80 mb-4">
          Fetches the current status of a job without polling. Useful if you are implementing your own Webhook fallback or custom polling strategy.
        </p>
      </div>

    </div>
  );
}
