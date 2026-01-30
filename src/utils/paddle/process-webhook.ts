import {
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  EventEntity,
  EventName,
  SubscriptionCreatedEvent,
  SubscriptionUpdatedEvent,
} from '@paddle/paddle-node-sdk';
import { createClient } from '@/utils/supabase/server-internal';

export class ProcessWebhook {
  async processEvent(eventData: EventEntity) {
    switch (eventData.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
        await this.updateSubscriptionData(eventData);
        break;
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        await this.updateCustomerData(eventData);
        break;
    }
  }

  private async updateSubscriptionData(eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        subscription_id: eventData.data.id,
        subscription_status: eventData.data.status,
        price_id: eventData.data.items[0].price?.id ?? '',
        product_id: eventData.data.items[0].price?.productId ?? '',
        scheduled_change: eventData.data.scheduledChange?.effectiveAt,
        customer_id: eventData.data.customerId,
      })
      .select();

    if (error) throw error;

    const status = eventData.data.status;
    const isPro = status === 'active' || status === 'trialing' || status === 'past_due';
    await this.updateUserProStatus(eventData.data.customerId, isPro);
  }

  private async updateCustomerData(eventData: CustomerCreatedEvent | CustomerUpdatedEvent) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('customers')
      .upsert({
        customer_id: eventData.data.id,
        email: eventData.data.email,
      })
      .select();

    if (error) throw error;
  }

  private async updateUserProStatus(customerId: string, isPro: boolean) {
    const supabase = await createClient();
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('email')
      .eq('customer_id', customerId)
      .maybeSingle();

    if (customerError || !customer?.email) {
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(customer.email);
    if (userError || !userData?.user) {
      return;
    }

    const { error: profileError } = await supabase.from('user_profiles').upsert({
      user_id: userData.user.id,
      is_pro: isPro,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      throw profileError;
    }
  }
}
