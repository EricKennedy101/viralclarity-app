export function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="mx-auto max-w-7xl px-8 py-12 text-center text-sm text-muted-foreground">
      <div>© {year} Viral Clarity · Built for creators</div>
      <div className="mt-1 text-xs text-muted-foreground">Not affiliated with TikTok.</div>
    </div>
  );
}
