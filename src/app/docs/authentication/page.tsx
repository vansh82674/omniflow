import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | OmniFlow Docs',
  description: 'Learn how to authenticate your requests to the OmniFlow API',
};

export default function AuthenticationPage() {
  return (
    <div className="max-w-3xl prose prose-invert prose-indigo">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Authentication</h1>
      <p className="text-xl text-white/60 mb-12">
        OmniFlow uses API keys to authenticate requests. You can view and manage your API keys in the OmniFlow Dashboard.
      </p>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 text-amber-500/90 text-sm flex gap-3 items-start">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        <p className="m-0">
          <strong>Keep your keys secure.</strong> Do not share your API keys in publicly accessible areas such as GitHub, client-side code, or public forums. All API requests should be made from your secure backend servers.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-12 mb-4 border-b border-white/10 pb-2">Using the SDK</h2>
      <p className="text-white/80 mb-4">
        If you are using the official <code>@omniflow/sdk</code>, simply pass your API key to the <code>OmniFlowClient</code> constructor. The SDK will automatically handle injecting the correct headers into every request.
      </p>

      <div className="bg-white/5 rounded-lg p-4 border border-white/10 font-mono text-sm overflow-x-auto mb-12">
<pre className="text-indigo-300">
{`import { OmniFlowClient } from '@omniflow/sdk';

// Initialize the client with your secret key
const client = new OmniFlowClient({
  apiKey: process.env.OMNIFLOW_API_KEY, // e.g., 'sk_live_...'
});`}
</pre>
      </div>

      <h2 className="text-2xl font-semibold mt-12 mb-4 border-b border-white/10 pb-2">Using the REST API</h2>
      <p className="text-white/80 mb-4">
        If you are integrating with OmniFlow using standard HTTP clients (like <code>fetch</code>, <code>axios</code>, or cURL), you must include your API key in the <code>Authorization</code> header of every request.
      </p>
      <p className="text-white/80 mb-4">
        We use the standard Bearer token format:
      </p>

      <div className="bg-white/5 rounded-lg p-4 border border-white/10 font-mono text-sm overflow-x-auto mb-12">
<pre className="text-indigo-300">
{`Authorization: Bearer sk_live_your_api_key_here`}
</pre>
      </div>

      <h3 className="text-xl font-semibold mt-8 mb-4">Example Request</h3>
      <div className="bg-white/5 rounded-lg p-4 border border-white/10 font-mono text-sm overflow-x-auto">
<pre className="text-indigo-300">
{`curl -X POST https://omniflow.dev/api/upload \\
  -H "Authorization: Bearer sk_live_your_api_key_here" \\
  -F "content=@/path/to/document.pdf"`}
</pre>
      </div>
      
      <h2 className="text-2xl font-semibold mt-12 mb-4 border-b border-white/10 pb-2">Managing Keys</h2>
      <p className="text-white/80 mb-4">
        You can create multiple API keys for different environments (e.g., Development vs. Production) directly from the <strong>API Keys</strong> tab in your dashboard. If a key is ever compromised, you can revoke it immediately from the same interface to block any further access.
      </p>
    </div>
  );
}