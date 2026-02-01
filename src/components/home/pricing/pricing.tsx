export function Pricing() {
  return (
    <div className="mx-auto max-w-7xl relative px-[32px] flex flex-col items-center justify-between">
      <div className="text-center">
        <div className="text-3xl font-semibold">Beta access (free)</div>
      </div>
      <div className="mt-6 w-full max-w-xl rounded-lg border border-border bg-background/70 px-6 py-6 text-sm text-muted-foreground">
        <ul className="space-y-2">
          <li>Analyze up to 3 videos per day</li>
          <li>Full breakdown during beta</li>
          <li>Upload MP4 videos</li>
          <li>TikTok &amp; Instagram links coming soon</li>
        </ul>
      </div>
    </div>
  );
}
