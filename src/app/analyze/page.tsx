'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/components/viralclarity/AnalysisResult';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { VideoAnalysisRecord } from '@/lib/viralclarity/types';

type AnalyzeApiResponse =
  | {
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
    };

const createId = () => {
  if (typeof globalThis !== 'undefined' && 'crypto' in globalThis && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  return `analysis-${Math.random().toString(36).slice(2, 10)}`;
};

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [analysis, setAnalysis] = useState<VideoAnalysisRecord | null>(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');

  const handleAnalyzeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmedUrl = sourceUrl.trim();
    if (!file && !trimmedUrl) {
      setAnalysis(null);
      setError('Add a video file or paste a URL to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      let transcript: string | undefined;
      if (file) {
        setAnalysisStep('Transcribing video…');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? 'We couldn’t analyze this video. Try a shorter clip or try again.');
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
        setError(analyzePayload.message ?? 'Free tier limit reached. Upgrade to unlock full analysis.');
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
        setAnalysis(lockedAnalysis);
        return;
      }

      const typedPayload = analyzePayload as Exclude<AnalyzeApiResponse, { locked: true }>;
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
          notes: typedPayload.hook_analysis.why_it_works.join(' '),
          keep: [],
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

      setAnalysis(nextAnalysis);
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

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Analyze a video</CardTitle>
          <CardDescription>Upload an MP4 or paste a URL to get an instant mock analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleAnalyzeSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="video-upload">
                Upload MP4
              </label>
              <Input
                id="video-upload"
                type="file"
                accept="video/mp4"
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
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" size="lg" className="w-full text-base" disabled={isAnalyzing}>
              {isAnalyzing ? 'Transcribing...' : 'Analyze'}
            </Button>
            {isAnalyzing ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                <span>{analysisStep || 'Working...'}</span>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {analysis ? (
        <AnalysisResult analysis={analysis} />
      ) : (
        <div className="mt-6 rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
          Upload a video to see why it worked — or why it didn’t.
        </div>
      )}
    </div>
  );
}
