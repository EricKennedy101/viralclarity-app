import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server-internal';
import { UPLOAD_BUCKET } from '@/utils/supabase/storage';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const JSON_CONTENT_TYPE = 'application/json';

export async function GET() {
  return Response.json({ error: 'Method not allowed. Use POST.' }, { status: 405, headers: { Allow: 'POST' } });
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'We couldn’t analyze this video. Try a shorter clip or try again.' }, { status: 500 });
    }

    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes(JSON_CONTENT_TYPE)) {
      return Response.json({ error: 'Expected JSON body with storagePath.' }, { status: 415 });
    }

    const body = (await request.json()) as { storagePath?: string };
    if (!body?.storagePath) {
      return Response.json({ error: 'Upload failed. Please select a video to transcribe.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.storage.from(UPLOAD_BUCKET).download(body.storagePath);

    if (error || !data) {
      console.log(error);
      return Response.json({ error: 'Upload failed / Transcription failed. Try again.' }, { status: 500 });
    }

    if (data.size > MAX_FILE_SIZE_BYTES) {
      return Response.json({ error: 'Video too large. Please upload a shorter clip (≤60s).' }, { status: 413 });
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const openAiForm = new FormData();
    openAiForm.append('file', new File([buffer], 'upload.mp4', { type: 'video/mp4' }));
    openAiForm.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openAiForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('OpenAI transcription error', errorText);
      return Response.json({ error: 'We couldn’t analyze this video. Try a shorter clip or try again.' }, { status: 502 });
    }

    const payload = (await response.json()) as { text?: string };
    if (!payload?.text) {
      return Response.json({ error: 'We couldn’t analyze this video. Try a shorter clip or try again.' }, { status: 502 });
    }

    return Response.json({ transcript: payload.text });
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'We couldn’t analyze this video. Try a shorter clip or try again.' }, { status: 500 });
  }
}
