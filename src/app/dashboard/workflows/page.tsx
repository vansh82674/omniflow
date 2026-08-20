"use client";

import { motion } from "framer-motion";
import { Plus, Play, Pause, Clock, XCircle, MoreVertical, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const dummyWorkflows = [
  { id: 1, name: "Data Ingestion Pipeline", status: "active", lastRun: "2 mins ago", successRate: 98, duration: "45s" },
  { id: 2, name: "Nightly Backup", status: "paused", lastRun: "12 hours ago", successRate: 100, duration: "12m" },
  { id: 3, name: "Customer Sync", status: "failed", lastRun: "1 hour ago", successRate: 85, duration: "2m 10s" },
  { id: 4, name: "Generate Reports", status: "active", lastRun: "5 mins ago", successRate: 99, duration: "15s" },
  { id: 5, name: "ML Model Training", status: "active", lastRun: "3 hours ago", successRate: 95, duration: "4h 20m" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

import type { Variants } from "framer-motion";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 300, damping: 24 } 
  }
};

export default function WorkflowsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-neutral-100 dark:to-neutral-500">
            Workflows
          </h1>
          <p className="text-muted-foreground mt-2 text-base">Design, manage and monitor your automated processes.</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full px-6 shadow-lg shadow-neutral-900/20 h-11">
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {dummyWorkflows.map((workflow) => (
          <motion.div
            key={workflow.id}
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="group relative bg-card border border-border/40 rounded-3xl p-7 shadow-sm hover:shadow-xl transition-shadow duration-500 cursor-pointer overflow-hidden"
          >
            {/* Glossy hover effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {/* Subtle animated border gradient on hover */}
            <div className="absolute -inset-[1px] bg-gradient-to-br from-emerald-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-emerald-500/20 group-hover:via-blue-500/20 group-hover:to-purple-500/20 rounded-[inherit] -z-10 transition-colors duration-500 opacity-0 group-hover:opacity-100" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl shadow-inner ${workflow.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : workflow.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-neutral-500/10 text-neutral-500'}`}>
                  {workflow.status === 'active' ? <Play className="w-5 h-5" /> : workflow.status === 'failed' ? <XCircle className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </div>
                <h3 className="font-semibold text-lg tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{workflow.name}</h3>
              </div>
              <motion.button 
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted"
              >
                <MoreVertical className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 relative z-10 bg-muted/30 p-4 rounded-2xl border border-border/50 group-hover:bg-muted/50 transition-colors">
              <div className="flex flex-col">
                <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Status</span>
                <span className="text-sm flex items-center capitalize font-medium">
                  {workflow.status === 'active' ? (
                    <><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Active</>
                  ) : workflow.status === 'failed' ? (
                    <><span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Failed</>
                  ) : (
                    <><span className="w-2.5 h-2.5 rounded-full bg-neutral-400 mr-2" /> Paused</>
                  )}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Last Run</span>
                <span className="text-sm font-medium flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  {workflow.lastRun}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Success Rate</span>
                <span className="text-sm font-medium">{workflow.successRate}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Duration</span>
                <span className="text-sm font-medium">{workflow.duration}</span>
              </div>
            </div>
            
            {/* Decorative bottom line */}
            <motion.div 
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500"
              initial={{ width: 0 }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        ))}
        
        {/* Placeholder for creating new */}
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-transparent border-2 border-dashed border-border/60 hover:border-emerald-500/50 rounded-3xl p-7 flex flex-col items-center justify-center text-center transition-colors cursor-pointer min-h-[240px]"
          >
            <div className="p-4 bg-muted group-hover:bg-emerald-500/10 rounded-full mb-4 transition-colors">
              <Settings className="w-6 h-6 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </div>
            <h3 className="font-semibold text-lg text-muted-foreground group-hover:text-foreground transition-colors">Create from template</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">Start with pre-built workflows for common tasks.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
