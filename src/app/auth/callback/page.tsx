import { Suspense } from 'react';
import AuthCallbackClient from '@/app/auth/callback/AuthCallbackClient';

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackClient />
    </Suspense>
  );
}
