import { NextRequest } from 'next/server';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const isSupportedMediaType = (type: string) => type.startsWith('audio/') || type.startsWith('video/');

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'We couldn’t analyze this video. Try a shorter clip or try again.' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return Response.json({ error: 'Upload failed. Make sure your video is under 50MB.' }, { status: 400 });
    }

    if (!isSupportedMediaType(file.type)) {
      return Response.json({ error: 'Upload failed. Please upload an MP4 or QuickTime video.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return Response.json({ error: 'Upload failed. Make sure your video is under 50MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const openAiForm = new FormData();
    openAiForm.append('file', new File([buffer], file.name, { type: file.type }));
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
