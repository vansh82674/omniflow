import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Installation | OmniFlow SDK',
  description: 'How to install and set up the official OmniFlow SDK in your project.',
};

export default function InstallationPage() {
  return (
    <div className="max-w-3xl prose prose-invert prose-indigo">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Installation</h1>
      <p className="text-xl text-white/60 mb-12">
        Get up and running with the official OmniFlow SDK for Node.js and TypeScript.
      </p>

      <h2 className="text-2xl font-semibold mt-12 mb-4 border-b border-white/10 pb-2">Prerequisites</h2>
      <ul className="text-white/80 space-y-2 mb-8">
        <li>Node.js 18.0 or higher.</li>
        <li>TypeScript 5.0 or higher (if using TypeScript).</li>
        <li>An OmniFlow API key.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-12 mb-4 border-b border-white/10 pb-2">Install the Package</h2>
      <p className="text-white/80 mb-4">
        Install the package using your preferred package manager:
      </p>

      <div className="bg-white/5 rounded-lg p-4 border border-white/10 font-mono text-sm overflow-x-auto mb-4">
<pre className="text-zinc-300">
{`npm install @omniflow/sdk`}
</pre>
      </div>
      
      <div className="bg-white/5 rounded-lg p-4 border border-white/10 font-mono text-sm overflow-x-auto mb-4">
<pre className="text-zinc-300">
{`yarn add @omniflow/sdk`}
</pre>
      </div>

      <div className="bg-white/5 rounded-lg p-4 border border-white/10 font-mono text-sm overflow-x-auto mb-12">
<pre className="text-zinc-300">
{`pnpm add @omniflow/sdk`}
</pre>
      </div>

      <h2 className="text-2xl font-semibold mt-12 mb-4 border-b border-white/10 pb-2">Requirements</h2>
      <p className="text-white/80 mb-4">
        The SDK uses the native <code>fetch</code> API and <code>FormData</code>. If you are running Node.js version 18+, these are available globally by default. If you are using an older version of Node, you may need to polyfill <code>fetch</code>.
      </p>

      <h2 className="text-2xl font-semibold mt-12 mb-4 border-b border-white/10 pb-2">Next Steps</h2>
      <p className="text-white/80 mb-4">
        Once installed, head over to the <a href="/docs/sdk/client" className="text-indigo-400 hover:text-indigo-300">OmniFlowClient reference</a> to see how to initialize the client and start extracting data from your documents.
      </p>
    </div>
  );
}
