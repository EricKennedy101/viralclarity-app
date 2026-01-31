import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DemoPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">ViralClarity — Demo</CardTitle>
          <CardDescription>Portfolio snapshot of the product experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-muted-foreground">
          <div>
            <div className="text-sm font-medium text-foreground">Tech stack</div>
            <ul className="mt-2 space-y-1">
              <li>Next.js App Router + React</li>
              <li>Supabase (Auth, DB, Storage)</li>
              <li>OpenAI (Whisper + GPT-4o-mini)</li>
              <li>shadcn/ui + Tailwind</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Features</div>
            <ul className="mt-2 space-y-1">
              <li>Upload MP4s for full breakdowns</li>
              <li>Preview mode for guests</li>
              <li>Daily beta credits (3/day)</li>
              <li>Saved history + templates (coming soon)</li>
            </ul>
          </div>
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
