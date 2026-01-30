import type { VideoAnalysisRecord } from '@/lib/viralclarity/types';

export const toPreviewAnalysis = (full: VideoAnalysisRecord): VideoAnalysisRecord => ({
  ...full,
  hookAnalysis: {
    ...full.hookAnalysis,
    keep: [],
    improve: [],
  },
  structureBreakdown: [],
  rewriteSuggestions: {
    hooks: [],
    shotList: [],
    scriptOutline: [],
  },
});
