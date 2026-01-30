import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { AnalysisResult } from '@/components/viralclarity/AnalysisResult';
import type { VideoAnalysisRecord } from '@/lib/viralclarity/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnalysisDetailPage({ params }: PageProps) {
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
            <CardTitle className="text-xl">Analysis</CardTitle>
            <CardDescription>Log in to view this analysis.</CardDescription>
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
    .select(
      'id, created_at, source_type, source_url, storage_path, transcript, hook_analysis, structure_breakdown, rewrite_suggestions, status, locked',
    )
    .eq('user_id', user.id)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Analysis</CardTitle>
            <CardDescription>We could not find that analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm text-primary underline underline-offset-4" href="/analyses">
              Back to My Analyses
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analysis: VideoAnalysisRecord = {
    id: data.id,
    status: data.status ?? 'completed',
    locked: data.locked ?? false,
    sourceType: data.source_type,
    sourceUrl: data.source_url ?? null,
    storagePath: data.storage_path ?? null,
    transcript: data.transcript,
    hookAnalysis: data.hook_analysis,
    structureBreakdown: data.structure_breakdown,
    rewriteSuggestions: data.rewrite_suggestions,
    createdAt: data.created_at,
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="mb-6">
        <Link className="text-sm text-primary underline underline-offset-4" href="/analyses">
          Back to My Analyses
        </Link>
      </div>
      <AnalysisResult analysis={analysis} />
    </div>
  );
}
