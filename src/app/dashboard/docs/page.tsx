"use client";

import { motion } from "framer-motion";
import { BookOpen, Terminal, Code2, Zap, ArrowRight, ExternalLink, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const docsSections = [
  {
    title: "Quickstart",
    description: "Get up and running with Omniflow in under 5 minutes.",
    icon: <Zap className="w-7 h-7 text-amber-500" />,
    color: "amber",
    link: "#"
  },
  {
    title: "API Reference",
    description: "Detailed documentation for all Omniflow API endpoints.",
    icon: <Terminal className="w-7 h-7 text-blue-500" />,
    color: "blue",
    link: "#"
  },
  {
    title: "SDKs & Libraries",
    description: "Official clients for Node.js, Python, Go, and more.",
    icon: <Code2 className="w-7 h-7 text-emerald-500" />,
    color: "emerald",
    link: "#"
  },
  {
    title: "Core Concepts",
    description: "Understand the fundamentals of workflows and execution.",
    icon: <BookOpen className="w-7 h-7 text-purple-500" />,
    color: "purple",
    link: "#"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 } 
  }
};

export default function DocsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-screen">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 text-white p-12 md:p-20 mb-16 shadow-2xl group"
      >
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl mix-blend-screen pointer-events-none"
        ></motion.div>
        <motion.div 
          animate={{ rotate: -360 }} 
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-tr from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl mix-blend-screen pointer-events-none"
        ></motion.div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium tracking-wide">Documentation v2.0 is here</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
          >
            Build at <br className="hidden md:block"/> the speed of <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">thought.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-neutral-400 text-xl mb-10 max-w-2xl leading-relaxed"
          >
            Everything you need to build, integrate, and scale with Omniflow. Explore our comprehensive guides, interactive API reference, and SDKs.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Button className="bg-white text-neutral-950 hover:bg-neutral-200 rounded-full px-8 h-14 font-semibold text-lg shadow-xl shadow-white/10 transition-all hover:scale-105">
              Start Building
            </Button>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800 hover:text-white rounded-full px-8 h-14 font-medium text-lg bg-transparent backdrop-blur-md transition-all hover:scale-105">
              View API Reference
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mb-16"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Explore by Topic</h2>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            View all <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {docsSections.map((section, idx) => (
            <motion.a
              key={idx}
              href={section.link}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="group relative flex items-start space-x-6 p-8 rounded-3xl border border-border/50 bg-card hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className={`absolute -inset-[1px] bg-gradient-to-br from-${section.color}-500/0 via-${section.color}-500/0 to-${section.color}-500/0 group-hover:from-${section.color}-500/20 group-hover:via-${section.color}-500/10 rounded-[inherit] -z-10 transition-colors duration-500 opacity-0 group-hover:opacity-100`} />
              
              <div className={`p-4 bg-muted rounded-2xl group-hover:bg-${section.color}-500/10 group-hover:scale-110 transition-all duration-300 shadow-sm`}>
                {section.icon}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-xl flex items-center mb-2 group-hover:text-foreground transition-colors">
                  {section.title}
                  <ArrowRight className="w-5 h-5 ml-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-muted-foreground" />
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">{section.description}</p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-3xl p-10 relative overflow-hidden group hover:shadow-xl transition-shadow duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
          <h3 className="text-2xl font-bold mb-8 relative z-10">Latest Updates</h3>
          <ul className="space-y-8 relative z-10">
            <li className="relative pl-8 before:absolute before:left-0 before:top-2.5 before:w-3 before:h-3 before:bg-emerald-500 before:rounded-full before:shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              <p className="text-sm text-emerald-500 font-semibold uppercase tracking-wider mb-2">Added today</p>
              <h4 className="text-xl font-bold mb-2">New Webhooks API v2</h4>
              <p className="text-base text-muted-foreground leading-relaxed">We've redesigned our webhooks system to be more reliable and easier to integrate. Now supporting strict signature verification.</p>
            </li>
            <li className="relative pl-8 before:absolute before:left-0 before:top-2.5 before:w-3 before:h-3 before:bg-neutral-300 dark:before:bg-neutral-600 before:rounded-full">
              <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-2">Last week</p>
              <h4 className="text-xl font-bold mb-2">Python SDK 2.0</h4>
              <p className="text-base text-muted-foreground leading-relaxed">Major update to our Python SDK with full async support, improved type hints, and better error handling.</p>
            </li>
          </ul>
        </div>
        <div className="bg-card border border-border/50 rounded-3xl p-10 flex flex-col justify-between group hover:shadow-xl transition-shadow duration-500 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-blue-500/10 transition-colors duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Need help?</h3>
            <p className="text-base text-muted-foreground mb-8 leading-relaxed">Can't find what you're looking for? Our elite support team is here to help you debug and scale.</p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative z-10">
            <Button variant="outline" className="w-full rounded-2xl h-14 justify-between group-hover/btn border-border/50 hover:bg-muted text-base font-semibold transition-all">
              Contact Support
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
