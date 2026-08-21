"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`);
        const data = await res.json();
        
        if (res.ok) {
          setStatus("success");
          // Automatically redirect to login after a few seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Failed to verify email.");
        }
      } catch {
        setStatus("error");
        setErrorMessage("An unexpected error occurred.");
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center w-full max-w-md"
    >
      {status === "loading" && (
        <>
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Verifying Email...</h2>
          <p className="text-zinc-400 text-sm">Please wait while we verify your account securely.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Email Verified!</h2>
          <p className="text-zinc-400 text-sm mb-6">Your account has been successfully verified. You will be redirected to the login page momentarily.</p>
          <Link href="/login" className="w-full bg-white hover:bg-zinc-200 text-black font-medium rounded-lg px-4 py-2.5 transition-colors flex items-center justify-center text-sm">
            Continue to Login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Verification Failed</h2>
          <p className="text-zinc-400 text-sm mb-6">{errorMessage}</p>
          <Link href="/login" className="text-blue-400 hover:text-blue-300 hover:underline transition-all text-sm font-medium">
            Back to Sign In
          </Link>
        </>
      )}
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="relative min-h-screen w-full bg-zinc-950 flex items-center justify-center overflow-hidden font-sans text-zinc-50 p-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-md flex justify-center">
        <Suspense fallback={<Loader2 className="w-8 h-8 text-blue-500 animate-spin" />}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
