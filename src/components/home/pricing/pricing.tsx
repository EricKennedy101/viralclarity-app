export function Pricing() {
  return (
    <div className="mx-auto max-w-7xl relative px-[32px] flex flex-col items-center justify-between">
      <div className="text-center">
        <div className="text-3xl font-semibold">Beta access</div>
        <p className="mt-2 text-sm text-muted-foreground">Beta pricing TBD.</p>
      </div>
      <div className="mt-6 w-full max-w-xl rounded-lg border border-border bg-background/70 px-6 py-6 text-sm text-muted-foreground">
        <ul className="space-y-2">
          <li>3 analyses/day</li>
          <li>Uploads supported (MP4)</li>
          <li>TikTok/IG links: Pro (coming soon)</li>
        </ul>
      </div>
    </div>
  );
}
