import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/server';

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Saved history</CardTitle>
            <CardDescription>Log in to view your saved videos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Create a free account to save results.</p>
            <Button asChild>
              <Link href="/login">Log in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Saved history</CardTitle>
          <CardDescription>Your saved videos will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
            No saved videos yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
