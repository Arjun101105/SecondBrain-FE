import { motion } from 'framer-motion';
import { FileText, Link as LinkIcon, FileUp, PlayCircle, MessageSquare, Trash2, Play, Globe } from 'lucide-react';
import React from 'react';

export const cardClasses = "bg-black/[0.16] backdrop-blur-[160px] border border-white/20 shadow-2xl rounded-3xl p-5 relative overflow-hidden isolate cursor-pointer transition-all hover:border-white/30 break-inside-avoid mb-5 group";

export const hoverMotion = {
  whileHover: { scale: 1.02, y: -4 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 25 }
};

const badgeHover = {
  whileHover: { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' },
  transition: { type: 'spring' as const, stiffness: 500, damping: 20 }
};

// ─── Helpers ────────────────────────────────────────────
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
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

function getFaviconUrl(url: string): string {
  const domain = getDomain(url);
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : '';
}

// Convert x.com links to twitter.com for embed compatibility
function getTwitterEmbedUrl(url: string): string {
  return url.replace('x.com', 'twitter.com');
}

// ─── Shared Components ──────────────────────────────────
function DeleteButton({ onDelete }: { onDelete?: (e: React.MouseEvent) => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => { e.stopPropagation(); onDelete?.(e); }}
      className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all opacity-0 group-hover:opacity-100 z-10"
    >
      <Trash2 size={14} />
    </motion.button>
  );
}

function TagPills({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {tags.map((tag, i) => (
        <motion.span
          key={i}
          {...badgeHover}
          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#0070F3]/10 text-[#0070F3] border border-[#0070F3]/20"
        >
          {tag}
        </motion.span>
      ))}
    </div>
  );
}

function TypeBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <motion.div {...badgeHover} className="w-fit rounded-full px-3 py-1 flex items-center gap-2 mb-3 bg-white/5 border border-white/10 text-xs font-bold tracking-wider text-muted-foreground uppercase">
      {icon}
      <span>{label}</span>
    </motion.div>
  );
}

// ─── TextCard ───────────────────────────────────────────
export function TextCard({ data, onClick, onDelete }: { data: any, onClick?: () => void, onDelete?: (e: React.MouseEvent) => void }) {
  return (
    <motion.div {...hoverMotion} onClick={onClick} className={cardClasses}>
      <DeleteButton onDelete={onDelete} />
      <TypeBadge icon={<FileText size={14} />} label="Note" />
      <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap line-clamp-6">{data.content}</p>
      <TagPills tags={data.tags} />
    </motion.div>
  );
}

// ─── MediaCard (YouTube / Social) ───────────────────────
export function MediaCard({ data, onClick, onDelete }: { data: any, onClick?: () => void, onDelete?: (e: React.MouseEvent) => void }) {
  const isVideo = data.platform === 'YouTube' || data.platform === 'YouTube Video';
  const url = data.contentUrl || data.url || '';
  const videoId = isVideo ? getYouTubeId(url) : null;
  const isTwitter = url.includes('x.com') || url.includes('twitter.com');

  return (
    <motion.div {...hoverMotion} onClick={onClick} className={cardClasses}>
      <DeleteButton onDelete={onDelete} />
      <TypeBadge
        icon={isVideo ? <PlayCircle size={14} className="text-red-500" /> : <MessageSquare size={14} className="text-blue-400" />}
        label={data.platform}
      />

      {/* YouTube Thumbnail */}
      {videoId ? (
        <div className="relative rounded-2xl overflow-hidden mb-3 group/thumb">
          <img
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt={data.title}
            className="w-full h-40 object-cover transition-transform group-hover/thumb:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
            <div className="p-3 rounded-full bg-red-600 shadow-lg">
              <Play size={20} className="text-white fill-white" />
            </div>
          </div>
          {/* YouTube branding */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white flex items-center gap-1">
            <PlayCircle size={10} className="text-red-500" />
            YouTube
          </div>
        </div>
      ) : isTwitter ? (
        /* Twitter/X embed-style preview */
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-4 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <img src="https://www.google.com/s2/favicons?domain=twitter.com&sz=32" alt="X" className="w-5 h-5 rounded-sm" />
            <span className="text-xs font-semibold text-zinc-400">𝕏 Post</span>
          </div>
          <p className="text-sm text-zinc-300 line-clamp-3">{data.description || data.title}</p>
          <div className="mt-2 text-[11px] text-blue-400 truncate">{getTwitterEmbedUrl(url)}</div>
        </div>
      ) : (
        /* Generic social placeholder */
        <div className="h-32 w-full rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/5 mb-3 flex items-center justify-center">
          <MessageSquare size={24} className="text-zinc-600" />
        </div>
      )}

      <h3 className="text-base font-semibold tracking-tight text-white line-clamp-2">{data.title}</h3>
      <TagPills tags={data.tags} />
    </motion.div>
  );
}

// ─── DocumentCard ───────────────────────────────────────
export function DocumentCard({ data, onClick, onDelete }: { data: any, onClick?: () => void, onDelete?: (e: React.MouseEvent) => void }) {
  return (
    <motion.div {...hoverMotion} onClick={onClick} className={cardClasses}>
      <DeleteButton onDelete={onDelete} />
      <TypeBadge icon={<FileUp size={14} className="text-[#0070F3]" />} label="Document" />
      <h3 className="text-base font-semibold tracking-tight text-white line-clamp-2 mb-2">{data.title}</h3>
      <motion.div {...badgeHover} className="text-xs font-medium text-zinc-400 border border-white/10 bg-white/5 rounded-full w-fit px-3 py-1">
        {data.metadata?.fileType || 'PDF'} • {data.metadata?.fileSize ? `${(data.metadata.fileSize / 1024 / 1024).toFixed(1)} MB` : '—'}
      </motion.div>
      <TagPills tags={data.tags} />
    </motion.div>
  );
}

// ─── LinkCard ───────────────────────────────────────────
export function LinkCard({ data, onClick, onDelete }: { data: any, onClick?: () => void, onDelete?: (e: React.MouseEvent) => void }) {
  const url = data.url || data.contentUrl || '';
  const domain = getDomain(url);
  const favicon = getFaviconUrl(url);

  return (
    <motion.div {...hoverMotion} onClick={onClick} className={cardClasses}>
      <DeleteButton onDelete={onDelete} />
      <TypeBadge icon={<LinkIcon size={14} />} label="Link" />
      <h3 className="text-base font-semibold tracking-tight text-white line-clamp-2 mb-1">{data.title}</h3>
      {data.description && <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{data.description}</p>}
      
      {/* Link preview with favicon */}
      <div className="flex items-center gap-2 mt-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/8">
        {favicon && <img src={favicon} alt="" className="w-4 h-4 rounded-sm" loading="lazy" />}
        <span className="text-[12px] text-[#0070F3] truncate font-medium">{domain}</span>
        <Globe size={12} className="text-zinc-600 ml-auto shrink-0" />
      </div>
      <TagPills tags={data.tags} />
    </motion.div>
  );
}
