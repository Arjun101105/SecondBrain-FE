import type { ReactNode } from 'react';

export function BentoGrid({ children }: { children: ReactNode }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-5 w-full">
      {children}
    </div>
  );
}
