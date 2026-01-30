import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function TemplatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Templates</CardTitle>
            <CardDescription>Log in to view your saved templates.</CardDescription>
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
    .from('script_templates')
    .select('id, title, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Templates</CardTitle>
            <CardDescription>Unable to load templates right now.</CardDescription>
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
          <CardTitle className="text-xl">Templates</CardTitle>
          <CardDescription>Your saved formats ready to reuse.</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.length ? (
            <ul className="space-y-3">
              {data.map((template) => (
                <li key={template.id} className="rounded-md border border-border p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm font-medium">{template.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(template.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Link className="mt-2 inline-block text-sm text-primary underline underline-offset-4" href={`/templates/${template.id}`}>
                    View template
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="text-lg font-semibold">No templates yet</div>
              <p className="text-sm text-muted-foreground">
                Save your first analysis as a template to reuse winning formats.
              </p>
              <Link className="text-sm text-primary underline underline-offset-4" href="/analyze">
                Run an analysis
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
