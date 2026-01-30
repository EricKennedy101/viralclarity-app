'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import { sendMagicLink, signup } from '@/app/signup/actions';
import { useToast } from '@/components/ui/use-toast';

export function SignupForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isMagicLinkSending, setIsMagicLinkSending] = useState(false);

  function handleSignup() {
    signup({ email, password }).then((data) => {
      if (data?.error) {
        toast({ description: 'Something went wrong. Please try again', variant: 'destructive' });
      }
    });
  }

  async function handleMagicLink() {
    if (!email) {
      toast({ description: 'Enter your email to receive a magic link.', variant: 'destructive' });
      return;
    }
    setIsMagicLinkSending(true);
    const result = await sendMagicLink(email);
    if (result?.error) {
      toast({ description: 'We couldn’t send the link. Try again.', variant: 'destructive' });
    } else {
      setMagicLinkSent(true);
      toast({ description: 'Check your email for a magic link.' });
    }
    setIsMagicLinkSending(false);
  }

  return (
    <form action={'#'} className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
      <Image src={'/logo.svg'} alt={'Viral Clarity'} width={72} height={72} />
      <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>Create an account</div>
      {magicLinkSent ? (
        <div className="w-full rounded-md border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
          Check your email for a magic link. It expires in a few minutes.
        </div>
      ) : null}
      <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
      />
      <Button onClick={handleMagicLink} type="button" variant="outline" className="w-full">
        {isMagicLinkSending ? 'Sending link…' : 'Email me a magic link'}
      </Button>
      <Button formAction={() => handleSignup()} type={'submit'} variant={'secondary'} className={'w-full'}>
        Sign up
      </Button>
    </form>
  );
}
