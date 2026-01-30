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

type AnalysisResultProps = {
  analysis: VideoAnalysisRecord;
};

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const isLocked = Boolean(analysis.locked);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState('');

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
          <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>
            Save as Template
          </Button>
        </div>
        <CardDescription>
          Source: {analysis.sourceType === 'upload' ? 'Upload' : 'URL'} •{' '}
          {new Date(analysis.createdAt).toLocaleString()}
        </CardDescription>
        {isLocked ? (
          <div className="rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
            Upgrade to unlock the full analysis.
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        {isLocked ? (
          <div className="mb-4 rounded-md border border-border bg-background p-4 text-sm">
            <div className="font-medium">Upgrade to unlock full analysis</div>
            <p className="mt-2 text-muted-foreground">Free plan includes 3 analyses/month.</p>
            <Button asChild className="mt-3">
              <Link href="/dashboard/subscriptions">Upgrade</Link>
            </Button>
          </div>
        ) : null}
        <Tabs defaultValue="transcript" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="hook">Hook breakdown</TabsTrigger>
            <TabsTrigger value="beats">Beat map</TabsTrigger>
            <TabsTrigger value="rewrites">Rewrite suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="transcript" className="mt-4">
            <div className="rounded-md border border-border bg-background p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {analysis.transcript}
            </div>
            {isLocked ? (
              <p className="mt-2 text-xs text-muted-foreground">Transcript truncated. Upgrade to unlock the rest.</p>
            ) : null}
          </TabsContent>

          <TabsContent value="hook" className="mt-4">
            <div className="relative">
              {isLocked ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md border border-border bg-background/80 text-sm font-medium">
                  Upgrade to unlock this section
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

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-border bg-background p-4">
                    <div className="text-xs uppercase text-muted-foreground">Keep</div>
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="beats" className="mt-4">
            <div className="relative">
              {isLocked ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md border border-border bg-background/80 text-sm font-medium">
                  Upgrade to unlock this section
                </div>
              ) : null}
              <div className={`space-y-3 text-sm ${isLocked ? 'blur-sm pointer-events-none select-none' : ''}`}>
                {(analysis.structureBreakdown ?? []).map((beat) => (
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
              {isLocked ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md border border-border bg-background/80 text-sm font-medium">
                  Upgrade to unlock this section
                </div>
              ) : null}
              <div className={`space-y-5 text-sm ${isLocked ? 'blur-sm pointer-events-none select-none' : ''}`}>
                <div className="rounded-md border border-border bg-background p-4">
                  <div className="text-xs uppercase text-muted-foreground">Hook rewrites</div>
                  <ul className="mt-3 space-y-2">
                    {(analysis.rewriteSuggestions.hooks ?? []).map((hook) => (
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
                    {(analysis.rewriteSuggestions.shotList ?? []).map((shot) => (
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
                    {(analysis.rewriteSuggestions.scriptOutline ?? []).map((section) => (
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
    </Card>
  );
}
