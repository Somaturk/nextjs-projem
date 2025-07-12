'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const HeaderSkeleton = () => (
    <header className="border-b border-neutral-800 bg-black">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-[50px] w-[50px] rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </header>
);

const DynamicHeader = dynamic(() => import('@/components/investable/header'), {
  ssr: false,
  loading: () => <HeaderSkeleton />,
});

export default DynamicHeader;
