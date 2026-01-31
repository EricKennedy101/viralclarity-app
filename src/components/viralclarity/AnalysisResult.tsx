'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { VideoAnalysisRecord } from '@/lib/viralclarity/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { Lock } from 'lucide-react';

type AnalysisResultProps = {
  analysis: VideoAnalysisRecord;
  tier?: 'preview' | 'full';
};

export function AnalysisResult({ analysis, tier = 'full' }: AnalysisResultProps) {
  const isLocked = Boolean(analysis.locked);
  const isPreview = tier === 'preview';
  const isGated = isLocked || isPreview;
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState('');
  const previewBeats = [
    { start: '', end: '', label: 'Hook', purpose: 'Opening moment designed to stop the scroll.' },
    { start: '', end: '', label: 'Promise', purpose: 'Clarify the outcome the viewer gets.' },
    { start: '', end: '', label: 'Payoff', purpose: 'Deliver the result quickly and clearly.' },
  ];
  const previewHooks = [
    'Show the core promise in the first sentence.',
    'Use a contrast moment to reset attention.',
    'Tease the payoff without overexplaining.',
  ];

  const handleSaveTemplate = async () => {
    if (!templateTitle.trim()) {
      setTemplateError('Please enter a title.');
      return;
    }

    setTemplateError('');
    setIsSavingTemplate(true);

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: templateTitle.trim(),
          template: {
            hook_analysis: analysis.hookAnalysis,
            structure_breakdown: analysis.structureBreakdown,
            rewrite_suggestions: analysis.rewriteSuggestions,
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to save template.');
      }

      toast({
        description: 'Template saved.',
        action: (
          <ToastAction altText="View templates" asChild>
            <Link href="/templates">View templates</Link>
          </ToastAction>
        ),
      });

      setIsDialogOpen(false);
      setTemplateTitle('');
    } catch (error) {
      setTemplateError(error instanceof Error ? error.message : 'Unable to save template.');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl">Analysis Result</CardTitle>
          {!isPreview ? (
            <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>
              Save as Template
            </Button>
          ) : null}
        </div>
        <CardDescription>
          Source: {analysis.sourceType === 'upload' ? 'Upload' : 'URL'} •{' '}
          {new Date(analysis.createdAt).toLocaleString()}
        </CardDescription>
        {isLocked ? (
          <div className="rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
            Daily limit reached. Come back tomorrow.
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        {isPreview ? (
          <div className="mb-4 rounded-md border border-border bg-background p-4 text-sm">
            <div className="font-medium">Create a free account to unlock the full breakdown</div>
            <p className="mt-2 text-muted-foreground">
              Beta: uploads include full insights after you sign in. TikTok/IG links are Pro (coming soon).
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/signup">Create free account</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>
        ) : null}
        {isLocked ? (
          <div className="mb-4 rounded-md border border-border bg-background p-4 text-sm">
            <div className="font-medium">Daily limit reached</div>
            <p className="mt-2 text-muted-foreground">Come back tomorrow for more credits.</p>
          </div>
        ) : null}
        {isPreview && (
          <p className="mb-3 text-xs text-muted-foreground">
            Preview only — create an account to unlock full analysis, saves, and templates.
          </p>
        )}
        <Tabs defaultValue="transcript" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="hook">Hook breakdown</TabsTrigger>
            <TabsTrigger value="beats">
              {isPreview ? <Lock className="mr-1 h-3 w-3" aria-hidden="true" /> : null}
              Beat map
            </TabsTrigger>
            <TabsTrigger value="rewrites">
              {isPreview ? <Lock className="mr-1 h-3 w-3" aria-hidden="true" /> : null}
              Rewrite suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transcript" className="mt-4">
            <div className="rounded-md border border-border bg-background p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {analysis.transcript}
            </div>
            {isLocked ? (
              <p className="mt-2 text-xs text-muted-foreground">Transcript truncated. Come back tomorrow.</p>
            ) : null}
          </TabsContent>

          <TabsContent value="hook" className="mt-4">
            <div className="relative">
              {isLocked ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md border border-border bg-background/80 text-sm font-medium">
                  Daily limit reached
                </div>
              ) : null}
              <div className={`space-y-4 text-sm ${isLocked ? 'blur-sm pointer-events-none select-none' : ''}`}>
                <div className="rounded-md border border-border bg-background p-4">
                  <div className="text-xs uppercase text-muted-foreground">Opening line</div>
                  <div className="mt-1 text-base font-semibold">{analysis.hookAnalysis.openingLine}</div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border px-2 py-1">
                      Type: {analysis.hookAnalysis.hookType}
                    </span>
                    <span className="rounded-full border border-border px-2 py-1">
                      Score:{' '}
                      {typeof analysis.hookAnalysis.score === 'number'
                        ? analysis.hookAnalysis.score.toFixed(1)
                        : 'N/A'}
                    </span>
                  </div>
                  {analysis.hookAnalysis.notes ? <p className="mt-3 text-sm">{analysis.hookAnalysis.notes}</p> : null}
                </div>

                {!isPreview ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-md border border-border bg-background p-4">
                      <div className="text-xs uppercase text-muted-foreground">Why it works</div>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {(analysis.hookAnalysis.keep ?? []).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-md border border-border bg-background p-4">
                      <div className="text-xs uppercase text-muted-foreground">Improve</div>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {(analysis.hookAnalysis.improve ?? []).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-border bg-background p-4">
                    <div className="text-xs uppercase text-muted-foreground">First 1–3 seconds</div>
                    <p className="mt-2 text-sm">
                      {analysis.hookAnalysis.notes ||
                        'This opening sets the promise fast so viewers know why to keep watching.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="beats" className="mt-4">
            <div className="relative">
              {isGated ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md border border-border bg-background/80 text-sm font-medium">
                  <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                  {isPreview ? 'Create an account to unlock this section' : 'Daily limit reached'}
                </div>
              ) : null}
              <div className={`space-y-3 text-sm ${isGated ? 'blur-sm pointer-events-none select-none' : ''}`}>
                {(analysis.structureBreakdown.length > 0 ? analysis.structureBreakdown : previewBeats).map((beat) => (
                  <div key={`${beat.start}-${beat.label}`} className="rounded-md border border-border bg-background p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{beat.start && beat.end ? `${beat.start} - ${beat.end}` : beat.label}</span>
                      <span className="rounded-full border border-border px-2 py-1">{beat.label}</span>
                    </div>
                    <p className="mt-2 font-medium">{beat.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rewrites" className="mt-4">
            <div className="relative">
              {isGated ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md border border-border bg-background/80 text-sm font-medium">
                  <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                  {isPreview ? 'Create an account to unlock this section' : 'Daily limit reached'}
                </div>
              ) : null}
              <div className={`space-y-5 text-sm ${isGated ? 'blur-sm pointer-events-none select-none' : ''}`}>
                <div className="rounded-md border border-border bg-background p-4">
                  <div className="text-xs uppercase text-muted-foreground">Hook rewrites</div>
                  <ul className="mt-3 space-y-2">
                    {(analysis.rewriteSuggestions.hooks.length > 0
                      ? analysis.rewriteSuggestions.hooks
                      : previewHooks.map((line) => ({ line, angle: 'Locked' }))
                    ).map((hook) => (
                      <li key={hook.line} className="rounded-md border border-border px-3 py-2">
                        <div className="text-xs text-muted-foreground">{hook.angle}</div>
                        <div className="mt-1 font-medium">{hook.line}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-md border border-border bg-background p-4">
                  <div className="text-xs uppercase text-muted-foreground">Shot list</div>
                  <ul className="mt-3 space-y-2">
                    {(analysis.rewriteSuggestions.shotList.length > 0
                      ? analysis.rewriteSuggestions.shotList
                      : [{ timestamp: '', shot: 'Locked for preview' }]
                    ).map((shot) => (
                      <li key={`${shot.timestamp}-${shot.shot}`} className="flex gap-3">
                        {shot.timestamp ? <span className="text-xs text-muted-foreground">{shot.timestamp}</span> : null}
                        <span>{shot.shot}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-md border border-border bg-background p-4">
                  <div className="text-xs uppercase text-muted-foreground">Script outline</div>
                  <ul className="mt-3 space-y-2">
                    {(analysis.rewriteSuggestions.scriptOutline.length > 0
                      ? analysis.rewriteSuggestions.scriptOutline
                      : [{ section: 'Locked', notes: 'Create an account to unlock the outline.' }]
                    ).map((section) => (
                      <li key={section.section} className="rounded-md border border-border px-3 py-2">
                        <div className="text-xs text-muted-foreground">{section.section}</div>
                        <div className="mt-1">{section.notes}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      {!isPreview ? (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
              <DialogDescription>Give this template a short, memorable name.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Input
                placeholder="Template title"
                value={templateTitle}
                onChange={(event) => setTemplateTitle(event.target.value)}
              />
              {templateError ? <p className="text-xs text-destructive">{templateError}</p> : null}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} type="button">
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} type="button" disabled={isSavingTemplate}>
                {isSavingTemplate ? 'Saving...' : 'Save Template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </Card>
  );
}
