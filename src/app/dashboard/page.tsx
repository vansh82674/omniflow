"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, CheckCircle2, Loader2, AlertCircle, ArrowRight,
  Sparkles, Settings, FileText, X, LayoutDashboard, 
  Workflow, KeyRound, Search, Bell, Command, MoreHorizontal,
  ChevronRight, BrainCircuit, Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

// --- Types ---
type QueueItem = {
  id: string;
  name: string;
  status: "active" | "waiting" | "completed" | "failed" | "processing";
  time: string;
  result?: any;
};

// --- Animations ---
const springTransition = { type: "spring" as const, stiffness: 200, damping: 20 };
const stagger = {
  animate: { transition: { staggerChildren: 0.05 } }
};
const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: springTransition }
};

export default function OmniFlowDashboard() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { data: session } = useSession();

  // Polling mechanism
  useEffect(() => {
    const activeJobs = queue.filter(q => ['active', 'waiting', 'processing'].includes(q.status));
    if (activeJobs.length === 0) return;

    const interval = setInterval(() => {
      activeJobs.forEach(async (job) => {
        try {
          const res = await fetch(`/api/job/${job.id}`);
          if (res.ok) {
            const data = await res.json();
            setQueue(prev => prev.map(q => 
              q.id === data.id 
                ? { ...q, status: data.status, result: data.result } 
                : q
            ));
          }
        } catch (error) {
          console.error("Polling error for job", job.id, error);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [queue]);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("content", file);

      const tempId = `tmp-${Date.now()}`;
      setQueue(prev => [{ id: tempId, name: file.name, status: "waiting", time: "Just now" }, ...prev]);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      setIsUploading(false);

      if (res.status === 429) {
        alert("Rate limit exceeded. Please try again in a minute.");
        setQueue(prev => prev.filter(q => q.id !== tempId));
        return;
      }
      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      
      setQueue(prev => prev.map(q => 
        q.id === tempId 
          ? { ...q, id: data.jobId, status: "active" } 
          : q
      ));

    } catch (error) {
      setIsUploading(false);
      console.error(error);
      alert("Failed to upload document.");
    }
  };

  return (
    <div 
      className="flex h-[100dvh] w-full bg-zinc-950 text-zinc-50 font-sans overflow-hidden"
      onDragEnter={() => setIsDraggingGlobal(true)}
    >
      {/* --- Sidebar --- */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={springTransition}
        className="w-64 border-r border-white/5 bg-zinc-950/50 flex flex-col hidden md:flex backdrop-blur-xl"
      >
        <div className="h-14 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-100">OmniFlow</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <div className="px-3 text-xs font-medium text-zinc-500 mb-2 mt-4 tracking-wider uppercase">Platform</div>
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-100 bg-white/10 rounded-lg transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-colors">
            <Workflow className="w-4 h-4" /> Workflows
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-colors">
            <KeyRound className="w-4 h-4" /> API Keys
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
        
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 rounded-full border border-white/10">
              <AvatarImage src={session?.user?.image || "https://github.com/shadcn.png"} alt={session?.user?.name || "@admin"} />
              <AvatarFallback className="bg-zinc-800 text-xs">{session?.user?.name?.substring(0, 2).toUpperCase() || "AD"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-zinc-200">{session?.user?.name || "Admin User"}</span>
              <span className="text-[10px] text-zinc-500">{session?.user?.email || "Enterprise Plan"}</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Top Header */}
        <header className="h-14 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Platform</span>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
            <span className="text-zinc-100">Overview</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search documents..." 
                className="h-8 w-64 bg-zinc-900 border border-white/10 rounded-full pl-9 pr-4 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all group-hover:bg-zinc-800/80"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <Command className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] text-zinc-500 font-mono">K</span>
              </div>
            </div>
            <button className="text-zinc-400 hover:text-zinc-100 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <motion.div 
            className="max-w-[1200px] mx-auto flex flex-col gap-8"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {/* Page Header */}
            <motion.div variants={fadeInUp}>
              <h1 className="text-5xl md:text-6xl tracking-tighter font-bold text-white leading-[1.1] mb-6">
                Your complete platform for AI workflows.
              </h1>
              <p className="text-[#a1a1aa] text-lg leading-relaxed max-w-[550px] mb-10 tracking-tight">
                OmniFlow provides the developer experience and infrastructure to build, preview, and ship intelligent document pipelines at the global edge.
              </p>
              
              <div className="flex items-center gap-4 mb-12">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-zinc-100 text-black text-sm font-medium px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all"
                >
                  Start Deploying
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-transparent border border-white/10 hover:bg-white/5 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all"
                >
                  Get a Demo
                </motion.button>
              </div>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleUpload(e.target.files[0]);
                  }
                }}
              />
            </motion.div>

            {/* Metrics Row (Bento) */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Processed Documents", value: "2,845", trend: "+12.5%", color: "text-emerald-400" },
                { label: "Average Latency", value: "1.2s", trend: "-0.4s", color: "text-emerald-400" },
                { label: "Success Rate", value: "99.8%", trend: "+0.1%", color: "text-emerald-400" },
                { label: "Active Workers", value: "3", trend: "Optimal", color: "text-blue-400" }
              ].map((metric, i) => (
                <Card key={i} className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                  <CardContent className="p-5 flex flex-col gap-2">
                    <span className="text-xs font-medium text-zinc-400">{metric.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold tracking-tight text-zinc-100">{metric.value}</span>
                      <span className={`text-[10px] font-medium ${metric.color}`}>{metric.trend}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Split Section */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Recent Data Table */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-200">Recent Extractions</h3>
                  <button className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors">View all</button>
                </div>
                
                <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-zinc-500 bg-zinc-900/50 border-b border-white/5 uppercase font-medium">
                        <tr>
                          <th className="px-4 py-3 font-medium">Document</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Time</th>
                          <th className="px-4 py-3 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {/* Map over completed/failed queue items, plus a few mocks for UI depth */}
                        {queue.filter(q => ['completed', 'failed'].includes(q.status)).concat([
                          { id: "mock-1", name: "Q2_Financials.pdf", status: "completed", time: "1h ago" },
                          { id: "mock-2", name: "Vendor_Agreement.docx", status: "completed", time: "3h ago" },
                        ]).slice(0, 5).map((item, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-4 py-3 font-medium text-zinc-200 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-zinc-500" />
                              <span className="truncate max-w-[200px] sm:max-w-[300px]">{item.name}</span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={`text-[10px] font-medium uppercase tracking-wider ${
                                item.status === 'completed' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' :
                                'border-rose-500/20 text-rose-400 bg-rose-500/10'
                              }`}>
                                {item.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-zinc-500 text-xs">{item.time}</td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => item.result && setSelectedResult(item.result)}
                                className="text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all p-1"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {queue.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-zinc-500 text-xs">
                              No recent extractions.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Right Column: Live Pipeline Feed */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                    {queue.some(q => ['active', 'processing', 'waiting'].includes(q.status)) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-zinc-600" />
                    )}
                    Active Pipeline
                  </h3>
                </div>

                <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm h-[400px] flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-2">
                    {queue.filter(q => ['active', 'processing', 'waiting'].includes(q.status)).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                        <Activity className="w-8 h-8 text-zinc-600 mb-3" />
                        <p className="text-xs text-zinc-400">Queue is idle.</p>
                      </div>
                    ) : (
                      <ul className="flex flex-col gap-2 p-2">
                        <AnimatePresence initial={false}>
                          {queue.filter(q => ['active', 'processing', 'waiting'].includes(q.status)).map((item) => (
                            <motion.li
                              key={item.id}
                              initial={{ opacity: 0, height: 0, scale: 0.95 }}
                              animate={{ opacity: 1, height: 'auto', scale: 1 }}
                              exit={{ opacity: 0, height: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="p-3 rounded-lg border border-white/5 bg-zinc-900/80 flex flex-col gap-2"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-xs font-medium text-zinc-200 truncate">{item.name}</span>
                                <Badge variant="outline" className="border-blue-500/20 text-blue-400 bg-blue-500/10 text-[9px] uppercase">
                                  {item.status}
                                </Badge>
                              </div>
                              <Progress value={item.status === 'processing' || item.status === 'active' ? 70 : 30} className="h-1 bg-zinc-800" />
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </div>
                </Card>
              </div>

            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* --- Global Drag & Drop Overlay --- */}
      <AnimatePresence>
        {isDraggingGlobal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm"
            onDragLeave={() => setIsDraggingGlobal(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingGlobal(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleUpload(e.dataTransfer.files[0]);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="w-full max-w-2xl h-[400px] border-2 border-dashed border-blue-500/50 rounded-3xl bg-blue-500/5 flex flex-col items-center justify-center gap-4 pointer-events-none">
              <div className="h-20 w-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                <UploadCloud className="w-8 h-8 text-blue-400 animate-bounce" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Drop document to process</h2>
              <p className="text-blue-400/80">OmniFlow will automatically route to Gemini 3.6</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Result Modal Overlay --- */}
      <AnimatePresence>
        {selectedResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={springTransition}
              className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-zinc-200">Structured Extraction Data</span>
                </div>
                <button 
                  onClick={() => setSelectedResult(null)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-auto flex-1 bg-zinc-950">
                <pre className="text-xs text-zinc-300 font-mono leading-relaxed">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(selectedResult), null, 2);
                    } catch {
                      return selectedResult;
                    }
                  })()}
                </pre>
              </div>
              <div className="p-4 border-t border-white/5 bg-zinc-900 flex justify-end">
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigator.clipboard.writeText(selectedResult)}
                  className="text-xs font-medium bg-zinc-100 text-zinc-900 px-4 py-2 rounded-md hover:bg-white transition-colors"
                >
                  Copy to Clipboard
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
