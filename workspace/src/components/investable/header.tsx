'use client';

import * as React from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ViewModeToggle } from '@/components/investable/view-mode-toggle';
import { Skeleton } from '@/components/ui/skeleton';

export default function Header() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">One Y.Z.</h1>
        </div>
        <div className="flex items-center gap-2">
          {mounted ? (
            <>
              <ViewModeToggle />
              <ThemeToggle />
            </>
          ) : (
            <>
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
