"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, Loader2, ArrowRight,
  Sparkles, FileText, X,
  Search, Bell, Command,
  ChevronRight, Activity,
  AlertCircle, CheckCircle2, Clock, TrendingUp, Settings2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Script from "next/script";

import Link from "next/link";
import { toast } from "sonner";

// --- Types ---
type QueueItem = {
  id: string;
  name: string;
  status: "active" | "waiting" | "completed" | "failed" | "processing";
  time: string;
  result?: string;
  fileType?: string;
};

type Metrics = {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  recentJobs: number;
  successRate: string;
  credits?: number;
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

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}


export default function OmniFlowDashboard() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [historyJobs, setHistoryJobs] = useState<QueueItem[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [extractionSchema, setExtractionSchema] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track active job IDs in a ref
  const activeJobIdsRef = useRef<Set<string>>(new Set());

  // SSE connection reference
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch metrics and job history on mount
  const fetchDashboardData = useCallback(async () => {
    try {
      const [metricsRes, jobsRes] = await Promise.all([
        fetch("/api/metrics"),
        fetch("/api/jobs"),
      ]);
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }
      if (jobsRes.ok) {
        const jobs = await jobsRes.json();
        // Completed/failed jobs go to history
        const finished = jobs
          .filter((j: { status: string }) => ["completed", "failed"].includes(j.status))
          .map((j: { id: string; filename: string; status: string; createdAt: string; result?: string; fileType?: string }) => ({
            id: j.id,
            name: j.filename,
            status: j.status as QueueItem["status"],
            time: timeAgo(j.createdAt),
            result: j.result,
            fileType: j.fileType,
          }));
        setHistoryJobs(finished);

        // Active/waiting jobs go into the live queue
        const active = jobs
          .filter((j: { status: string }) => ["waiting", "active"].includes(j.status))
          .map((j: { id: string; filename: string; status: string; createdAt: string }) => ({
            id: j.id,
            name: j.filename,
            status: j.status as QueueItem["status"],
            time: timeAgo(j.createdAt),
          }));
        setQueue(prev => {
          // Only add jobs from DB that aren't already in local queue
          const existingIds = new Set(prev.map(q => q.id));
          const newJobs = active.filter((a: { id: string }) => !existingIds.has(a.id));
          return [...prev.filter(q => ["active", "waiting", "processing"].includes(q.status)), ...newJobs];
        });
      }
    } catch {
      // Silent fail for background refresh
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Use SSE instead of polling
  useEffect(() => {
    eventSourceRef.current = new EventSource("/api/jobs/stream");

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          // data is an array of latest jobs from DB
          const finished = data
            .filter((j: { status: string }) => ["completed", "failed"].includes(j.status))
            .map((j: { id: string; filename: string; status: string; createdAt: string; result?: string; fileType?: string }) => ({
              id: j.id,
              name: j.filename,
              status: j.status as QueueItem["status"],
              time: timeAgo(j.createdAt),
              result: j.result,
              fileType: j.fileType,
            }));

          const active = data
            .filter((j: { status: string }) => ["waiting", "active"].includes(j.status))
            .map((j: { id: string; filename: string; status: string; createdAt: string }) => ({
              id: j.id,
              name: j.filename,
              status: j.status as QueueItem["status"],
              time: timeAgo(j.createdAt),
            }));

          // Process transitions for toasts
          setQueue(prev => {
            const prevIds = new Set(prev.map(p => p.id));
            const newFinished = finished.filter((f: QueueItem) => prevIds.has(f.id));
            
            newFinished.forEach((j: QueueItem) => {
              if (j.status === "completed") toast.success(`Extraction complete: ${j.name}`);
              if (j.status === "failed") toast.error(`Extraction failed: ${j.name}`);
            });

            return active;
          });

          setHistoryJobs(finished);
        }
      } catch {
        // Init or non-json message
      }
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleUpload = async (file: File) => {
    if (isUploading) return;
    setIsUploading(true);

    const tempId = `tmp-${Date.now()}`;
    setQueue(prev => [
      { id: tempId, name: file.name, status: "waiting", time: "just now" },
      ...prev
    ]);

    try {
      const formData = new FormData();
      formData.append("content", file);
      if (webhookUrl) formData.append("webhookUrl", webhookUrl);
      if (extractionSchema) formData.append("extractionSchema", extractionSchema);

      const res = await fetch("/api/upload", { method: "POST", body: formData });

      if (res.status === 429) {
        toast.error("Rate limit exceeded. Please wait a minute before uploading again.");
        setQueue(prev => prev.filter(q => q.id !== tempId));
        return;
      }
      if (res.status === 401) {
        toast.error("Session expired. Please sign in again.");
        setQueue(prev => prev.filter(q => q.id !== tempId));
        return;
      }
      if (res.status === 400 || res.status === 422) {
        const data = await res.json();
        toast.error(data.error || "Invalid file.");
        setQueue(prev => prev.filter(q => q.id !== tempId));
        return;
      }
      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      // Replace temp ID with real DB job ID and start tracking
      setQueue(prev =>
        prev.map(q => q.id === tempId ? { ...q, id: data.jobId, status: "active" } : q)
      );
      activeJobIdsRef.current.add(data.jobId);
      toast.success(`${file.name} queued for extraction.`);
    } catch {
      toast.error("Failed to upload document. Please try again.");
      setQueue(prev => prev.filter(q => q.id !== tempId));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleBuyCredits = async () => {
    try {
      const res = await fetch("/api/razorpay/order", { method: "POST" });
      const data = await res.json();
      if (data.order) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "OmniFlow",
          description: "Purchase 1000 Credits",
          order_id: data.order.id,
          handler: function () {
            toast.success("Payment successful! Credits will be updated shortly.");
            // Refresh metrics after a short delay
            setTimeout(fetchDashboardData, 2000);
          },
          theme: {
            color: "#2563eb"
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          toast.error("Payment failed: " + response.error.description);
        });
        rzp.open();
      } else {
        toast.error("Failed to initialize checkout.");
      }
    } catch {
      toast.error("Failed to connect to billing server.");
    }
  };

  const metricCards = metrics
    ? [
        {
          label: "Documents Processed",
          value: metrics.completedJobs.toLocaleString(),
          sub: `${metrics.recentJobs} in last 24h`,
          color: "text-emerald-400",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "Success Rate",
          value: metrics.successRate,
          sub: `${metrics.failedJobs} failed total`,
          color: metrics.failedJobs > 0 ? "text-amber-400" : "text-emerald-400",
          icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "Total Jobs",
          value: metrics.totalJobs.toLocaleString(),
          sub: "all time",
          color: "text-blue-400",
          icon: <Activity className="w-4 h-4 text-blue-400" />,
        },
        {
          label: "Active Pipeline",
          value: queue.filter(q => ["active", "waiting", "processing"].includes(q.status)).length.toString(),
          sub: "processing now",
          color: "text-blue-400",
          icon: <Loader2 className={`w-4 h-4 text-blue-400 ${queue.some(q => ["active", "waiting"].includes(q.status)) ? "animate-spin" : ""}`} />,
        },
      ]
    : [
        { label: "Documents Processed", value: "—", sub: "loading...", color: "text-zinc-500", icon: null },
        { label: "Success Rate", value: "—", sub: "loading...", color: "text-zinc-500", icon: null },
        { label: "Total Jobs", value: "—", sub: "loading...", color: "text-zinc-500", icon: null },
        { label: "Active Pipeline", value: "—", sub: "loading...", color: "text-zinc-500", icon: null },
      ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-blue-500/30">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

        {/* Top Header */}
        <header className="h-14 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Platform</span>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
            <span className="text-zinc-100">Overview</span>
          </div>
          <div className="flex items-center gap-4">
            {metrics !== null && (
              <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-full px-3 py-1">
                <span className="text-xs font-medium text-zinc-400">Credits:</span>
                <span className="text-xs font-bold text-zinc-100">{metrics.credits ?? 0}</span>
                <button onClick={handleBuyCredits} className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-2 py-0.5 rounded-full transition-colors">
                  Top Up
                </button>
              </div>
            )}
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
            className="max-w-300 mx-auto flex flex-col gap-8"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {/* Page Header */}
            <motion.div variants={fadeInUp}>
              <h1 className="text-5xl md:text-6xl tracking-tighter font-bold text-white leading-[1.1] mb-6">
                Your complete platform for AI workflows.
              </h1>
              <p className="text-[#a1a1aa] text-lg leading-relaxed max-w-137.5 mb-10 tracking-tight">
                OmniFlow provides the developer experience and infrastructure to build, preview, and ship intelligent document pipelines at the global edge.
              </p>

              <div className="flex items-center gap-4 mb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-white hover:bg-zinc-100 text-black text-sm font-medium px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isUploading ? "Uploading..." : "Start Deploying"}
                </motion.button>
                <Link href="/dashboard/workflows">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-transparent border border-white/10 hover:bg-white/5 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all"
                  >
                    View Workflows
                  </motion.button>
                </Link>
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2 text-sm ml-2"
                >
                  <Settings2 className="w-4 h-4" />
                  Advanced Options
                </button>
              </div>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-10 overflow-hidden"
                  >
                    <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl flex flex-col gap-4 max-w-137.5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-zinc-400">Webhook URL (Optional)</label>
                        <input 
                          type="url" 
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://api.yourdomain.com/webhook"
                          className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                        />
                        <p className="text-[10px] text-zinc-500">We will POST the extraction result to this URL upon completion.</p>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-zinc-400">Custom Extraction Schema (JSON Optional)</label>
                        <textarea 
                          value={extractionSchema}
                          onChange={(e) => setExtractionSchema(e.target.value)}
                          placeholder='{ "type": "OBJECT", "properties": { "invoiceNumber": { "type": "STRING" } } }'
                          className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors h-24 font-mono resize-none"
                        />
                        <p className="text-[10px] text-zinc-500">Define a custom Zod-like JSON schema to override the default extraction fields.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept=".txt,.pdf,.docx,.doc,.md,.csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleUpload(e.target.files[0]);
                  }
                }}
              />
            </motion.div>

            {/* Metrics Row (Real Data) */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metricCards.map((metric, i) => (
                <Card key={i} className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                  <CardContent className="p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400">{metric.label}</span>
                      {metric.icon}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold tracking-tight text-zinc-100">{metric.value}</span>
                    </div>
                    <span className={`text-[10px] font-medium ${metric.color}`}>{metric.sub}</span>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Split Section */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left: Real Job History */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-200">Recent Extractions</h3>
                  <button
                    onClick={fetchDashboardData}
                    className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
                  >
                    Refresh
                  </button>
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
                        {historyJobs.slice(0, 8).map((item, i) => (
                          <tr key={`${item.id}-${i}`} className="hover:bg-white/2 transition-colors group">
                            <td className="px-4 py-3 font-medium text-zinc-200">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                                <span className="truncate max-w-50 sm:max-w-75">{item.name}</span>
                                {item.fileType && (
                                  <span className="text-[9px] text-zinc-600 uppercase border border-zinc-700 rounded px-1">
                                    {item.fileType}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-medium uppercase tracking-wider ${
                                  item.status === "completed"
                                    ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/10"
                                    : "border-rose-500/20 text-rose-400 bg-rose-500/10"
                                }`}
                              >
                                {item.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-zinc-500 text-xs">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.time}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {item.result && (
                                <button
                                  onClick={() => item.result && setSelectedResult(item.result)}
                                  className="text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all p-1"
                                  title="View extraction result"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {historyJobs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-10 text-center text-zinc-500 text-xs">
                              <div className="flex flex-col items-center gap-2">
                                <FileText className="w-6 h-6 text-zinc-700" />
                                <span>No documents processed yet. Upload your first file above.</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Right: Live Pipeline Feed */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                    {queue.some(q => ["active", "processing", "waiting"].includes(q.status)) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-zinc-600" />
                    )}
                    Active Pipeline
                  </h3>
                  <span className="text-xs text-zinc-500">
                    {queue.filter(q => ["active", "waiting", "processing"].includes(q.status)).length} job(s)
                  </span>
                </div>

                <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm h-100 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-2">
                    {queue.filter(q => ["active", "processing", "waiting"].includes(q.status)).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                        <Activity className="w-8 h-8 text-zinc-600 mb-3" />
                        <p className="text-xs text-zinc-400">Queue is idle.</p>
                        <p className="text-xs text-zinc-600 mt-1">Drop a file to begin.</p>
                      </div>
                    ) : (
                      <ul className="flex flex-col gap-2 p-2">
                        <AnimatePresence initial={false}>
                          {queue
                            .filter(q => ["active", "processing", "waiting"].includes(q.status))
                            .map((item) => (
                              <motion.li
                                key={item.id}
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="p-3 rounded-lg border border-white/5 bg-zinc-900/80 flex flex-col gap-2"
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <span className="text-xs font-medium text-zinc-200 truncate">{item.name}</span>
                                  <Badge
                                    variant="outline"
                                    className="border-blue-500/20 text-blue-400 bg-blue-500/10 text-[9px] uppercase shrink-0"
                                  >
                                    {item.status}
                                  </Badge>
                                </div>
                                <Progress
                                  value={item.status === "processing" || item.status === "active" ? 65 : 20}
                                  className="h-1 bg-zinc-800"
                                />
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
            <div className="w-full max-w-2xl h-100 border-2 border-dashed border-blue-500/50 rounded-3xl bg-blue-500/5 flex flex-col items-center justify-center gap-4 pointer-events-none">
              <div className="h-20 w-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                <UploadCloud className="w-8 h-8 text-blue-400 animate-bounce" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Drop document to process</h2>
              <p className="text-blue-400/80">Supports PDF, DOCX, TXT, MD, CSV — up to 10MB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Result Modal --- */}
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
                  <span className="text-sm font-medium text-zinc-200">Structured Extraction Result</span>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Parsed field view */}
              <div className="p-4 overflow-auto flex-1 bg-zinc-950">
                {(() => {
                  try {
                    const parsed = JSON.parse(selectedResult || "{}");
                    return (
                      <div className="flex flex-col gap-4">
                        {Object.entries(parsed).map(([key, value]) => (
                          <div key={key} className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                              {key.replace(/_/g, " ")}
                            </span>
                            {Array.isArray(value) ? (
                              <div className="flex flex-wrap gap-2">
                                {(value as string[]).map((v, i) => (
                                  <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full border border-white/5">
                                    {v}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-zinc-200 leading-relaxed">{String(value)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  } catch {
                    return (
                      <pre className="text-xs text-zinc-300 font-mono leading-relaxed">
                        {selectedResult}
                      </pre>
                    );
                  }
                })()}
              </div>

              <div className="p-4 border-t border-white/5 bg-zinc-900 flex items-center justify-between">
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" /> Close
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedResult || "");
                    toast.success("Copied to clipboard!");
                  }}
                  className="text-xs font-medium bg-zinc-100 text-zinc-900 px-4 py-2 rounded-md hover:bg-white transition-colors"
                >
                  Copy JSON
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
