import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brainApi } from '@/api/client';
import { X, Copy, Check, Trash2, Share2, Loader2, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

export function ShareModal() {
  const { isShareModalOpen, setShareModalOpen } = useStore();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['share-link'],
    queryFn: brainApi.getShareLink,
    enabled: isShareModalOpen,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: brainApi.createShareLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-link'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: brainApi.deleteShareLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-link'] });
    },
  });

  const shareLink = data?.data?.shareLink;
  const shareUrl = shareLink?.url || '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-black/40 backdrop-blur-xl fixed inset-0 z-40"
            onClick={() => setShareModalOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.25 }}
            className="relative z-50 w-full max-w-lg rounded-3xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/20">
                  <Share2 size={20} className="text-[#0070F3]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Share Your Brain</h2>
                  <p className="text-sm text-zinc-400">Create a public link to your saved content</p>
                </div>
              </div>
              <button onClick={() => setShareModalOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-zinc-500" />
              </div>
            ) : shareLink ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <LinkIcon size={16} className="text-zinc-500 shrink-0" />
                  <span className="text-sm text-[#0070F3] truncate flex-1">{shareUrl}</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors shrink-0"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </motion.button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Permission: <span className="text-zinc-300 capitalize">{shareLink.permissions}</span></span>
                  {shareLink.expiresAt && (
                    <span className="text-zinc-500">Expires: <span className="text-zinc-300">{new Date(shareLink.expiresAt).toLocaleDateString()}</span></span>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Revoke Share Link
                </motion.button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-zinc-400 text-sm">No share link exists yet. Create one to let others view your brain.</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => createMutation.mutate({ permissions: 'view-only' })}
                  disabled={createMutation.isPending}
                  className="px-8 py-3 bg-[#0070F3] text-white rounded-xl font-medium hover:bg-[#0070F3]/90 hover:shadow-[0_0_20px_rgba(0,112,243,0.4)] transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                  Generate Share Link
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
