import type {
  AnalysisInput,
  HookAnalysis,
  RewriteSuggestions,
  StructureBreakdown,
  VideoAnalysisRecord,
} from '@/lib/viralclarity/types';

const formatTimestamp = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const createId = () => {
  if (typeof globalThis !== 'undefined' && 'crypto' in globalThis && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  return `mock-${Math.random().toString(36).slice(2, 10)}`;
};

const buildTranscript = (input: AnalysisInput) => {
  const sourceLabel = input.sourceType === 'upload' ? 'uploaded clip' : 'link';
  const sourceDetail = input.fileName ?? input.sourceUrl ?? 'your source';
  return [
    `Today we are breaking down the ${sourceLabel} from ${sourceDetail}.`,
    `I tested a simple framing shift that makes the first five seconds feel more urgent without overselling.`,
    `Notice how the hook sets a clear promise, then the body delivers three tangible proof points.`,
    `If you are rewriting this, keep the pace tight by cutting any filler between beats two and three.`,
    `I also suggest a quick pattern interrupt around the 20-second mark to reset attention.`,
    `We will finish with a concise takeaway and a single next step the viewer can act on right now.`,
  ].join(' ');
};

const buildHookAnalysis = (): HookAnalysis => ({
  openingLine: 'Most videos lose 70% of viewers before the first 10 seconds.',
  hookType: 'contrast',
  score: 8.6,
  notes: 'Clear contrast + data point makes the opener feel credible and urgent.',
  keep: ['Lead with a specific statistic.', 'Use a short, declarative sentence.'],
  improve: ['Add a micro-pause for emphasis.', 'Pair the stat with a quick visual cut.'],
});

const buildStructureBreakdown = (): StructureBreakdown => [
  { start: formatTimestamp(0), end: formatTimestamp(6), label: 'Hook', purpose: 'Grab attention with contrast + stat.' },
  { start: formatTimestamp(6), end: formatTimestamp(14), label: 'Promise', purpose: 'State the outcome the viewer gets.' },
  { start: formatTimestamp(14), end: formatTimestamp(24), label: 'Proof', purpose: 'Show the first proof point fast.' },
  { start: formatTimestamp(24), end: formatTimestamp(36), label: 'Process', purpose: 'Outline the steps at a glance.' },
  { start: formatTimestamp(36), end: formatTimestamp(48), label: 'Payoff', purpose: 'Show the result or before/after.' },
  { start: formatTimestamp(48), end: formatTimestamp(58), label: 'CTA', purpose: 'One clear next action.' },
];

const buildRewriteSuggestions = (): RewriteSuggestions => ({
  hooks: [
    { line: 'If your videos drop viewers early, this fixes it in 30 seconds.', angle: 'Problem/solution' },
    { line: 'Here is the 3-step opening that held 82% retention.', angle: 'Proof + method' },
    { line: 'Most hooks fail because they start too wide. Try this.', angle: 'Contrast + curiosity' },
    { line: 'I rewrote this intro and doubled the watch time.', angle: 'Story + outcome' },
    { line: 'Stop losing viewers in the first 5 seconds. Do this instead.', angle: 'Direct challenge' },
  ],
  shotList: [
    { timestamp: formatTimestamp(0), shot: 'Tight head-and-shoulders with bold stat overlay.' },
    { timestamp: formatTimestamp(4), shot: 'Quick jump cut to B-roll of analytics graph.' },
    { timestamp: formatTimestamp(10), shot: 'On-screen list of 3 steps with subtle motion.' },
    { timestamp: formatTimestamp(18), shot: 'Split-screen before/after examples.' },
    { timestamp: formatTimestamp(28), shot: 'Pattern interrupt: color shift + sound hit.' },
    { timestamp: formatTimestamp(40), shot: 'Result shot with retention curve.' },
    { timestamp: formatTimestamp(52), shot: 'Clear CTA lower-third.' },
  ],
  scriptOutline: [
    { section: 'Hook', notes: 'Lead with a bold stat and the consequence.' },
    { section: 'Promise', notes: 'Name the exact improvement (retention or watch time).' },
    { section: 'Proof', notes: 'One quick example or number.' },
    { section: 'Steps', notes: 'Deliver 2-3 concrete moves.' },
    { section: 'Payoff', notes: 'Show the result or a quick demo.' },
    { section: 'CTA', notes: 'Single action: follow/subscribe/comment.' },
  ],
});

export const mockAnalyze = (input: AnalysisInput): VideoAnalysisRecord => {
  const transcript = input.transcript?.trim() ? input.transcript : buildTranscript(input);
  return {
    id: createId(),
    status: 'completed',
    locked: false,
    sourceType: input.sourceType,
    sourceUrl: input.sourceType === 'url' ? input.sourceUrl ?? null : null,
    storagePath: input.sourceType === 'upload' ? `uploads/${input.fileName ?? 'video.mp4'}` : null,
    transcript,
    hookAnalysis: buildHookAnalysis(),
    structureBreakdown: buildStructureBreakdown(),
    rewriteSuggestions: buildRewriteSuggestions(),
    createdAt: new Date().toISOString(),
  };
};
