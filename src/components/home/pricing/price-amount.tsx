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
            <div className={cn('text-[48px] leading-[56px] tracking-[-1px] font-medium')}>Free</div>
            <div className={cn('font-medium leading-[12px] text-[12px]')}>Beta access</div>
          </>
        )}
      </div>
    </div>
  );
}
