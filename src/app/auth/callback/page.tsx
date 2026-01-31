'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get('code');

    if (!supabase) {
      setError('We couldn’t sign you in. Please try again.');
      return;
    }

    if (!code) {
      setError('This sign-in link is invalid or expired. Please request a new one.');
      return;
    }

    const finishSignIn = async () => {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        setError('This sign-in link is invalid or expired. Please request a new one.');
        return;
      }

      const returnTo = window.localStorage.getItem('returnTo');
      if (returnTo) {
        window.localStorage.removeItem('returnTo');
        router.replace(returnTo);
      } else {
        router.replace('/analyze');
      }
    };

    finishSignIn();
  }, [router, searchParams]);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{error ? 'Sign-in failed' : 'Signing you in…'}</CardTitle>
          <CardDescription>
            {error ? 'Please request a new magic link and try again.' : 'Hold tight while we finish signing you in.'}
          </CardDescription>
        </CardHeader>
        {error ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}
