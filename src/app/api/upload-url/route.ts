import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server-internal';
import { getUploadPath, UPLOAD_BUCKET } from '@/utils/supabase/storage';

const JSON_CONTENT_TYPE = 'application/json';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes(JSON_CONTENT_TYPE)) {
      return Response.json({ error: 'Expected JSON body.' }, { status: 415 });
    }

    const body = (await request.json()) as { filename?: string; contentType?: string };
    if (!body?.filename) {
      return Response.json({ error: 'Upload failed. Please select a video file.' }, { status: 400 });
    }

    if (body.contentType && !body.contentType.startsWith('video/')) {
      return Response.json({ error: 'Upload failed. Please upload an MP4 or QuickTime video.' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = getUploadPath(user?.id ?? null, body.filename);
    const { data, error } = await supabase.storage.from(UPLOAD_BUCKET).createSignedUploadUrl(path);

    if (error || !data?.signedUrl || !data?.token) {
      console.log(error);
      return Response.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
    }

    return Response.json({ path, token: data.token });
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
