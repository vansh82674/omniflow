"use client";

import { motion } from "framer-motion";
import { BookOpen, Terminal, Code2, Zap, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const docsSections = [
  {
    title: "Quickstart",
    description: "Get up and running with Omniflow in under 5 minutes.",
    icon: <Zap className="w-6 h-6 text-amber-500" />,
    link: "#"
  },
  {
    title: "API Reference",
    description: "Detailed documentation for all Omniflow API endpoints.",
    icon: <Terminal className="w-6 h-6 text-blue-500" />,
    link: "#"
  },
  {
    title: "SDKs & Libraries",
    description: "Official clients for Node.js, Python, Go, and more.",
    icon: <Code2 className="w-6 h-6 text-emerald-500" />,
    link: "#"
  },
  {
    title: "Core Concepts",
    description: "Understand the fundamentals of workflows and execution.",
    icon: <BookOpen className="w-6 h-6 text-purple-500" />,
    link: "#"
  }
];

export default function DocsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-10 mb-12 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Documentation</h1>
          <p className="text-neutral-400 text-lg mb-8 max-w-xl">
            Everything you need to build, integrate, and scale with Omniflow. Explore our guides, API reference, and interactive tutorials.
          </p>
          <div className="flex space-x-4">
            <Button className="bg-white text-neutral-900 hover:bg-neutral-200 rounded-full px-6 font-medium">
              Read the Docs
            </Button>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800 rounded-full px-6 bg-transparent">
              View API Reference
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-6">Explore by Topic</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docsSections.map((section, idx) => (
            <motion.a
              key={idx}
              href={section.link}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group flex items-start space-x-5 p-6 rounded-2xl border border-border/50 bg-card hover:border-border hover:shadow-md transition-all cursor-pointer"
            >
              <div className="p-3 bg-muted rounded-xl group-hover:scale-110 transition-transform duration-300">
                {section.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg flex items-center mb-1">
                  {section.title}
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{section.description}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card border border-border/50 rounded-2xl p-8">
          <h3 className="text-xl font-semibold mb-4">Latest Updates</h3>
          <ul className="space-y-6">
            <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
              <p className="text-sm text-emerald-500 font-medium mb-1">Added today</p>
              <h4 className="font-semibold mb-1">New Webhooks API v2</h4>
              <p className="text-sm text-muted-foreground">We've redesigned our webhooks system to be more reliable and easier to integrate. Now supporting signature verification.</p>
            </li>
            <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-neutral-300 before:rounded-full">
              <p className="text-sm text-muted-foreground font-medium mb-1">Last week</p>
              <h4 className="font-semibold mb-1">Python SDK 2.0</h4>
              <p className="text-sm text-muted-foreground">Major update to our Python SDK with full async support and improved type hints.</p>
            </li>
          </ul>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Need help?</h3>
            <p className="text-sm text-muted-foreground mb-6">Can't find what you're looking for? Our support team is here to help.</p>
          </div>
          <Button variant="outline" className="w-full rounded-xl justify-between group">
            Contact Support
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>
        </div>
      </div>
    </div>
  );
}
