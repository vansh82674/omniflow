"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Settings,
  FileText,
  X
} from "lucide-react";

// --- Types ---
type QueueItem = {
  id: string;
  name: string;
  status: "active" | "waiting" | "completed" | "failed" | "processing";
  time: string;
  result?: any;
};

// --- Components ---

function DropZone({ onUpload }: { onUpload: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsUploading(true);
    await onUpload(file);
    setIsUploading(false);
  };

  return (
    <motion.div
      className={`relative w-full rounded-2xl border transition-colors duration-200 ease-out flex flex-col items-center justify-center p-10 overflow-hidden cursor-pointer ${
        isDragging 
          ? "border-blue-500 bg-blue-500/5" 
          : "border-zinc-800 border-dashed bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-700"
      }`}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFile(e.dataTransfer.files[0]);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => fileInputRef.current?.click()}
      whileTap={{ scale: 0.985 }}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
      />
      
      <div className="flex flex-col items-center gap-4 text-center z-10">
        <div className="h-12 w-12 rounded-full bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50">
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          ) : (
            <UploadCloud className="w-5 h-5 text-zinc-400" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-200">
            {isUploading ? "Uploading..." : "Upload documents"}
          </h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-[260px]">
            Drag and drop your files here, or click to browse. Supports PDF, DOCX, and TXT.
          </p>
        </div>
        <motion.button 
          className="mt-2 text-xs font-medium bg-white text-black px-4 py-2 rounded-full flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={isUploading}
        >
          Select Files
        </motion.button>
      </div>
      
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-blue-500/10 blur-3xl pointer-events-none rounded-full"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function QueueFeed({ queue, onSelect }: { queue: QueueItem[], onSelect: (result: any) => void }) {
  const activeCount = queue.filter(q => ['active', 'waiting', 'processing'].includes(q.status)).length;

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-900 relative">
      <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
          {activeCount > 0 ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-zinc-600" />
          )}
          Active Pipeline
        </h3>
        <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {queue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
            <FileText className="w-8 h-8 text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-400">Queue is empty.</p>
            <p className="text-xs text-zinc-500 mt-1">Upload a document to begin AI extraction.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {queue.map((item) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, height: 0, scale: 0.9 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="group relative p-4 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors flex items-start gap-4"
                >
                  <div className="mt-0.5">
                    {['active', 'waiting', 'processing'].includes(item.status) && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                    {item.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {item.status === "failed" && <AlertCircle className="w-4 h-4 text-rose-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500 capitalize font-mono">
                        {item.id}
                      </span>
                      <span className="text-[10px] text-zinc-600">•</span>
                      <span className="text-xs text-zinc-500 capitalize">{item.status}</span>
                    </div>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-zinc-800 rounded-md"
                    onClick={() => {
                      if (item.result) onSelect(item.result);
                    }}
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </motion.button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

// --- Main Layout ---

export default function OmniFlowDashboard() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

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
      const formData = new FormData();
      formData.append("content", file);

      const tempId = `tmp-${Date.now()}`;
      setQueue(prev => [{ id: tempId, name: file.name, status: "waiting", time: "Just now" }, ...prev]);

      const res = await fetch("/api/upload", { method: "POST", body: formData });

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
      console.error(error);
      alert("Failed to upload document.");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex flex-col md:flex-row font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Left Panel: Hero & Upload */}
      <div className="flex-1 p-6 md:p-12 lg:p-20 flex flex-col justify-center max-w-4xl mx-auto md:mx-0 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="max-w-xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Gemini 3.6 Flash Engine Active</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl tracking-tighter font-semibold text-zinc-100 leading-[1.1] mb-5">
            Automate your complex document workflows.
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed max-w-[500px] mb-12">
            OmniFlow extracts, classifies, and routes unstructured data into your enterprise systems. Upload a batch to begin processing.
          </p>
          
          <DropZone onUpload={handleUpload} />
        </motion.div>
      </div>

      {/* Right Panel: Live Queue */}
      <div className="w-full md:w-[400px] lg:w-[480px] shrink-0 border-t md:border-t-0 md:border-l border-zinc-900 z-10">
        <QueueFeed queue={queue} onSelect={(res) => setSelectedResult(res)} />
      </div>

      {/* Result Modal Overlay */}
      <AnimatePresence>
        {selectedResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ ease: [0.23, 1, 0.32, 1], duration: 0.4 }}
              className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-zinc-200">Structured Extraction Data</span>
                </div>
                <button 
                  onClick={() => setSelectedResult(null)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
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
              <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end">
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedResult);
                  }}
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
