import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '@/api/client';
import { BentoGrid } from '@/components/bento/BentoGrid';
import { TextCard, MediaCard, LinkCard, DocumentCard } from '@/components/bento/Cards';
import { DetailModal } from '@/components/modals/DetailModal';
import { ShareModal } from '@/components/modals/ShareModal';
import {
  Search, Share2, LogOut, Loader2, Plus,
  Link2, PlayCircle, FileText, FileUp, Image, MessageSquare,
  Code2, LayoutGrid, Command,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'All Items', value: null, icon: LayoutGrid },
  { label: 'Links', value: 'LINK', icon: Link2 },
  { label: 'Videos', value: 'VIDEO_LINK', icon: PlayCircle },
  { label: 'Notes', value: 'RICH_NOTE', icon: FileText },
  { label: 'Documents', value: 'DOCUMENT', icon: FileUp },
  { label: 'Images', value: 'IMAGE', icon: Image },
  { label: 'Social', value: 'SOCIAL_POST', icon: MessageSquare },
  { label: 'Code', value: 'CODE_SNIPPET', icon: Code2 },
];

// ─── Tooltip wrapper ────────────────────────────────────
function Tooltip({ label, show, children }: { label: string; show: boolean; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      {show && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg bg-zinc-800 border border-white/10 text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-zinc-800" />
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { toggleCmdK, setActiveItem, activeFilter, setActiveFilter, searchQuery, setSearchQuery, setShareModalOpen, logout } = useStore();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['content', activeFilter, page],
    queryFn: () => contentApi.getAll({ page, limit: 20, type: activeFilter || undefined }),
    enabled: !searchQuery,
  });

  const { data: searchData, isLoading: isSearching } = useQuery({
    queryKey: ['content-search', searchQuery],
    queryFn: () => contentApi.search(searchQuery),
    enabled: !!searchQuery,
  });

  const displayData = searchQuery
    ? (searchData?.data?.contents || [])
    : (data?.data?.contents || []);
  const pagination = data?.data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: contentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['content-search'] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const loading = isLoading || isSearching;
  const activeNavLabel = NAV_ITEMS.find(n => n.value === activeFilter)?.label || 'All Items';
  const totalItems = pagination?.totalItems || displayData.length;
  const sidebarW = sidebarCollapsed ? 72 : 260;

  return (
    <div className="min-h-screen bg-zinc-950 overflow-x-hidden">
      {/* ─── Sidebar ─────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarW }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-zinc-950 border-r border-white/5 overflow-hidden"
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 shrink-0 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <Tooltip label="Toggle sidebar" show={sidebarCollapsed}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-xl hover:bg-white/5 transition-colors shrink-0"
            >
              <img
                src="/brain-removebg-preview.png"
                alt="SecondBrain"
                className="w-7 h-7 drop-shadow-[0_0_8px_rgba(0,112,243,0.6)]"
              />
            </button>
          </Tooltip>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-base font-bold tracking-tight text-white whitespace-nowrap"
              >
                SecondBrain
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* New button */}
        <div className="px-3 mb-2">
          <Tooltip label="New Capture (⌘K)" show={sidebarCollapsed}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleCmdK}
              className={`w-full flex items-center gap-3 rounded-xl bg-[#0070F3] text-white font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,112,243,0.3)] ${
                sidebarCollapsed ? 'px-0 py-3 justify-center' : 'px-4 py-3'
              }`}
            >
              <Plus size={18} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    New Capture
                  </motion.span>
                )}
              </AnimatePresence>
              {!sidebarCollapsed && (
                <span className="ml-auto text-[10px] font-bold text-white/50 bg-white/10 px-1.5 py-0.5 rounded">⌘K</span>
              )}
            </motion.button>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto scrollbar-hide">
          <div className={`text-[10px] font-bold tracking-widest text-zinc-600 uppercase mb-2 ${sidebarCollapsed ? 'text-center' : 'px-3'}`}>
            {sidebarCollapsed ? '—' : 'Content'}
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = activeFilter === item.value;
            const Icon = item.icon;
            return (
              <Tooltip key={item.label} label={item.label} show={sidebarCollapsed}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setActiveFilter(item.value); setPage(1); clearSearch(); }}
                  className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                    sidebarCollapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-[#0070F3]/10 text-[#0070F3] border border-[#0070F3]/20'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <Tooltip label="Share Brain" show={sidebarCollapsed}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShareModalOpen(true)}
              className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium text-zinc-500 hover:text-white hover:bg-white/5 transition-all ${
                sidebarCollapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'
              }`}
            >
              <Share2 size={18} className="shrink-0" />
              {!sidebarCollapsed && <span>Share Brain</span>}
            </motion.button>
          </Tooltip>
          <Tooltip label="Logout" show={sidebarCollapsed}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={logout}
              className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all ${
                sidebarCollapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'
              }`}
            >
              <LogOut size={18} className="shrink-0" />
              {!sidebarCollapsed && <span>Logout</span>}
            </motion.button>
          </Tooltip>
        </div>
      </motion.aside>

      {/* ─── Main Content ────────────────────────────── */}
      <div
        className="min-h-screen transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginLeft: sidebarW }}
      >
        {/* ─── Top Bar ───────────────────────────────── */}
        <div className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="px-6 h-16 flex items-center gap-4 max-w-full">
            <div className="shrink-0">
              <h1 className="text-lg font-bold tracking-tight text-white">{activeNavLabel}</h1>
              <p className="text-xs text-zinc-500">{totalItems} items</p>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            <form onSubmit={handleSearch} className="relative w-full max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search your brain..."
                className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-10 pr-20 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#0070F3]/50 focus:shadow-[0_0_0_3px_rgba(0,112,243,0.05)] transition-all"
              />
              {searchQuery && (
                <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 transition-all">
                  Clear
                </button>
              )}
            </form>

            {/* Quick add */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleCmdK}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
            >
              <Command size={14} />
              <span className="text-xs">⌘K</span>
            </motion.button>
          </div>
        </div>

        {/* ─── Content Area ──────────────────────────── */}
        <div className="p-6">
          {/* Loading */}
          {loading && displayData.length === 0 && (
            <div className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 mb-5 animate-pulse" style={{ height: `${140 + (i % 3) * 40}px` }} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && displayData.length === 0 && !searchQuery && !activeFilter && (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <motion.img
                src="/brain-removebg-preview.png"
                alt="Empty brain"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 opacity-30 drop-shadow-[0_0_20px_rgba(0,112,243,0.4)]"
              />
              <h2 className="text-3xl font-bold tracking-tight text-zinc-300">Your brain is empty</h2>
              <p className="text-zinc-600 text-center max-w-sm">Capture your first link, note, or idea using the command palette.</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleCmdK}
                className="px-6 py-3 bg-[#0070F3] text-white rounded-xl font-semibold hover:shadow-[0_0_24px_rgba(0,112,243,0.3)] transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                New Capture
                <span className="ml-2 text-xs font-bold text-white/50 bg-white/10 px-1.5 py-0.5 rounded">⌘K</span>
              </motion.button>
            </div>
          )}

          {/* No results */}
          {!loading && displayData.length === 0 && (searchQuery || activeFilter) && (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Search size={48} className="text-zinc-800" />
              <h2 className="text-xl font-bold text-zinc-400">No results found</h2>
              <p className="text-zinc-600 text-sm">Try a different search term or filter.</p>
              <button onClick={clearSearch} className="text-[#0070F3] text-sm font-medium hover:underline">Clear filters</button>
            </div>
          )}

          {/* Grid */}
          {displayData.length > 0 && (
            <BentoGrid>
              {displayData.map((item: any, idx: number) => {
                const type = item.type;
                const id = item._id || idx;
                const commonProps = {
                  data: item,
                  onClick: () => setActiveItem(item),
                  onDelete: () => {
                    if (window.confirm('Delete this item permanently?')) {
                      deleteMutation.mutate(item._id);
                    }
                  },
                };

                if (type === 'LINK') return <LinkCard key={id} {...commonProps} data={{ ...item, url: item.contentUrl }} />;
                if (type === 'VIDEO_LINK' || type === 'SOCIAL_POST') return <MediaCard key={id} {...commonProps} data={{ ...item, platform: type === 'VIDEO_LINK' ? 'YouTube' : 'Twitter' }} />;
                if (type === 'DOCUMENT' || type === 'IMAGE') return <DocumentCard key={id} {...commonProps} />;
                return <TextCard key={id} {...commonProps} data={{ ...item, content: item.description || item.title }} />;
              })}
            </BentoGrid>
          )}

          {/* Load More */}
          {pagination && pagination.page < pagination.totalPages && !searchQuery && (
            <div className="flex justify-center pt-8 pb-16">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                Load More
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <DetailModal />
      <ShareModal />
    </div>
  );
}
