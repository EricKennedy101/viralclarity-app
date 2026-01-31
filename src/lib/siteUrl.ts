export const getSiteUrl = () => {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return base.replace(/\/$/, '');
};
