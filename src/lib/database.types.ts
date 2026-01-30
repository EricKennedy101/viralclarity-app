export interface Subscription {
  subscriptionId: string;
  subscriptionStatus: string;
  priceId: string;
  productId: string;
  scheduledChange: string;
  customerId: string;
  customerEmail: string;
}

export interface VideoAnalysis {
  id: string;
  userId: string;
  status: string;
  sourceType: 'upload' | 'url' | string;
  sourceUrl: string | null;
  storagePath: string | null;
  transcript: string;
  hookAnalysis: Record<string, unknown>;
  structureBreakdown: Record<string, unknown>;
  rewriteSuggestions: Record<string, unknown>;
  createdAt: string;
}

export interface ScriptTemplate {
  id: string;
  userId: string;
  title: string;
  template: Record<string, unknown>;
  createdAt: string;
}
