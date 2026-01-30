import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const BUCKET_NAME = 'viralclarity-uploads';
const ALLOWED_TYPES = new Set(['video/mp4', 'video/quicktime']);

const getMonthKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const createFileId = () => {
  if (typeof globalThis !== 'undefined' && 'crypto' in globalThis && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  return `upload-${Math.random().toString(36).slice(2, 10)}`;
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

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return Response.json({ error: 'Upload failed. Make sure your video is under 50MB.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return Response.json({ error: 'Upload failed. Please upload an MP4 or QuickTime video.' }, { status: 400 });
    }

    const monthKey = getMonthKey(new Date());
    const fileId = createFileId();
    const storagePath = `${user.id}/${monthKey}/${fileId}.mp4`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.log(error);
      return Response.json({ error: 'Upload failed. Make sure your video is under 50MB.' }, { status: 500 });
    }

    return Response.json({ storage_path: storagePath });
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Upload failed. Make sure your video is under 50MB.' }, { status: 500 });
  }
}
