'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { login, loginAnonymously } from '@/app/login/actions';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/utils/supabase/client';
import { getSiteUrl } from '@/lib/siteUrl';

export function LoginForm() {
  const { toast } = useToast();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isMagicLinkSending, setIsMagicLinkSending] = useState(false);
  const siteUrl = getSiteUrl();
  const nextPath = searchParams.get('next') ?? '/analyze';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (nextPath) {
      window.localStorage.setItem('returnTo', nextPath);
    }
  }, [nextPath]);

  function handleLogin() {
    login({ email, password }).then((data) => {
      if (data?.error) {
        toast({ description: 'Invalid email or password', variant: 'destructive' });
      }
    });
  }

  async function handleMagicLink() {
    if (!email) {
      toast({ description: 'Enter your email to receive a magic link.', variant: 'destructive' });
      return;
    }
    setIsMagicLinkSending(true);
    if (!supabase) {
      toast({ description: 'Unable to send link right now. Try again.', variant: 'destructive' });
      setIsMagicLinkSending(false);
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });
    if (error) {
      toast({ description: 'We couldn’t send the link. Try again.', variant: 'destructive' });
    } else {
      setMagicLinkSent(true);
      toast({ description: 'Check your email for a sign-in link.' });
    }
    setIsMagicLinkSending(false);
  }

  function handleAnonymousLogin() {
    loginAnonymously().then((data) => {
      if (data?.error) {
        toast({ description: 'Something went wrong. Please try again', variant: 'destructive' });
      }
    });
  }

  return (
    <form action={'#'} className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
      <Image src={'/logo.svg'} alt={'Viral Clarity'} width={72} height={72} />
      <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>
        Log in to your account
      </div>
      {magicLinkSent ? (
        <div className="w-full rounded-md border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
          Check your email for a sign-in link.
        </div>
      ) : (
        <>
          <Button onClick={() => handleAnonymousLogin()} type={'button'} variant={'secondary'} className={'w-full mt-6'}>
            Continue without an account (Preview only)
          </Button>
          <p className="text-xs text-muted-foreground">No signup required. Limited preview.</p>
        </>
      )}
      {!magicLinkSent ? (
        <Button onClick={handleMagicLink} type="button" variant="outline" className="w-full">
          {isMagicLinkSending ? 'Sending link…' : 'Send me a login link'}
        </Button>
      ) : null}
      <div className={'flex w-full items-center justify-center'}>
        <Separator className={'w-5/12 bg-border'} />
        <div className={'text-border text-xs font-medium px-4'}>or</div>
        <Separator className={'w-5/12 bg-border'} />
      </div>
      <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
      />
      <Button formAction={() => handleLogin()} type={'submit'} variant={'secondary'} className={'w-full'}>
        Log in
      </Button>
    </form>
  );
}
