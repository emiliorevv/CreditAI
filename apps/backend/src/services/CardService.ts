import { supabase } from '../config/supabase';
import { IUserCard, ICardStatus, ICardModel } from '@credit-ai/shared';
import { addMonths, setDate, isPast, format, differenceInDays } from 'date-fns';

export class CardService {
  static async getUserCards(userId: string): Promise<ICardStatus[]> {
    const { data, error } = await supabase
      .from('user_cards')
      .select('*, card_model:card_models(*)')
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    // Transform data with calculated fields
    return (data as IUserCard[]).map(card => this.calculateCardStatus(card));
  }

  static async getCardById(cardId: string): Promise<IUserCard | null> {
    const { data, error } = await supabase
      .from('user_cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw new Error(error.message);
    }
    return data as IUserCard;
  }

  static async getCardModels(): Promise<ICardModel[]> {
    const { data, error } = await supabase
      .from('card_models')
      .select('*');

    if (error) throw new Error(error.message);
    return data as ICardModel[];
  }

  static async createCard(userId: string, cardData: Partial<IUserCard>): Promise<IUserCard> {
    const { data, error } = await supabase
      .from('user_cards')
      .insert({
        user_id: userId,
        model_id: cardData.model_id,
        name_override: cardData.name_override,
        issuer_override: cardData.issuer_override,
        card_network: cardData.card_network,
        custom_benefits: cardData.custom_benefits,
        rewards_type_override: cardData.rewards_type_override,
        credit_limit: cardData.credit_limit,
        closing_day: cardData.closing_day,
        due_day: cardData.due_day,
        current_balance: 0 // Default starting balance
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as IUserCard;
  }

  static calculateCardStatus(card: IUserCard): ICardStatus {
    const today = new Date();
    const closingDay = card.closing_day;
    const dueDay = card.due_day;

    // 1. Determine "Current Active Closing Date" (The one we are spending towards)
    let nextClosingDate = setDate(today, closingDay);
    if (isPast(nextClosingDate) && !this.isToday(nextClosingDate)) {
      nextClosingDate = addMonths(nextClosingDate, 1);
    }

    // 2. Determine "Previous Closing Date" (The one that might have just passed)
    const previousClosingDate = addMonths(nextClosingDate, -1);

    // 3. Determine the "Due Date" for the PREVIOUS closing
    // Logic: Due Date is X days after closing, or specific day of next month
    let paymentDueDate = setDate(previousClosingDate, dueDay);
    if (paymentDueDate <= previousClosingDate) {
      paymentDueDate = addMonths(paymentDueDate, 1);
    }

    // 4. Determine Status
    // If Today is BEFORE the Due Date of payments for the previous cycle...
    // AND the card existed before that closing date...
    // THEN we are in the "Grace Period" (Payment Phase).

    // Note: We need created_at to know if this is a brand new card
    // Assuming card.created_at string exists. If not, default to "old card" behavior or "new card" behavior?
    // Let's assume strict logic: If we are in the zone, we show it.

    const isGracePeriod = today <= paymentDueDate && today > previousClosingDate;

    const daysRemaining = differenceInDays(nextClosingDate, today);
    const daysUntilDue = differenceInDays(paymentDueDate, today);

    const utilization = card.current_balance / card.credit_limit;
    let health: 'Good' | 'Warning' | 'Critical' = 'Good';

    if (utilization > 0.3) health = 'Warning';
    if (utilization > 0.8) health = 'Critical';

    return {
      ...card,
      days_remaining: daysRemaining,
      days_until_due: daysUntilDue,
      payment_status: isGracePeriod ? 'DUE' : 'SPENDING',
      next_closing_date: format(nextClosingDate, 'yyyy-MM-dd'),
      next_payment_due_date: format(paymentDueDate, 'yyyy-MM-dd'),
      utilization_ratio: Number(utilization.toFixed(2)),
      health_status: health
    };
  }

  private static isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }
}
