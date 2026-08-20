"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Plus, Key, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const initialKeys = [
  { id: "key_1", name: "Production Key", key: "sk_live_51MxxxxxxxxxxxxxxxxxxaBcd", created: "Oct 12, 2023", lastUsed: "2 mins ago" },
  { id: "key_2", name: "Development Key", key: "sk_test_51MxxxxxxxxxxxxxxxxxxXyZq", created: "Nov 05, 2023", lastUsed: "5 hours ago" },
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
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage API keys for accessing the Omniflow API.</p>
        </div>
        <Button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full px-5">
          <Plus className="w-4 h-4 mr-2" />
          Create Secret Key
        </Button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 mb-8 flex items-start space-x-3 text-amber-800 dark:text-amber-200">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Keep your keys secure</p>
          <p className="opacity-90">Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider font-semibold text-xs border-b border-border/50">
            <tr>
              <th className="px-6 py-4 rounded-tl-2xl">Name</th>
              <th className="px-6 py-4">Secret Key</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4 rounded-tr-2xl">Last Used</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {initialKeys.map((item, idx) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="hover:bg-muted/20 transition-colors"
              >
                <td className="px-6 py-4 font-medium flex items-center">
                  <Key className="w-4 h-4 mr-2 text-muted-foreground" />
                  {item.name}
                </td>
                <td className="px-6 py-4 font-mono text-muted-foreground">
                  {showKeys[item.id] ? item.key : "••••••••••••••••••••••••••••••••"}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{item.created}</td>
                <td className="px-6 py-4 text-muted-foreground">{item.lastUsed}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => toggleShowKey(item.id)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      title={showKeys[item.id] ? "Hide key" : "Reveal key"}
                    >
                      {showKeys[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleCopy(item.id, item.key)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors relative"
                      title="Copy to clipboard"
                    >
                      <AnimatePresence mode="wait">
                        {copiedId === item.id ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
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
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
