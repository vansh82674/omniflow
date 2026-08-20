"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Settings
} from "lucide-react";

// --- Mock Data ---

type QueueItem = {
  id: string;
  name: string;
  status: "processing" | "completed" | "failed";
  time: string;
};

const INITIAL_QUEUE: QueueItem[] = [
  { id: "wk-001", name: "Q3_Financial_Report.pdf", status: "completed", time: "2m ago" },
  { id: "wk-002", name: "Vendor_Contracts_Q3.zip", status: "processing", time: "Just now" },
  { id: "wk-003", name: "Employee_Handbook_Draft.docx", status: "failed", time: "5m ago" },
];

// --- Components ---

function DropZone() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      className={`relative w-full rounded-2xl border transition-colors duration-200 ease-out flex flex-col items-center justify-center p-10 overflow-hidden ${
        isDragging 
          ? "border-blue-500 bg-blue-500/5" 
          : "border-zinc-800 border-dashed bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-700"
      }`}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      whileTap={{ scale: 0.985 }}
    >
      <div className="flex flex-col items-center gap-4 text-center z-10">
        <div className="h-12 w-12 rounded-full bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50">
          <UploadCloud className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-200">Upload documents</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-[260px]">
            Drag and drop your files here, or click to browse. Supports PDF, DOCX, and ZIP.
          </p>
        </div>
        <motion.button 
          className="mt-2 text-xs font-medium bg-white text-black px-4 py-2 rounded-full flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Select Files
        </motion.button>
      </div>
      
      {/* Decorative background blur when dragging */}
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

function QueueFeed() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-900">
      <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
          Active Pipeline
        </h3>
        <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <ul className="flex flex-col gap-2">
          {INITIAL_QUEUE.map((item, index) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 + 0.3, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="group relative p-4 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors flex items-start gap-4"
            >
              <div className="mt-0.5">
                {item.status === "processing" && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
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
                  <span className="text-xs text-zinc-500">{item.time}</span>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-zinc-800 rounded-md"
              >
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function OmniFlowDashboard() {
  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex flex-col md:flex-row font-sans selection:bg-blue-500/30">
      {/* Left Panel: Hero & Upload */}
      <div className="flex-1 p-6 md:p-12 lg:p-20 flex flex-col justify-center max-w-4xl mx-auto md:mx-0 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="max-w-xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Gemini 1.5 Pro Engine Active</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl tracking-tighter font-semibold text-zinc-100 leading-[1.1] mb-5">
            Automate your complex document workflows.
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed max-w-[500px] mb-12">
            OmniFlow extracts, classifies, and routes unstructured data into your enterprise systems. Upload a batch to begin processing.
          </p>
          
          <DropZone />
        </motion.div>
      </div>

      {/* Right Panel: Live Queue */}
      <div className="w-full md:w-[400px] lg:w-[480px] shrink-0 border-t md:border-t-0 md:border-l border-zinc-900">
        <QueueFeed />
      </div>
    </div>
  );
}
