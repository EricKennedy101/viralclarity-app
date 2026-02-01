import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AnalysesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">My Analyses</CardTitle>
            <CardDescription>Log in to view your saved videos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm text-primary underline underline-offset-4" href="/login">
              Go to login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data, error } = await supabase
    .from('video_analyses')
    .select('id, created_at, source_type, source_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">My Analyses</CardTitle>
            <CardDescription>Unable to load videos right now.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">My Analyses</CardTitle>
          <CardDescription>Recent videos saved to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.length ? (
            <ul className="space-y-3">
              {data.map((analysis) => (
                <li key={analysis.id} className="rounded-md border border-border p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm font-medium">
                      {analysis.source_type === 'upload' ? 'Upload' : 'URL'} analysis
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(analysis.created_at).toLocaleString()}
                    </div>
                  </div>
                  {analysis.source_url ? (
                    <div className="mt-1 text-xs text-muted-foreground break-all">{analysis.source_url}</div>
                  ) : null}
                  <Link className="mt-2 inline-block text-sm text-primary underline underline-offset-4" href={`/analyses/${analysis.id}`}>
                    View details
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No videos yet. Try one from the home page.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
