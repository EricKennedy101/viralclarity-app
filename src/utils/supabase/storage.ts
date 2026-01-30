export const UPLOAD_BUCKET = 'viralclarity-uploads';

const sanitizeFilename = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '') || 'video.mp4';

export const getUploadPath = (userId: string | null, filename: string) => {
  const safeName = sanitizeFilename(filename);
  const uuid =
    typeof globalThis !== 'undefined' && 'crypto' in globalThis && 'randomUUID' in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);
  if (userId) {
    return `users/${userId}/${uuid}-${safeName}`;
  }
  return `anon/${uuid}-${safeName}`;
};
