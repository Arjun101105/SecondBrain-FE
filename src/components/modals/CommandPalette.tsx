import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '@/api/client';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, FileUp, Mic, ArrowRight, ArrowLeft, Tag, X, Loader2 } from 'lucide-react';

type ViewMode = 'default' | 'note' | 'document' | 'audio';

function isValidUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
}

function detectPlatform(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'YouTube Video';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'Tweet';
  if (lower.includes('instagram.com')) return 'Instagram Post';
  if (lower.includes('github.com')) return 'GitHub Repo';
  return 'Link';
}

export function CommandPalette() {
  const { isCmdKOpen, setCmdKOpen } = useStore();
  const [view, setView] = useState<ViewMode>('default');
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const createMutation = useMutation({
    mutationFn: contentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setCmdKOpen(false);
      setTimeout(() => {
        setInputValue('');
        setTags([]);
        setView('default');
      }, 200);
    }
  });

  const uploadMutation = useMutation({
    mutationFn: contentApi.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setCmdKOpen(false);
      setTimeout(() => {
        setTags([]);
        setView('default');
      }, 200);
    }
  });

  // Focus management
  useEffect(() => {
    if (isCmdKOpen) {
      setTimeout(() => {
        if (view === 'default') inputRef.current?.focus();
        if (view === 'note') noteRef.current?.focus();
      }, 50);
    } else {
      setTimeout(() => {
        setView('default');
        setInputValue('');
        setTags([]);
      }, 200);
    }
  }, [isCmdKOpen, view]);

  useEffect(() => {
    if (isCmdKOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCmdKOpen]);

  const isUrl = view === 'default' && inputValue.length > 0 && isValidUrl(inputValue);
  const platformName = isUrl ? detectPlatform(inputValue) : '';

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('type', view === 'audio' ? 'VOICE_NOTE' : 'DOCUMENT');
    tags.forEach((t) => formData.append('tags', t));
    uploadMutation.mutate(formData);
  };

  const isPending = createMutation.isPending || uploadMutation.isPending;

  return (
    <AnimatePresence>
      {isCmdKOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl"
            onClick={() => setCmdKOpen(false)}
          />

          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="relative z-50 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-[0_0_60px_-10px_rgba(0,112,243,0.2)] ring-1 ring-white/5"
          >
            <motion.div layout className="relative border-b border-white/10 bg-zinc-900">
              {view === 'default' && (
                <div className="relative flex items-center">
                  <SearchIcon className="absolute left-4 h-5 w-5 text-muted-foreground mr-2" />
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Capture a link or enter a command..."
                    className="flex h-16 w-full rounded-none border-0 bg-transparent pl-12 pr-32 text-lg outline-none ring-0 focus-visible:ring-0 shadow-none"
                  />
                  
                  <AnimatePresence>
                    {isUrl && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute right-3"
                      >
                        <button 
                          disabled={isPending}
                          onClick={() => {
                            createMutation.mutate({
                              type: platformName === 'YouTube Video' ? 'VIDEO_LINK' : platformName === 'Tweet' ? 'SOCIAL_POST' : 'LINK',
                              title: inputValue.substring(0, 80),
                              contentUrl: inputValue,
                              description: platformName || 'Saved Link',
                              tags,
                            });
                          }}
                          className="flex items-center gap-2 rounded-md bg-[#0070F3] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0070F3]/90 shadow-sm border-none transition-colors disabled:opacity-50"
                        >
                          {isPending ? <Loader2 size={14} className="animate-spin" /> : `Save ${platformName}`}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {view !== 'default' && (
                <div className="flex h-14 items-center px-4 gap-3 bg-muted/30">
                  <button 
                    onClick={() => setView('default')}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-muted-foreground">
                    {view === 'note' && 'Write Text Note'}
                    {view === 'document' && 'Upload Document'}
                    {view === 'audio' && 'Upload Audio'}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Tags bar (visible when adding URL or in note mode) */}
            {(isUrl || view === 'note') && (
              <motion.div layout className="flex items-center gap-2 px-4 py-2 border-b border-border/30 bg-background/30">
                <Tag size={14} className="text-zinc-500 shrink-0" />
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#0070F3]/10 text-[#0070F3] border border-[#0070F3]/20">
                    {tag}
                    <button onClick={() => setTags(tags.filter((t) => t !== tag))}><X size={10} /></button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag..."
                  className="bg-transparent border-none outline-none text-xs text-zinc-400 placeholder:text-zinc-600 w-20 flex-shrink-0"
                />
              </motion.div>
            )}

            <motion.div layout className="w-full">
              <AnimatePresence mode="popLayout">
                {view === 'default' && !isUrl && (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Command className="rounded-none border-none bg-transparent">
                      <CommandList className="max-h-[60vh] overflow-y-auto">
                        <CommandEmpty>No actions found for "{inputValue}".</CommandEmpty>
                        <CommandGroup heading="Create">
                          <CommandItem 
                            onSelect={() => setView('document')}
                            className="data-[selected='true']:bg-[#0070F3] data-[selected='true']:text-white cursor-pointer py-3 transition-colors"
                          >
                            <FileUp className="mr-3 h-4 w-4" />
                            <span>Upload Document</span>
                            <span className="ml-auto text-xs opacity-60">PDF, DOCX</span>
                          </CommandItem>
                          <CommandItem 
                            onSelect={() => setView('audio')}
                            className="data-[selected='true']:bg-[#0070F3] data-[selected='true']:text-white cursor-pointer py-3 transition-colors"
                          >
                            <Mic className="mr-3 h-4 w-4" />
                            <span>Upload Audio</span>
                            <span className="ml-auto text-xs opacity-60">MP3, WAV</span>
                          </CommandItem>
                          <CommandItem 
                            onSelect={() => setView('note')}
                            className="data-[selected='true']:bg-[#0070F3] data-[selected='true']:text-white cursor-pointer py-3 transition-colors"
                          >
                            <FileText className="mr-3 h-4 w-4" />
                            <span>Write Text Note</span>
                            <span className="ml-auto text-xs opacity-60">Markdown</span>
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </motion.div>
                )}

                {view === 'note' && (
                  <motion.div
                    key="note"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-4"
                  >
                    <Textarea 
                      ref={noteRef}
                      placeholder="Start typing your thought here (Markdown supported)..."
                      className="min-h-[200px] w-full resize-none border-0 bg-transparent text-lg shadow-none focus-visible:ring-0 p-2"
                    />
                    <div className="flex justify-end mt-4">
                      <button 
                        disabled={isPending}
                        onClick={() => {
                          const val = noteRef.current?.value || '';
                          if (!val.trim()) return;
                          createMutation.mutate({
                            type: 'RICH_NOTE',
                            title: val.substring(0, 50) || 'Quick Note',
                            description: val,
                            contentUrl: 'note://' + Date.now(),
                            tags,
                          });
                        }}
                        className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isPending ? <Loader2 size={14} className="animate-spin" /> : 'Save Note'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {(view === 'document' || view === 'audio') && (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-8"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept={view === 'document' ? '.pdf,.doc,.docx,.txt,.md' : '.mp3,.wav,.m4a,.ogg'}
                      onChange={handleFileSelect}
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/10 py-16 text-center transition-colors hover:border-primary/50 hover:bg-muted/20 cursor-pointer"
                    >
                      {isPending ? (
                        <Loader2 className="h-10 w-10 text-[#0070F3] mb-4 animate-spin" />
                      ) : (
                        view === 'document' ? <FileUp className="h-10 w-10 text-muted-foreground mb-4" /> : <Mic className="h-10 w-10 text-muted-foreground mb-4" />
                      )}
                      <h3 className="mb-1 text-lg font-semibold">
                        {isPending ? 'Uploading...' : `Drop ${view === 'document' ? 'document' : 'audio file'} here`}
                      </h3>
                      <p className="text-sm text-muted-foreground text-center max-w-sm">
                        Click to browse or drag and drop. {view === 'document' ? 'Supports PDFs, Word docs, and plain text.' : 'Supports MP3, WAV, and M4A up to 50MB.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SearchIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
