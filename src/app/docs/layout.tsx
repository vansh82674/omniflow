import { ReactNode } from 'react';
import Link from 'next/link';
import { BrainCircuit, ArrowLeft } from 'lucide-react';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black/95 text-white selection:bg-indigo-500/30">
      <div className="flex max-w-7xl mx-auto border-x border-white/10 min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 hidden md:block shrink-0 py-8 px-6">
          <Link href="/dashboard" className="flex items-center gap-2 mb-8">
            <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">OmniFlow</span>
          </Link>

          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-12 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <nav className="space-y-8 text-sm">
            <div>
              <h4 className="font-medium text-white/50 mb-3 uppercase tracking-wider text-xs">Getting Started</h4>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-white/80 hover:text-white transition-colors">Quickstart</Link></li>
                <li><Link href="/docs/authentication" className="text-white/80 hover:text-white transition-colors">Authentication</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white/50 mb-3 uppercase tracking-wider text-xs">SDK Reference</h4>
              <ul className="space-y-2">
                <li><Link href="/docs/sdk/installation" className="text-white/80 hover:text-white transition-colors">Installation</Link></li>
                <li><Link href="/docs/sdk/client" className="text-white/80 hover:text-white transition-colors">OmniFlowClient</Link></li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 py-12 px-8 lg:px-16">
          {children}
        </main>
      </div>
    </div>
  );
}
