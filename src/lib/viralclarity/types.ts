export type AnalysisInput = {
  sourceType: 'upload' | 'url';
  sourceUrl?: string;
  fileName?: string;
  transcript?: string;
};

export type HookAnalysis = {
  openingLine: string;
  hookType: 'curiosity' | 'authority' | 'contrast' | 'challenge' | 'story' | string;
  score: number;
  notes: string;
  keep: string[];
  improve: string[];
};

export type StructureBeat = {
  start: string;
  end: string;
  label: string;
  purpose: string;
};

export type StructureBreakdown = StructureBeat[];

export type RewriteSuggestions = {
  hooks: Array<{
    line: string;
    angle: string;
  }>;
  shotList: Array<{
    timestamp: string;
    shot: string;
  }>;
  scriptOutline: Array<{
    section: string;
    notes: string;
  }>;
};

export type VideoAnalysisRecord = {
  id: string;
  status: 'completed' | 'processing' | 'failed';
  locked?: boolean;
  sourceType: 'upload' | 'url';
  sourceUrl: string | null;
  storagePath: string | null;
  transcript: string;
  hookAnalysis: HookAnalysis;
  structureBreakdown: StructureBreakdown;
  rewriteSuggestions: RewriteSuggestions;
  createdAt: string;
};
