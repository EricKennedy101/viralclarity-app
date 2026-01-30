import { Tier } from '@/constants/pricing-tier';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  loading: boolean;
  tier: Tier;
  priceMap: Record<string, string>;
  value: string;
  priceSuffix: string;
}

export function PriceAmount({ loading, priceMap, priceSuffix, tier, value }: Props) {
  const isAdvanced = tier.id === 'advanced';
  const isFree = tier.id === 'starter';
  const isPro = tier.id === 'pro';
  const isAnnual = value === 'year';

  return (
    <div className="mt-6 flex flex-col px-8">
      <div className="min-h-[120px] flex flex-col justify-end">
        {loading && !isFree && !isPro && !isAdvanced ? (
          <Skeleton className="h-[96px] w-full bg-border" />
        ) : isAdvanced ? (
          <>
            <div className={cn('text-[48px] leading-[56px] tracking-[-1px] font-medium')}>Custom</div>
            <div className={cn('text-sm text-muted-foreground')}>Contact us</div>
          </>
        ) : (
          <>
            <div className={cn('text-[48px] leading-[56px] tracking-[-1px] font-medium')}>
              {isFree ? '$0.00' : isPro ? (isAnnual ? '$190.00' : '$19.00') : priceMap[tier.priceId[value]]?.replace(/\.00$/, '.00')}
            </div>
            <div className={cn('font-medium leading-[12px] text-[12px]')}>
              {isFree ? (isAnnual ? '/year' : '/mo') : isPro ? (isAnnual ? '/year' : '/mo') : priceSuffix}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
