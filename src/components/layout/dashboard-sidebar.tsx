"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, LayoutDashboard, Key, BookOpen, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { label: "Documentation", href: "/docs", icon: BookOpen },
];

const springTransition = { type: "spring" as const, stiffness: 300, damping: 30 };

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={springTransition}
      className="w-64 border-r border-white/5 bg-zinc-950/50 flex-col hidden md:flex backdrop-blur-xl shrink-0"
    >
      <div className="h-14 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-100">OmniFlow</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        <div className="px-3 text-xs font-medium text-zinc-500 mb-2 mt-4 tracking-wider uppercase">Platform</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                isActive
                  ? "text-zinc-100 bg-white/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 relative">
        <button 
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="w-full flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition-colors text-left"
        >
          <Avatar className="h-8 w-8 rounded-full border border-white/10">
            <AvatarImage
              src={session?.user?.image || "https://i.pravatar.cc/150?u=admin"}
              alt={session?.user?.name || "@admin"}
            />
            <AvatarFallback className="bg-zinc-800 text-xs">
              {session?.user?.name?.substring(0, 2).toUpperCase() || "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-xs font-medium text-zinc-200 truncate">{session?.user?.name || "Admin"}</span>
            <span className="text-[10px] text-zinc-500 truncate">{session?.user?.email || ""}</span>
          </div>
        </button>

        <AnimatePresence>
          {isUserMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-4 mb-2 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="p-3 border-b border-white/5">
                <p className="text-sm font-medium text-white truncate">{session?.user?.name || "Admin"}</p>
                <p className="text-xs text-zinc-400 truncate">{session?.user?.email || ""}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
