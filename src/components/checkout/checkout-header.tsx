import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export function CheckoutHeader() {
  return (
    <div className={'flex gap-4'}>
      <Link href={'/'}>
        <Button variant={'secondary'} className={'h-[32px] bg-primary/20 border-border w-[32px] p-0 rounded-[4px]'}>
          <ChevronLeft />
        </Button>
      </Link>
      <Link href={'/'} className="text-lg font-semibold text-foreground">
        Viral Clarity
      </Link>
    </div>
  );
}
