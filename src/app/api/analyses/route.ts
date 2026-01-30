import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type AnalysisInsert = {
  source_type: 'upload' | 'url';
  source_url?: string | null;
  storage_path?: string | null;
  transcript: string;
  hook_analysis: Record<string, unknown>;
  structure_breakdown: Array<Record<string, unknown>>;
  rewrite_suggestions: Record<string, unknown>;
};

const getMonthKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_pro')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      return Response.json({ error: profileError.message }, { status: 500 });
    }

    const isPro = profile?.is_pro ?? false;
    const monthKey = getMonthKey(new Date());
    let analysesCount = 0;

    if (!isPro) {
      const { data: usage, error: usageError } = await supabase
        .from('user_usage')
        .select('analyses_count')
        .eq('user_id', user.id)
        .eq('month_key', monthKey)
        .maybeSingle();

      if (usageError) {
        return Response.json({ error: usageError.message }, { status: 500 });
      }

      analysesCount = usage?.analyses_count ?? 0;
      if (analysesCount >= 3) {
        return Response.json(
          { locked: true, message: 'Free limit reached. Upgrade to unlock.' },
          { status: 200 },
        );
      }

      const nextCount = analysesCount + 1;
      const { error: usageUpdateError } = await supabase.from('user_usage').upsert({
        user_id: user.id,
        month_key: monthKey,
        analyses_count: nextCount,
        updated_at: new Date().toISOString(),
      });

      if (usageUpdateError) {
        return Response.json({ error: usageUpdateError.message }, { status: 500 });
      }
    }

    const body = (await request.json()) as AnalysisInsert;
    if (!body?.source_type || !body?.transcript || !body?.hook_analysis || !body?.structure_breakdown || !body?.rewrite_suggestions) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('video_analyses')
      .insert({
        user_id: user.id,
        source_type: body.source_type,
        source_url: body.source_url ?? null,
        storage_path: body.storage_path ?? null,
        transcript: body.transcript,
        hook_analysis: body.hook_analysis,
        structure_breakdown: body.structure_breakdown,
        rewrite_suggestions: body.rewrite_suggestions,
        locked: false,
      })
      .select('id, created_at')
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ id: data.id, created_at: data.created_at, tier: 'full' });
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('video_analyses')
      .select('id, created_at, source_type, source_url, locked')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ analyses: data ?? [] });
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
