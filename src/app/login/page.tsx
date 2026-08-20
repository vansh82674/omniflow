"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Mail, ArrowRight, Command } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 flex items-center justify-center overflow-hidden font-sans text-zinc-50">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center z-10"
          >
            <motion.div 
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)] mb-6"
            >
              <BrainCircuit className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl font-bold tracking-tighter text-white"
            >
              OmniFlow
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-zinc-400 mt-2 text-sm tracking-tight"
            >
              Enterprise AI Workflows.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="w-full max-w-105 px-6 z-10"
          >
            <div className="flex flex-col items-center mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">Welcome back</h2>
              <p className="text-sm text-zinc-400 text-center">
                Enter your details to sign in to your workspace.
              </p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-300">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="nexus@omniflow.dev" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">Password</label>
                    <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                
                {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}

                <button 
                  type="submit"
                  className="w-full bg-white hover:bg-zinc-200 text-black font-medium rounded-lg px-4 py-2.5 mt-2 transition-colors flex items-center justify-center gap-2 group text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-xs text-zinc-500 font-medium">OR CONTINUE WITH</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => signIn("github", { callbackUrl: "/dashboard" })} className="flex items-center justify-center gap-2 bg-zinc-950/50 hover:bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 transition-colors text-sm text-zinc-300">
                  <Command className="w-4 h-4" />
                  GitHub
                </button>
                <button type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="flex items-center justify-center gap-2 bg-zinc-950/50 hover:bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 transition-colors text-sm text-zinc-300">
                  <Mail className="w-4 h-4" />
                  Google
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-zinc-500 mt-8">
              By signing in, you agree to our <a href="#" className="text-zinc-300 hover:text-white transition-colors underline underline-offset-2">Terms of Service</a> and <a href="#" className="text-zinc-300 hover:text-white transition-colors underline underline-offset-2">Privacy Policy</a>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
