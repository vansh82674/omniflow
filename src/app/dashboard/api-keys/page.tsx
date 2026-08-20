"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Plus, Key, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const initialKeys = [
  { id: "key_1", name: "Production Key", key: "sk_live_51MxxxxxxxxxxxxxxxxxxaBcd", created: "Oct 12, 2023", lastUsed: "2 mins ago", type: "live" },
  { id: "key_2", name: "Development Key", key: "sk_test_51MxxxxxxxxxxxxxxxxxxXyZq", created: "Nov 05, 2023", lastUsed: "5 hours ago", type: "test" },
];

export default function ApiKeysPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const handleCopy = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-neutral-100 dark:to-neutral-500">
            API Keys
          </h1>
          <p className="text-muted-foreground mt-2 text-base">Manage API keys for accessing the Omniflow API.</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full px-6 shadow-lg shadow-neutral-900/20 h-11 relative overflow-hidden group">
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Create Secret Key
            </span>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 mb-10 flex items-start space-x-4 text-amber-700 dark:text-amber-400 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
          <ShieldAlert className="w-24 h-24" />
        </div>
        <div className="p-2 bg-amber-500/20 rounded-xl flex-shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="text-sm relative z-10 pt-0.5">
          <p className="font-semibold text-base mb-1">Keep your keys secure</p>
          <p className="opacity-90 leading-relaxed max-w-2xl">Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth. Treat them like passwords.</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden backdrop-blur-xl"
      >
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/30 text-muted-foreground uppercase tracking-widest font-semibold text-[11px] border-b border-border/50">
            <tr>
              <th className="px-8 py-5">Name</th>
              <th className="px-8 py-5">Secret Key</th>
              <th className="px-8 py-5">Created</th>
              <th className="px-8 py-5">Last Used</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {initialKeys.map((item, idx) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1, type: "spring" }}
                className="hover:bg-muted/30 transition-colors group relative"
              >
                <td className="px-8 py-6 font-medium flex items-center">
                  <div className={`p-2 rounded-lg mr-4 shadow-inner ${item.type === 'live' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-base">{item.name}</span>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">{item.type}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-3 bg-muted/50 p-2.5 rounded-xl border border-border/40 max-w-[280px]">
                    <span className="font-mono text-muted-foreground tracking-widest text-xs flex-1 truncate">
                      {showKeys[item.id] ? item.key : "••••••••••••••••••••••••••••••••"}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-muted-foreground font-medium">{item.created}</td>
                <td className="px-8 py-6 text-muted-foreground font-medium">{item.lastUsed}</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleShowKey(item.id)}
                      className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors shadow-sm border border-transparent hover:border-border/50"
                      title={showKeys[item.id] ? "Hide key" : "Reveal key"}
                    >
                      {showKeys[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCopy(item.id, item.key)}
                      className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors relative shadow-sm border border-transparent hover:border-border/50"
                      title="Copy to clipboard"
                    >
                      <AnimatePresence mode="wait">
                        {copiedId === item.id ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                          >
                            <Check className="w-4 h-4 text-emerald-500" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                          >
                            <Copy className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
