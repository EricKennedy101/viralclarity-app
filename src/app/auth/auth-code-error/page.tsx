import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">We couldn’t sign you in</CardTitle>
          <CardDescription>The sign-in link expired or is no longer valid.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Please request a new login link and try again.</p>
          <Link className="inline-block text-sm text-primary underline underline-offset-4" href="/login">
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
