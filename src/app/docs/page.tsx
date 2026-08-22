"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, FileJson, Check, Copy, Zap, ArrowRight, Activity, Globe } from "lucide-react";
import Link from "next/link";

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "status">("upload");
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-blue-500/30">
      
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full lg:w-64 flex-shrink-0 pt-8">
          <div className="sticky top-24">
            <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity">
              <Zap className="w-6 h-6 text-blue-500" />
              OmniFlow API
            </Link>
            
            <nav className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Endpoints</h4>
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => setActiveTab("upload")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                        activeTab === "upload" ? "bg-blue-500/10 text-blue-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                      }`}
                    >
                      <FileJson className="w-4 h-4" />
                      Extract Document
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab("status")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                        activeTab === "status" ? "bg-blue-500/10 text-blue-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                      Check Job Status
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/dashboard" className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Developer Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pt-8 pb-24">
          <AnimatePresence mode="wait">
            {activeTab === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-12"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">Post</span>
                    <code className="text-lg text-zinc-300">/api/upload</code>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Extract Document</h1>
                  <p className="text-zinc-400 leading-relaxed max-w-2xl">
                    Upload any PDF, TXT, DOCX, or CSV document. OmniFlow queues the document for AI processing and instantly returns a <code className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded text-sm">jobId</code>. You can poll the status endpoint or use Server-Sent Events to receive the extraction in real-time.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Left Column: Details */}
                  <div className="space-y-8">
                    {/* Headers */}
                    <div className="border border-white/10 bg-zinc-900/50 rounded-xl overflow-hidden backdrop-blur-sm">
                      <div className="bg-zinc-900/80 px-4 py-3 border-b border-white/10 text-sm font-semibold text-zinc-300">
                        Headers
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-400 font-mono text-sm">Authorization</span>
                            <span className="text-red-400 text-xs font-semibold uppercase">Required</span>
                          </div>
                          <p className="text-zinc-400 text-sm">Bearer API Key</p>
                        </div>
                      </div>
                    </div>

                    {/* Request Body */}
                    <div className="border border-white/10 bg-zinc-900/50 rounded-xl overflow-hidden backdrop-blur-sm">
                      <div className="bg-zinc-900/80 px-4 py-3 border-b border-white/10 text-sm font-semibold text-zinc-300">
                        Body Parameters <span className="text-zinc-500 font-normal ml-2">multipart/form-data</span>
                      </div>
                      <div className="divide-y divide-white/5">
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-zinc-200 font-mono text-sm">content</span>
                            <span className="text-zinc-500 font-mono text-xs">file</span>
                            <span className="text-red-400 text-xs font-semibold uppercase">Required</span>
                          </div>
                          <p className="text-zinc-400 text-sm">The document file to extract. Max size 10MB.</p>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-zinc-200 font-mono text-sm">webhookUrl</span>
                            <span className="text-zinc-500 font-mono text-xs">string</span>
                          </div>
                          <p className="text-zinc-400 text-sm">Optional URL to POST the JSON result to when extraction finishes.</p>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-zinc-200 font-mono text-sm">extractionSchema</span>
                            <span className="text-zinc-500 font-mono text-xs">string</span>
                          </div>
                          <p className="text-zinc-400 text-sm">Optional JSON string defining the exact shape of the returned AI data.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Code snippets */}
                  <div className="space-y-6">
                    {/* cURL Snippet */}
                    <div className="border border-white/10 bg-[#0c0c0e] rounded-xl overflow-hidden group">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                        <span className="text-xs font-mono text-zinc-400">cURL Example</span>
                        <button 
                          onClick={() => copyToClipboard(`curl -X POST https://api.omniflow.com/api/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "content=@invoice.pdf"`, 'curl1')}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                        >
                          {copied === 'curl1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <pre className="p-4 text-sm font-mono text-zinc-300 overflow-x-auto whitespace-pre">
                        <span className="text-blue-400">curl</span> -X POST https://api.omniflow.com/api/upload \{"\n"}
                        <span className="text-purple-400">  -H</span> "Authorization: Bearer YOUR_API_KEY" \{"\n"}
                        <span className="text-purple-400">  -F</span> "content=@invoice.pdf"
                      </pre>
                    </div>

                    {/* Response Snippet */}
                    <div className="border border-white/10 bg-[#0c0c0e] rounded-xl overflow-hidden group">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-xs font-mono text-emerald-400">202 Accepted</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(`{
  "jobId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "bullmqId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "message": "Job queued"
}`, 'res1')}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                        >
                          {copied === 'res1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <pre className="p-4 text-sm font-mono text-zinc-300 overflow-x-auto">
{`{
  "jobId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "bullmqId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "message": "Job queued"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "status" && (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-12"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">Get</span>
                    <code className="text-lg text-zinc-300">/api/job/{"{jobId}"}</code>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Check Job Status</h1>
                  <p className="text-zinc-400 leading-relaxed max-w-2xl">
                    Retrieve the current status and extracted JSON result of a queued extraction job.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Left Column: Details */}
                  <div className="space-y-8">
                    {/* Path Parameters */}
                    <div className="border border-white/10 bg-zinc-900/50 rounded-xl overflow-hidden backdrop-blur-sm">
                      <div className="bg-zinc-900/80 px-4 py-3 border-b border-white/10 text-sm font-semibold text-zinc-300">
                        Path Parameters
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-zinc-200 font-mono text-sm">jobId</span>
                          <span className="text-zinc-500 font-mono text-xs">string</span>
                          <span className="text-red-400 text-xs font-semibold uppercase">Required</span>
                        </div>
                        <p className="text-zinc-400 text-sm">The ID returned from the upload endpoint.</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Code snippets */}
                  <div className="space-y-6">
                    {/* cURL Snippet */}
                    <div className="border border-white/10 bg-[#0c0c0e] rounded-xl overflow-hidden group">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                        <span className="text-xs font-mono text-zinc-400">cURL Example</span>
                        <button 
                          onClick={() => copyToClipboard(`curl -X GET https://api.omniflow.com/api/job/f47ac10b-58cc-4372-a567-0e02b2c3d479 \\
  -H "Authorization: Bearer YOUR_API_KEY"`, 'curl2')}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                        >
                          {copied === 'curl2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <pre className="p-4 text-sm font-mono text-zinc-300 overflow-x-auto whitespace-pre">
                        <span className="text-blue-400">curl</span> -X GET https://api.omniflow.com/api/job/f47ac10b... \{"\n"}
                        <span className="text-purple-400">  -H</span> "Authorization: Bearer YOUR_API_KEY"
                      </pre>
                    </div>

                    {/* Response Snippet */}
                    <div className="border border-white/10 bg-[#0c0c0e] rounded-xl overflow-hidden group">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-xs font-mono text-emerald-400">200 OK</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(`{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "completed",
  "result": "{\"total\": 1500, \"merchant\": \"Stripe\"}",
  "fileType": "application/pdf"
}`, 'res2')}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                        >
                          {copied === 'res2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <pre className="p-4 text-sm font-mono text-zinc-300 overflow-x-auto">
{`{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "completed",
  "result": "{\\"total\\": 1500, \\"merchant\\": \\"Stripe\\"}",
  "fileType": "application/pdf"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
