'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    if (!supabase) {
      return;
    }
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isSigningOut}>
      {isSigningOut ? 'Signing out…' : 'Log out'}
    </Button>
  );
}
