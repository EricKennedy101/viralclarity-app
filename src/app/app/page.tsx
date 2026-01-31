import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/server';
import { LogoutButton } from '@/app/app/LogoutButton';

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">Beta: full access • 3 free credits/day</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/analyze">Analyze a video</Link>
            </Button>
            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
