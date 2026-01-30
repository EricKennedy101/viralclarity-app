import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type TemplateInsert = {
  title?: string;
  template?: {
    hook_analysis: unknown;
    structure_breakdown: unknown;
    rewrite_suggestions: unknown;
  };
};

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
      .from('script_templates')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ templates: data ?? [] });
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Unable to load templates right now.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as TemplateInsert;
    const title = body?.title?.trim() ?? '';
    if (!title) {
      return Response.json({ error: 'Title is required.' }, { status: 400 });
    }

    if (!body?.template) {
      return Response.json({ error: 'Template data is required.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('script_templates')
      .insert({
        user_id: user.id,
        title,
        template: body.template,
      })
      .select('id, title, created_at')
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ id: data.id, title: data.title, created_at: data.created_at });
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Unable to save template right now.' }, { status: 500 });
  }
}
