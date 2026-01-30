import { useEffect, useState } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export function useUserInfo(supabase: SupabaseClient | null) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabase) {
      setUser(null);
      return;
    }

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    })();
  }, [supabase]);

  return { user };
}
