import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { brainApi } from '@/api/client';
import { BentoGrid } from '@/components/bento/BentoGrid';
import { TextCard, MediaCard, LinkCard, DocumentCard } from '@/components/bento/Cards';
import { Loader2 } from 'lucide-react';

export function SharedBrain() {
  const { hash } = useParams<{ hash: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['shared-brain', hash],
    queryFn: () => brainApi.getSharedBrain(hash!),
    enabled: !!hash,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 size={32} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 gap-4">
        <img src="/brain-removebg-preview.png" alt="Brain not found" className="w-14 h-14 opacity-30 drop-shadow-[0_0_12px_rgba(0,112,243,0.3)]" />
        <h1 className="text-2xl font-bold text-white">Brain Not Found</h1>
        <p className="text-zinc-500 text-sm">{(error as Error).message || 'This share link may have expired or been revoked.'}</p>
      </div>
    );
  }

  const brain = data?.data;
  const contents = brain?.contents || [];

  return (
    <div className="min-h-screen bg-zinc-950 pt-16 pb-24">
      <div className="px-6 mb-10 max-w-[1600px] mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 rounded-2xl bg-[#0070F3]/10 border border-[#0070F3]/20">
            <img src="/brain-removebg-preview.png" alt="SecondBrain" className="w-8 h-8 drop-shadow-[0_0_8px_rgba(0,112,243,0.5)]" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          {brain?.user?.username}'s Brain
        </h1>
        <p className="text-zinc-500 text-sm">
          {contents.length} items · {brain?.permissions} access
        </p>
      </div>

      {contents.length === 0 ? (
        <div className="text-center py-24 text-zinc-600">This brain is empty.</div>
      ) : (
        <BentoGrid>
          {contents.map((item: any, idx: number) => {
            const type = item.type;
            const id = item._id || idx;

            if (type === 'LINK') return <LinkCard key={id} data={{ ...item, url: item.contentUrl }} />;
            if (type === 'VIDEO_LINK' || type === 'SOCIAL_POST') return <MediaCard key={id} data={{ ...item, platform: type === 'VIDEO_LINK' ? 'YouTube' : 'Twitter' }} />;
            if (type === 'DOCUMENT' || type === 'IMAGE') return <DocumentCard key={id} data={item} />;
            return <TextCard key={id} data={{ ...item, content: item.description || item.title }} />;
          })}
        </BentoGrid>
      )}
    </div>
  );
}
