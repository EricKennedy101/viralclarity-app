'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Props {
  user: User | null;
}

export default function Header({ user }: Props) {
  const supabase = createClient();
  const initials = user?.email ? user.email.slice(0, 1).toUpperCase() : 'U';

  const handleLogout = async () => {
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav>
      <div className="mx-auto max-w-7xl relative px-[32px] py-[18px] flex items-center justify-between">
        <div className="flex flex-1 items-center justify-start">
          <Link className="text-lg font-semibold text-foreground" href={'/'}>
            Viral Clarity
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <div className="flex space-x-4">
            {user?.id ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="h-9 w-9 rounded-full p-0">
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt="User avatar"
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold">{initials}</span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild={true} variant={'secondary'}>
                <Link href={'/login'}>Log in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
