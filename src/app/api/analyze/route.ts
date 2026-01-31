import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type AnalyzeResponse = {
  hook_analysis: {
    hook_text: string;
    why_it_works: string[];
  };
  structure_breakdown: Array<{
    beat: string;
    description: string;
  }>;
  rewrite_suggestions: {
    hooks: string[];
    shot_list: string[];
    script_outline: string[];
  };
};

const DAILY_CREDITS = 3;

const buildSystemPrompt = () => `
You are a ruthless short-form video strategist who optimizes for retention, curiosity, and replay value.
You do NOT summarize.
You do NOT use generic marketing language.
You explain why THIS video works better than average TikToks.
You think in hooks, pattern interrupts, curiosity gaps, and audience psychology.
You respond with sharp, specific insights that creators can directly apply.
`.trim();

const callOpenAi = async (apiKey: string, content: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content },
      ],
    }),
  });

  return response;
};

const parseAnalysisJson = (content: string) => {
  return JSON.parse(content) as AnalyzeResponse;
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const consumeCredit = async (supabase: Awaited<ReturnType<typeof createClient>>, userId: string) => {
  const dateKey = getTodayKey();
  const { data: usage, error } = await supabase
    .from('usage_credits')
    .select('used')
    .eq('user_id', userId)
    .eq('date', dateKey)
    .maybeSingle();

  if (error) {
    return { allowed: false, remaining: 0 };
  }

  const used = usage?.used ?? 0;
  if (used >= DAILY_CREDITS) {
    return { allowed: false, remaining: 0 };
  }

  const nextUsed = used + 1;
  const { error: upsertError } = await supabase.from('usage_credits').upsert(
    {
      user_id: userId,
      date: dateKey,
      used: nextUsed,
    },
    { onConflict: 'user_id,date' },
  );

  if (upsertError) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: Math.max(0, DAILY_CREDITS - nextUsed) };
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'We couldn’t analyze this video. Try a shorter clip or try again.' }, { status: 500 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isPreview = !user;
    const creditStatus = !isPreview ? await consumeCredit(supabase, user.id) : null;
    if (!isPreview && creditStatus && !creditStatus.allowed) {
        return Response.json(
          {
            locked: true,
            message: 'Daily limit reached. Come back tomorrow.',
            remaining: creditStatus.remaining,
          },
          { status: 200 },
        );
    }

    const body = (await request.json()) as { transcript?: string };
    if (!body?.transcript) {
      return Response.json({ error: 'We need a transcript to analyze this video.' }, { status: 400 });
    }

    const prompt = `Given the transcript below, produce a viral analysis using the exact JSON schema.

Rules:
- Be specific. Reference exact phrases or moments from the transcript.
- Assume the audience is TikTok-native and impatient.
- Call out what makes this hook SCROLL-STOPPING.
- Explain the retention mechanics (why viewers keep watching).
- Avoid generic phrases like "engaging", "high-quality", or "compelling".

Transcript:
"""${body.transcript}"""

Then return ONLY valid JSON in this shape:
{
  hook_analysis: {
    hook_text: string,
    why_it_works: string[]
  },
  structure_breakdown: {
    beat: string,
    description: string
  }[],
  rewrite_suggestions: {
    hooks: string[],
    shot_list: string[],
    script_outline: string[]
  }
}`;
    const response = await callOpenAi(apiKey, prompt);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('OpenAI analyze error', errorText);
      return Response.json({ error: 'We couldn’t analyze this video. Try a shorter clip or try again.' }, { status: 502 });
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload?.choices?.[0]?.message?.content ?? '';
    try {
      const parsed = parseAnalysisJson(content);
      if (isPreview) {
        return Response.json({
          tier: 'preview',
          hook_analysis: {
            hook_text: parsed.hook_analysis.hook_text,
            why_it_works: parsed.hook_analysis.why_it_works.slice(0, 3),
          },
          structure_breakdown: [],
          rewrite_suggestions: {
            hooks: [],
            shot_list: [],
            script_outline: [],
          },
        });
      }
      return Response.json({ ...parsed, tier: 'full', remaining: creditStatus?.remaining ?? null });
    } catch (error) {
      console.log('OpenAI analyze JSON parse error', error);
      const repairPrompt = `Fix this into valid JSON only, using the exact schema.\n\n${content}`;
      const repairResponse = await callOpenAi(apiKey, repairPrompt);

      if (!repairResponse.ok) {
        const repairErrorText = await repairResponse.text();
        console.log('OpenAI analyze repair error', repairErrorText);
        return Response.json({ error: 'We couldn’t analyze this video. Try a shorter clip or try again.' }, { status: 502 });
      }

      const repairPayload = (await repairResponse.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const repairedContent = repairPayload?.choices?.[0]?.message?.content ?? '';
      try {
        const repairedParsed = parseAnalysisJson(repairedContent);
        if (isPreview) {
        return Response.json({
            tier: 'preview',
            hook_analysis: {
              hook_text: repairedParsed.hook_analysis.hook_text,
              why_it_works: repairedParsed.hook_analysis.why_it_works.slice(0, 3),
            },
            structure_breakdown: [],
            rewrite_suggestions: {
              hooks: [],
              shot_list: [],
              script_outline: [],
            },
          });
        }
      return Response.json({ ...repairedParsed, tier: 'full', remaining: creditStatus?.remaining ?? null });
      } catch (repairError) {
        console.log('OpenAI analyze repair JSON parse error', repairError);
        return Response.json({ error: 'We couldn’t analyze this video. Try a shorter clip or try again.' }, { status: 502 });
      }
    }
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'We couldn’t analyze this video. Try a shorter clip or try again.' }, { status: 500 });
  }
}
