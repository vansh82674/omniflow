"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Plus, Key, Eye, EyeOff, ShieldAlert, Trash2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  type: string;
  lastUsed: string | null;
  createdAt: string;
  key?: string; // only returned once on creation
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyType, setNewKeyType] = useState("live");
  const [isCreating, setIsCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/api-keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data);
      }
    } catch {
      toast.error("Failed to fetch API keys");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName, type: newKeyType })
      });
      if (res.ok) {
        const newKey = await res.json();
        setKeys(prev => [newKey, ...prev]);
        setCreatedKey(newKey.key);
        toast.success("API key created successfully");
      } else {
        toast.error("Failed to create API key");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this key? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/api-keys?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setKeys(prev => prev.filter(k => k.id !== id));
        toast.success("API key revoked");
      } else {
        toast.error("Failed to revoke API key");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    setNewKeyName("");
    setNewKeyType("live");
    setCreatedKey(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-neutral-100 to-neutral-500">
            API Keys
          </h1>
          <p className="text-muted-foreground mt-2 text-base">Manage API keys for accessing the Omniflow API.</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => setIsModalOpen(true)} className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full px-6 shadow-lg shadow-neutral-900/20 h-11 relative overflow-hidden group">
            <span className="absolute inset-0 w-full h-full bg-linear-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
        className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 mb-10 flex items-start space-x-4 text-amber-500 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
          <ShieldAlert className="w-24 h-24" />
        </div>
        <div className="p-2 bg-amber-500/20 rounded-xl shrink-0">
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
            {isLoading ? (
              <tr><td colSpan={5} className="px-8 py-6 text-center text-muted-foreground">Loading keys...</td></tr>
            ) : keys.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-6 text-center text-muted-foreground">No API keys found. Create one to get started!</td></tr>
            ) : keys.map((item, idx) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05, type: "spring" }}
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
                  <div className="flex items-center space-x-3 bg-muted/50 p-2.5 rounded-xl border border-border/40 max-w-70">
                    <span className="font-mono text-muted-foreground tracking-widest text-xs flex-1 truncate">
                      {item.key ? (showKeys[item.id] ? item.key : item.keyPrefix.replace('...', '••••••••••••••••••••')) : item.keyPrefix}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-muted-foreground font-medium">{timeAgo(item.createdAt)}</td>
                <td className="px-8 py-6 text-muted-foreground font-medium">{timeAgo(item.lastUsed)}</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {item.key && (
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleShowKey(item.id)}
                        className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors shadow-sm border border-transparent hover:border-border/50"
                        title={showKeys[item.id] ? "Hide key" : "Reveal key"}
                      >
                        {showKeys[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </motion.button>
                    )}
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCopy(item.id, item.key || item.keyPrefix)}
                      className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors relative shadow-sm border border-transparent hover:border-border/50"
                      title="Copy to clipboard"
                    >
                      <AnimatePresence mode="wait">
                        {copiedId === item.id ? (
                          <motion.div key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                            <Check className="w-4 h-4 text-emerald-500" />
                          </motion.div>
                        ) : (
                          <motion.div key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                            <Copy className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(item.id)}
                      className="p-2.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shadow-sm border border-transparent"
                      title="Revoke key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Create Key Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-blue-500" />
              <button onClick={closeCreateModal} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              {!createdKey ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">Create new API key</h2>
                  <p className="text-zinc-400 text-sm mb-6">Enter a name and environment for your new API key.</p>
                  
                  <form onSubmit={handleCreate} className="space-y-5">
                    <div>
                      <label className="text-xs font-medium text-zinc-300 block mb-2">Key Name</label>
                      <input 
                        type="text" 
                        required
                        value={newKeyName}
                        onChange={e => setNewKeyName(e.target.value)}
                        placeholder="e.g. Production Key"
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-300 block mb-2">Environment</label>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setNewKeyType('live')} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${newKeyType === 'live' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>
                          Live
                        </button>
                        <button type="button" onClick={() => setNewKeyType('test')} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${newKeyType === 'test' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>
                          Test
                        </button>
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={isCreating} className="w-full bg-white hover:bg-zinc-200 text-black rounded-xl py-6 mt-4">
                      {isCreating ? "Creating..." : "Create secret key"}
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <Check className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Save your key</h2>
                  <p className="text-zinc-400 text-sm mb-6">Please copy this key now. For your security, it will never be shown again.</p>
                  
                  <div className="bg-black border border-white/10 rounded-xl p-4 flex items-center justify-between mb-6">
                    <code className="text-emerald-400 font-mono text-sm truncate pr-4">{createdKey}</code>
                    <button onClick={() => handleCopy('new', createdKey)} className="text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                      {copiedId === 'new' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-amber-500/90 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>We&apos;ll only show you your API key once. Please save it somewhere safe. Do not expose this key in your client-side code (browsers, apps). Keep it strictly on your secure backend.</p>
                  </div>
                  
                  <Button onClick={closeCreateModal} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl py-6">
                    I&apos;ve saved it securely
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
