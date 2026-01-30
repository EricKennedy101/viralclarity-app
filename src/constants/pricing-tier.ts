export interface Tier {
  name: string;
  id: 'starter' | 'pro' | 'advanced';
  icon: string;
  description: string;
  features: string[];
  featured: boolean;
  priceId: Record<string, string>;
}

export const PricingTier: Tier[] = [
  {
    name: 'Free',
    id: 'starter',
    icon: '/assets/icons/price-tiers/free-icon.svg',
    description: '',
    features: [
      '3 analysis / month',
      'Transcript + partial insights (locked sections)',
      'Save up to 3 templates',
      'Basic export (copy)',
    ],
    featured: false,
    priceId: { month: 'pri_01hsxyh9txq4rzbrhbyngkhy46', year: 'pri_01hsxyh9txq4rzbrhbyngkhy46' },
  },
  {
    name: 'Pro',
    id: 'pro',
    icon: '/assets/icons/price-tiers/basic-icon.svg',
    description: '',
    features: [
      'Unlimited analysis',
      'Full insights: Hook + Retention beats + Rewrite kit',
      'Unlimited templates',
      'Export: Markdown',
      'Faster processing',
    ],
    featured: true,
    priceId: { month: 'pri_01hsxycme6m95sejkz7sbz5e9g', year: 'pri_01hsxyeb2bmrg618bzwcwvdd6q' },
  },
  {
    name: 'Advanced',
    id: 'advanced',
    icon: '/assets/icons/price-tiers/pro-icon.svg',
    description: '',
    features: [
      'Shared workspaces',
      'Brand voice presets',
      'Agency / multi-account support',
      'Priority support & onboarding',
    ],
    featured: false,
    priceId: { month: 'pri_01hsxyff091kyc9rjzx7zm6yqh', year: 'pri_01hsxyfysbzf90tkh2wqbfxwa5' },
  },
];
