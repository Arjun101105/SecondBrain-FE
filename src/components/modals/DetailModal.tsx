import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '@/api/client';
import { X, PlayCircle, MessageSquare, FileText, Link as LinkIcon, FileUp, Trash2, ExternalLink, Save, Plus, Loader2, Play, Globe } from 'lucide-react';

// ─── Helpers (shared with Cards.tsx) ────────────────────
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return ''; }
}

export function DetailModal() {
  const { activeItem, setActiveItem } = useStore();
  const queryClient = useQueryClient();
  
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const tagRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeItem) {
      setEditTitle(activeItem.title || '');
      setEditDesc(activeItem.description || activeItem.content || '');
      setTags(activeItem.tags || []);
      setIsEditing(false);
    }
  }, [activeItem]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveItem(null);
    };
    if (activeItem) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeItem, setActiveItem]);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => contentApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['content-search'] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: contentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['content-search'] });
      setActiveItem(null);
    },
  });

  const handleSave = () => {
    if (!activeItem?._id) return;
    updateMutation.mutate({
      id: activeItem._id,
      payload: { title: editTitle, description: editDesc, tags },
    });
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setIsEditing(true);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    setIsEditing(true);
  };

  const type = activeItem?.type;
  const url = activeItem?.contentUrl || '';
  const videoId = type === 'VIDEO_LINK' ? getYouTubeId(url) : null;
  const isTwitter = type === 'SOCIAL_POST' && (url.includes('x.com') || url.includes('twitter.com'));
  const twitterEmbedUrl = isTwitter ? url.replace('x.com', 'twitter.com') : '';
  const domain = getDomain(url);

  return (
    <AnimatePresence>
      {activeItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-black/60 backdrop-blur-xl fixed inset-0 z-40"
            onClick={() => setActiveItem(null)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.25 }}
            className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-white/10 p-8 sm:p-10 shadow-2xl flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                {type === 'RICH_NOTE' && <><FileText size={20} /><span>Note</span></>}
                {type === 'LINK' && <><LinkIcon size={20} /><span>Link</span></>}
                {type === 'VIDEO_LINK' && <><PlayCircle size={20} className="text-red-500" /><span>YouTube</span></>}
                {type === 'SOCIAL_POST' && <><MessageSquare size={20} className="text-blue-400" /><span>Social</span></>}
                {(type === 'DOCUMENT' || type === 'IMAGE') && <><FileUp size={20} className="text-[#0070F3]" /><span>Document</span></>}
                {type === 'CODE_SNIPPET' && <><FileText size={20} className="text-green-400" /><span>Code</span></>}
                {type === 'VOICE_NOTE' && <><FileText size={20} className="text-purple-400" /><span>Voice Note</span></>}
              </div>
              <div className="flex items-center gap-2">
                {isEditing && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0070F3] text-white rounded-xl text-sm font-medium hover:bg-[#0070F3]/90 transition-colors disabled:opacity-50"
                  >
                    {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save
                  </motion.button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm('Delete this item permanently?')) {
                      deleteMutation.mutate(activeItem._id);
                    }
                  }}
                  className="p-2 rounded-full bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setActiveItem(null)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                  title="Close (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ─── YouTube Embed ────────────────────────── */}
            {videoId && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 bg-black">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={activeItem.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* ─── Twitter/X Embed ──────────────────────── */}
            {isTwitter && (
              <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <img src="https://www.google.com/s2/favicons?domain=twitter.com&sz=32" alt="X" className="w-5 h-5 rounded-sm" />
                  <span className="text-sm font-semibold text-zinc-300">𝕏 Post</span>
                  <span className="text-xs text-zinc-600 ml-auto">{domain}</span>
                </div>
                <p className="text-base text-zinc-300 leading-relaxed mb-3">{activeItem.description || activeItem.title}</p>
                <a
                  href={twitterEmbedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#0070F3] hover:underline"
                >
                  <ExternalLink size={14} />
                  View on 𝕏
                </a>
              </div>
            )}

            {/* Title (editable) */}
            <input
              value={editTitle}
              onChange={(e) => { setEditTitle(e.target.value); setIsEditing(true); }}
              className="text-3xl font-bold text-white bg-transparent border-none outline-none focus:ring-0 mb-4 w-full"
              placeholder="Title..."
            />

            {/* Description / Content (editable) */}
            <textarea
              value={editDesc}
              onChange={(e) => { setEditDesc(e.target.value); setIsEditing(true); }}
              className="flex-1 min-h-[120px] text-lg leading-relaxed text-zinc-300 bg-transparent border-none outline-none focus:ring-0 resize-none mb-6 w-full"
              placeholder="Description..."
            />

            {/* Link preview (for non-YouTube, non-Twitter links) */}
            {url && !videoId && !isTwitter && (type === 'LINK' || type === 'VIDEO_LINK' || type === 'SOCIAL_POST') && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-colors mb-6"
              >
                <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt="" className="w-5 h-5 rounded-sm shrink-0" />
                <span className="text-sm text-[#0070F3] truncate flex-1">{url}</span>
                <Globe size={14} className="text-zinc-600 shrink-0" />
              </a>
            )}

            {/* Document download */}
            {url && (type === 'DOCUMENT' || type === 'IMAGE') && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0070F3] text-white rounded-xl font-medium hover:bg-[#0070F3]/90 transition-colors shadow-lg mb-6 w-fit"
              >
                <ExternalLink size={16} />
                Open Document
              </a>
            )}

            {/* Tags editor */}
            <div className="border-t border-white/10 pt-6">
              <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase mb-3 block">Tags</label>
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-[#0070F3]/10 text-[#0070F3] border border-[#0070F3]/20"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
                      <X size={12} />
                    </button>
                  </motion.span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    ref={tagRef}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag..."
                    className="bg-transparent border-none outline-none text-sm text-zinc-400 placeholder:text-zinc-600 w-24"
                  />
                  <button onClick={addTag} className="text-zinc-500 hover:text-[#0070F3] transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="mt-6 pt-4 border-t border-white/5 text-xs text-zinc-600 flex items-center gap-4">
              <span>Created {new Date(activeItem.createdAt).toLocaleDateString()}</span>
              {activeItem.updatedAt && <span>· Updated {new Date(activeItem.updatedAt).toLocaleDateString()}</span>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
