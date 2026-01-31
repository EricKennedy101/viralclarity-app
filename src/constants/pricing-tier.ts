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
    name: 'Beta',
    id: 'starter',
    icon: '/assets/icons/price-tiers/free-icon.svg',
    description: '',
    features: [
      '3 analyses/day',
      'Full breakdown for uploads',
      'Save results after login',
      'TikTok/IG links: Pro (coming soon)',
    ],
    featured: false,
    priceId: { month: 'pri_01hsxyh9txq4rzbrhbyngkhy46', year: 'pri_01hsxyh9txq4rzbrhbyngkhy46' },
  },
  {
    name: 'Pro (coming soon)',
    id: 'pro',
    icon: '/assets/icons/price-tiers/basic-icon.svg',
    description: '',
    features: [
      'Reserved for link ingestion',
      'Expanded credit limits',
      'Team workflows',
    ],
    featured: true,
    priceId: { month: 'pri_01hsxycme6m95sejkz7sbz5e9g', year: 'pri_01hsxyeb2bmrg618bzwcwvdd6q' },
  },
  {
    name: 'Advanced (coming soon)',
    id: 'advanced',
    icon: '/assets/icons/price-tiers/pro-icon.svg',
    description: '',
    features: [
      'Agency workflows',
      'Shared workspaces',
      'Priority onboarding',
    ],
    featured: false,
    priceId: { month: 'pri_01hsxyff091kyc9rjzx7zm6yqh', year: 'pri_01hsxyfysbzf90tkh2wqbfxwa5' },
  },
];
