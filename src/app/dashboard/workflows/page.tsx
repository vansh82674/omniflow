"use client";

import { motion } from "framer-motion";
import { Plus, Play, Pause, Clock, CheckCircle2, XCircle, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

const dummyWorkflows = [
  { id: 1, name: "Data Ingestion Pipeline", status: "active", lastRun: "2 mins ago", successRate: 98, duration: "45s" },
  { id: 2, name: "Nightly Backup", status: "paused", lastRun: "12 hours ago", successRate: 100, duration: "12m" },
  { id: 3, name: "Customer Sync", status: "failed", lastRun: "1 hour ago", successRate: 85, duration: "2m 10s" },
  { id: 4, name: "Generate Reports", status: "active", lastRun: "5 mins ago", successRate: 99, duration: "15s" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function WorkflowsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and monitor your automated processes.</p>
        </div>
        <Button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full px-5">
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {dummyWorkflows.map((workflow) => (
          <motion.div
            key={workflow.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="group relative bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${workflow.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : workflow.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-neutral-500/10 text-neutral-500'}`}>
                  {workflow.status === 'active' ? <Play className="w-4 h-4" /> : workflow.status === 'failed' ? <XCircle className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </div>
                <h3 className="font-medium text-lg">{workflow.name}</h3>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status</span>
                <span className="text-sm flex items-center capitalize font-medium">
                  {workflow.status === 'active' ? (
                    <><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" /> Active</>
                  ) : workflow.status === 'failed' ? (
                    <><span className="w-2 h-2 rounded-full bg-red-500 mr-2" /> Failed</>
                  ) : (
                    <><span className="w-2 h-2 rounded-full bg-neutral-400 mr-2" /> Paused</>
                  )}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Last Run</span>
                <span className="text-sm font-medium flex items-center text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1.5" />
                  {workflow.lastRun}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Success Rate</span>
                <span className="text-sm font-medium">{workflow.successRate}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Duration</span>
                <span className="text-sm font-medium text-muted-foreground">{workflow.duration}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
