'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

interface FormData {
  email: string;
  password: string;
}

export async function signup(data: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: true };
  }

  revalidatePath('/', 'layout');
  redirect('/analyze');
}

export async function sendMagicLink(email: string) {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: true };
  }

  return { success: true };
}
