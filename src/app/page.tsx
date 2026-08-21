"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Code, Zap, Database, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-4 h-4 text-white fill-current" />
          </div>
          <span className="font-bold text-xl tracking-tight">OmniFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-5 h-9 text-sm font-medium transition-all">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl">
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
              <SparkleIcon />
              <span>OmniFlow V1.0 is now live</span>
            </motion.div>
            
            <motion.variants={fadeInUp}>
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-8 leading-[1.1]">
                Extract unstructured data with AI.
              </h1>
            </motion.variants>
            
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-zinc-400 leading-relaxed mb-10 max-w-3xl mx-auto tracking-tight">
              Turn PDFs, Word docs, and messy text into clean, structured JSON instantly. Built for developers with a powerful API, SDK, and Webhooks.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 text-base font-semibold transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]">
                  Start Building Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full px-8 h-12 text-base font-semibold transition-all backdrop-blur-sm">
                  Read Documentation
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Dashboard Preview Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 w-full max-w-5xl rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl p-2 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10 pointer-events-none" />
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
              alt="Dashboard Preview" 
              className="w-full h-auto rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-700 grayscale mix-blend-luminosity"
            />
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 md:px-12 border-t border-white/5 bg-zinc-950/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need to scale</h2>
              <p className="text-zinc-400 text-lg">Powerful primitives designed for modern engineering teams.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<Code className="w-6 h-6 text-blue-400" />}
                title="TypeScript SDK"
                description="Integrate OmniFlow into your Next.js or Node application with a single line of code. Fully typed, zero friction."
              />
              <FeatureCard 
                icon={<Database className="w-6 h-6 text-emerald-400" />}
                title="Dynamic Schemas"
                description="Pass custom Zod-like JSON schemas per request to instruct the AI exactly how to structure the output data."
              />
              <FeatureCard 
                icon={<Lock className="w-6 h-6 text-indigo-400" />}
                title="Enterprise Security"
                description="O(1) hashed API keys, encrypted database storage, and immediate deletion of documents post-processing."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 px-6 md:px-12 border-t border-white/5">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-zinc-400 text-lg mb-16">Pay only for what you process. No monthly commitments.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
              <div className="p-8 rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-2">Hobby</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold">$0</span>
                </div>
                <p className="text-sm text-zinc-400 mb-6">Perfect for testing and small personal projects.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100 Free Credits on sign up</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> API Access</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Community Support</li>
                </ul>
                <Link href="/login">
                  <Button className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl h-11 font-semibold">Get Started</Button>
                </Link>
              </div>
              
              <div className="p-8 rounded-3xl border border-blue-500/30 bg-blue-500/5 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">Popular</div>
                <h3 className="text-2xl font-bold mb-2 text-blue-400">Pay-as-you-go</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold">$10</span>
                  <span className="text-zinc-400">/ 1000 credits</span>
                </div>
                <p className="text-sm text-zinc-400 mb-6">For production applications and heavy usage.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-blue-400" /> 10 credits per extraction</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-blue-400" /> High-priority queues</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Dedicated Webhooks</li>
                </ul>
                <Link href="/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold">Buy Credits</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 md:px-12 text-center text-sm text-zinc-500">
        <p>© 2026 OmniFlow Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
