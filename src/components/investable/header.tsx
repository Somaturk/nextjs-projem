
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, User, UserCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ViewModeToggle } from '@/components/investable/view-mode-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function Header() {
  const [mounted, setMounted] = React.useState(false);
  const { user, logout, isLoading } = useAuth();
  React.useEffect(() => setMounted(true), []);

  const getInitials = (email: string | null | undefined) => {
    if (!email) return '..';
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <header className="border-b bg-black text-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/simge.png" alt="One Y.Z. Logo" width={50} height={50} className="rounded-md" />
          <div>
            <h1 className="text-xl font-bold">One Y.Z.</h1>
            <p className="text-xs text-neutral-300">Yatırım Takip</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {mounted ? (
            <>
              {isLoading ? (
                <Skeleton className="h-10 w-10 rounded-full bg-neutral-800" />
              ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                         <Avatar>
                          <AvatarImage src={user.photoURL ?? ''} alt={user.email ?? 'Kullanıcı'} />
                          <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">Hesabım</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Çıkış Yap</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="icon">
                    <UserCircle className="h-[1.5rem] w-[1.5rem]" />
                    <span className="sr-only">Giriş Yap / Kayıt Ol</span>
                  </Button>
                </Link>
              )}
              <ViewModeToggle />
              <ThemeToggle />
            </>
          ) : (
            <>
              <Skeleton className="h-10 w-10 rounded-full bg-neutral-800" />
              <Skeleton className="h-10 w-10 rounded-full bg-neutral-800" />
              <Skeleton className="h-10 w-10 rounded-full bg-neutral-800" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
