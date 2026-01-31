'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useUserInfo } from '@/hooks/useUserInfo';
import '../../styles/home-page.css';
import Header from '@/components/home/header/header';
import { HeroSection } from '@/components/home/hero-section/hero-section';
import { HomePageBackground } from '@/components/gradients/home-page-background';
import { Footer } from '@/components/home/footer/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AnalysisResult } from '@/components/viralclarity/AnalysisResult';
import type { AnalysisTier, VideoAnalysisRecord } from '@/lib/viralclarity/types';
import { toPreviewAnalysis } from '@/lib/viralclarity/preview';
import { UPLOAD_BUCKET } from '@/utils/supabase/storage';

type AnalyzeApiResponse =
  | {
      tier?: 'preview' | 'full';
      remaining?: number | null;
      hook_analysis: {
        hook_text: string;
        why_it_works: string[];
      };
      structure_breakdown: Array<{
        beat: string;
        description: string;
      }>;
      rewrite_suggestions: {
        hooks: string[];
        shot_list: string[];
        script_outline: string[];
      };
    }
  | {
      locked: true;
      message?: string;
      remaining?: number | null;
    };

const createId = () => {
  if (typeof globalThis !== 'undefined' && 'crypto' in globalThis && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  return `analysis-${Math.random().toString(36).slice(2, 10)}`;
};

export function HomePage() {
  const supabase = createClient();
  const { user, isAuthed } = useUserInfo(supabase);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [analysis, setAnalysis] = useState<VideoAnalysisRecord | null>(null);
  const [analysisTier, setAnalysisTier] = useState<AnalysisTier>('full');
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const router = useRouter();
  const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

  const handleAnalyzeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSaveError('');

    const trimmedUrl = sourceUrl.trim();
    if (!file && !trimmedUrl) {
      setAnalysis(null);
      setError('Add a video file or paste a URL to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      setStoragePath(null);
      let transcript: string | undefined;
      if (file) {
        setAnalysisStep('Transcribing video…');
        if (!file.type.startsWith('video/')) {
          throw new Error('Upload failed. Please upload an MP4 or QuickTime video.');
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new Error('Video too large. Please upload a shorter clip (≤60s).');
        }
        if (!supabase) {
          throw new Error('Upload failed. Please refresh and try again.');
        }

        const uploadUrlResponse = await fetch('/api/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });

        if (!uploadUrlResponse.ok) {
          const errorText = await uploadUrlResponse.text();
          throw new Error(errorText || 'Upload failed. Please try again.');
        }

        const uploadUrlContentType = uploadUrlResponse.headers.get('content-type') ?? '';
        if (!uploadUrlContentType.includes('application/json')) {
          throw new Error('Upload failed. Please try again.');
        }

        const uploadUrlPayload = (await uploadUrlResponse.json()) as { path?: string; token?: string };
        if (!uploadUrlPayload?.path || !uploadUrlPayload?.token) {
          throw new Error('Upload failed. Please try again.');
        }

        const { error: uploadError } = await supabase.storage
          .from(UPLOAD_BUCKET)
          .uploadToSignedUrl(uploadUrlPayload.path, uploadUrlPayload.token, file, {
            contentType: file.type,
          });

        if (uploadError) {
          if (process.env.NODE_ENV !== 'production') {
            console.log({ error: uploadError });
          }
          const errorMessage = uploadError.message ?? 'Upload failed. Please try again.';
          const statusSuffix =
            typeof (uploadError as { statusCode?: number }).statusCode === 'number'
              ? ` (status ${(uploadError as { statusCode?: number }).statusCode})`
              : '';
          throw new Error(`${errorMessage}${statusSuffix}`);
        }

        setStoragePath(uploadUrlPayload.path);

        const transcribeBody = { storagePath: uploadUrlPayload.path };
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transcribeBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 413) {
            throw new Error('Video too large. Please upload a shorter clip (≤60s).');
          }
          throw new Error(errorText || 'Upload failed / Transcription failed. Try again.');
        }

        const contentType = response.headers.get('content-type') ?? '';
        if (!contentType.includes('application/json')) {
          throw new Error('Transcription failed. Please try again.');
        }

        let payload: { transcript?: string; error?: string } | null = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        transcript = payload?.transcript;
      }

      const resolvedTranscript =
        transcript ??
        `Transcript unavailable for URLs yet. Source: ${trimmedUrl || 'upload'}.\nSummarize the key beats and hooks.`;

      const steps = ['Analyzing hook', 'Mapping retention beats', 'Generating rewrite ideas'];
      let stepIndex = 0;
      setAnalysisStep(steps[stepIndex]);
      const stepTimer = window.setInterval(() => {
        stepIndex = (stepIndex + 1) % steps.length;
        setAnalysisStep(steps[stepIndex]);
      }, 1200);

      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: resolvedTranscript }),
      });
      window.clearInterval(stepTimer);

      const analyzePayload = (await analyzeResponse.json()) as AnalyzeApiResponse | { error?: string };
      if (!analyzeResponse.ok) {
        throw new Error(
          (analyzePayload as { error?: string })?.error ??
            'We couldn’t analyze this video. Try a shorter clip or try again.',
        );
      }

      if ('locked' in analyzePayload && analyzePayload.locked) {
        setError(analyzePayload.message ?? 'Daily limit reached. Come back tomorrow.');
        setRemainingCredits(analyzePayload.remaining ?? 0);
        const lockedAnalysis: VideoAnalysisRecord = {
          id: createId(),
          status: 'completed',
          locked: true,
          sourceType: file ? 'upload' : 'url',
          sourceUrl: trimmedUrl || null,
          storagePath: null,
          transcript: resolvedTranscript.slice(0, 300),
          hookAnalysis: {
            openingLine: '',
            hookType: 'analysis',
            score: 0,
            notes: '',
            keep: [],
            improve: [],
          },
          structureBreakdown: [],
          rewriteSuggestions: {
            hooks: [],
            shotList: [],
            scriptOutline: [],
          },
          createdAt: new Date().toISOString(),
        };
        setAnalysisTier('full');
        setAnalysis(lockedAnalysis);
        return;
      }

      const typedPayload = analyzePayload as Exclude<AnalyzeApiResponse, { locked: true }>;
      const tier = typedPayload.tier ?? 'full';
      const nextAnalysis: VideoAnalysisRecord = {
        id: createId(),
        status: 'completed',
        locked: false,
        sourceType: file ? 'upload' : 'url',
        sourceUrl: trimmedUrl || null,
        storagePath: null,
        transcript: resolvedTranscript,
        hookAnalysis: {
          openingLine: typedPayload.hook_analysis.hook_text,
          hookType: 'analysis',
          score: 0,
          notes: tier === 'preview' ? '' : typedPayload.hook_analysis.why_it_works.join(' '),
          keep: typedPayload.hook_analysis.why_it_works,
          improve: [],
        },
        structureBreakdown: typedPayload.structure_breakdown.map((beat) => ({
          start: '',
          end: '',
          label: beat.beat,
          purpose: beat.description,
        })),
        rewriteSuggestions: {
          hooks: typedPayload.rewrite_suggestions.hooks.map((hook) => ({
            line: hook,
            angle: 'Rewrite',
          })),
          shotList: typedPayload.rewrite_suggestions.shot_list.map((shot) => ({
            timestamp: '',
            shot,
          })),
          scriptOutline: typedPayload.rewrite_suggestions.script_outline.map((section, index) => ({
            section: `Beat ${index + 1}`,
            notes: section,
          })),
        },
        createdAt: new Date().toISOString(),
      };

      const resolvedTier: AnalysisTier = !isAuthed ? 'preview' : tier;
      setRemainingCredits(typeof typedPayload.remaining === 'number' ? typedPayload.remaining : null);
      setAnalysisTier(resolvedTier);
      setAnalysis(resolvedTier === 'preview' ? toPreviewAnalysis(nextAnalysis) : nextAnalysis);
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : 'We couldn’t analyze this video. Try a shorter clip or try again.',
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysis) {
      return;
    }

    if (!user) {
      setSaveError('Log in to save this analysis.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const nextStoragePath = storagePath;

      const response = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: analysis.sourceType,
          source_url: analysis.sourceUrl,
          storage_path: nextStoragePath,
          transcript: analysis.transcript,
          hook_analysis: analysis.hookAnalysis,
          structure_breakdown: analysis.structureBreakdown,
          rewrite_suggestions: analysis.rewriteSuggestions,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? 'We couldn’t save your analysis. Try again.');
      }

      router.push(`/analyses/${payload.id}`);
    } catch (saveError) {
      setSaveError(saveError instanceof Error ? saveError.message : 'We couldn’t save your analysis. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div>
        <HomePageBackground />
        <Header user={user} />
        <HeroSection />
        <section className="mx-auto w-full max-w-4xl px-4 pb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Analyze a video</CardTitle>
              <CardDescription>
                Beta: Upload an MP4 for a full breakdown. TikTok/IG links are Pro (coming soon).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAnalyzeSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="video-upload">
                    Upload MP4
                  </label>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/mp4,video/quicktime"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="video-url">
                    Or paste URL
                  </label>
                  <Input
                    id="video-url"
                    type="url"
                    placeholder="https://..."
                    value={sourceUrl}
                    onChange={(event) => setSourceUrl(event.target.value)}
                  />
                  {!file && sourceUrl.trim().length > 0 ? (
                    <p className="text-xs text-muted-foreground">Upload required for transcript soon.</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">TikTok/IG link paste: coming soon.</p>
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" size="lg" className="w-full" disabled={isAnalyzing}>
                  {isAnalyzing ? 'Transcribing...' : 'Analyze (Beta — free)'}
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={user ? '/app' : '/signup'}>
                    {user ? 'Go to dashboard' : 'Save results (create free account)'}
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground">No signup required. Limited preview.</p>
                <p className="text-xs text-muted-foreground">Credits: 3 analyses/day (may change during beta).</p>
                {user && remainingCredits !== null ? (
                  <p className="text-xs text-muted-foreground">You have {remainingCredits} credits left today.</p>
                ) : null}
                {isAnalyzing ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    <span>{analysisStep || 'Working...'}</span>
                  </div>
                ) : null}
              </form>
              {analysis ? (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button type="button" onClick={handleSaveAnalysis} disabled={isSaving || !user}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  {!user ? (
                    <p className="text-xs text-muted-foreground">Log in to save this analysis.</p>
                  ) : null}
                  {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {user ? (
            <div className="mt-4 rounded-md border border-border bg-background p-4">
              <div className="text-sm font-medium">Your workspace</div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button asChild variant="outline">
                  <Link href="/history">Saved history</Link>
                </Button>
                <Button variant="outline" disabled className="justify-between gap-2">
                  <span>Templates</span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                    Coming soon
                  </span>
                </Button>
              </div>
            </div>
          ) : null}

          {analysis ? (
            <AnalysisResult analysis={analysis} tier={analysisTier} />
          ) : (
            <div className="mt-6 rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
              Upload a video to see why it worked — or why it didn’t.
            </div>
          )}
        </section>
        <section className="mx-auto w-full max-w-4xl px-4 pb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Beta access</CardTitle>
              <CardDescription>Everything is free during beta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>3 analyses/day</p>
              <p>Uploads supported (MP4)</p>
              <p>TikTok/IG links: Pro (coming soon)</p>
            </CardContent>
          </Card>
        </section>
        <Footer />
      </div>
    </>
  );
}
