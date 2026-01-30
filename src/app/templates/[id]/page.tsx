import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PageProps = {
  params: Promise<{ id: string }>;
};

type TemplatePayload = {
  hook_analysis?: {
    hook_text?: string;
    why_it_works?: string[];
    openingLine?: string;
    notes?: string;
  };
  structure_breakdown?: Array<{
    beat?: string;
    description?: string;
    label?: string;
    purpose?: string;
  }>;
  rewrite_suggestions?: {
    hooks?: Array<string | { line?: string }>;
    shot_list?: Array<string | { shot?: string }>;
    script_outline?: Array<string | { notes?: string }>;
  };
};

export default async function TemplateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Template</CardTitle>
            <CardDescription>Log in to view this template.</CardDescription>
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
    .select('id, title, created_at, template')
    .eq('user_id', user.id)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Template</CardTitle>
            <CardDescription>We could not find that template.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm text-primary underline underline-offset-4" href="/templates">
              Back to Templates
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const template = (data.template ?? {}) as TemplatePayload;
  const hookText = template.hook_analysis?.hook_text ?? template.hook_analysis?.openingLine ?? '';
  const hookNotes = template.hook_analysis?.why_it_works?.join(' ') ?? template.hook_analysis?.notes ?? '';

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="mb-6">
        <Link className="text-sm text-primary underline underline-offset-4" href="/templates">
          Back to Templates
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{data.title}</CardTitle>
          <CardDescription>Saved on {new Date(data.created_at).toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div>
            <div className="text-xs uppercase text-muted-foreground">Hook format</div>
            <p className="mt-2 font-medium">{hookText || 'No hook format available.'}</p>
            {hookNotes ? <p className="mt-2 text-muted-foreground">{hookNotes}</p> : null}
          </div>

          <div>
            <div className="text-xs uppercase text-muted-foreground">Retention beats</div>
            <ul className="mt-2 space-y-2">
              {(template.structure_breakdown ?? []).map((beat, index) => (
                <li key={`${beat.beat ?? beat.label ?? 'beat'}-${index}`} className="rounded-md border border-border p-3">
                  <div className="text-xs text-muted-foreground">{beat.beat ?? beat.label ?? `Beat ${index + 1}`}</div>
                  <div className="mt-1">{beat.description ?? beat.purpose ?? ''}</div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase text-muted-foreground">Rewrite kit</div>
            <div className="mt-3 space-y-4">
              <div className="rounded-md border border-border p-3">
                <div className="text-xs text-muted-foreground">Hooks</div>
                <ul className="mt-2 space-y-1">
                  {(template.rewrite_suggestions?.hooks ?? []).map((hook, index) => (
                    <li key={`${typeof hook === 'string' ? hook : hook?.line ?? 'hook'}-${index}`}>
                      {typeof hook === 'string' ? hook : hook?.line ?? ''}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-border p-3">
                <div className="text-xs text-muted-foreground">Shot list</div>
                <ul className="mt-2 space-y-1">
                  {(template.rewrite_suggestions?.shot_list ?? []).map((shot, index) => (
                    <li key={`${typeof shot === 'string' ? shot : shot?.shot ?? 'shot'}-${index}`}>
                      {typeof shot === 'string' ? shot : shot?.shot ?? ''}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-border p-3">
                <div className="text-xs text-muted-foreground">Script outline</div>
                <ul className="mt-2 space-y-1">
                  {(template.rewrite_suggestions?.script_outline ?? []).map((line, index) => (
                    <li key={`${typeof line === 'string' ? line : line?.notes ?? 'outline'}-${index}`}>
                      {typeof line === 'string' ? line : line?.notes ?? ''}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
