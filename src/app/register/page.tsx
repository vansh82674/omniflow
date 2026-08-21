"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to register. Please try again.");
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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

      <div className="z-10 w-full max-w-md p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-blue-400">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create an account</h1>
          <p className="text-sm text-zinc-400">Sign up for OmniFlow to get started.</p>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-xl border border-emerald-500/20 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Check your email</h2>
              <p className="text-zinc-400 mb-6 text-sm">
                We&apos;ve sent a secure verification link to <strong>{email}</strong>. Please click it to verify your account and continue.
              </p>
              <Link href="/login" className="text-blue-400 hover:text-blue-300 hover:underline transition-all text-sm font-medium">
                Back to sign in
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
            >
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400 ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400 ml-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400 ml-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                
                {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-medium rounded-lg px-4 py-2.5 mt-2 transition-colors flex items-center justify-center gap-2 group text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50"
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                  {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-zinc-400">
                Already have an account?{" "}
                <Link href="/login" className="text-white hover:underline transition-all">
                  Sign in
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-zinc-500 mt-8">
          By signing up, you agree to our <a href="#" className="text-zinc-300 hover:text-white transition-colors underline underline-offset-2">Terms of Service</a> and <a href="#" className="text-zinc-300 hover:text-white transition-colors underline underline-offset-2">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
