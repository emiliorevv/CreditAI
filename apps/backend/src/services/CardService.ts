import { supabase } from '../config/supabase';
import { IUserCard, ICardModel } from '@credit-ai/shared';

export class CardService {
  static async getUserCards(userId: string): Promise<IUserCard[]> {
    const { data, error } = await supabase
      .from('user_cards')
      .select('*, card_model:card_models(*)')
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return data as IUserCard[];
  }

  // Placeholder for future logic (Phase 2)
  static async calculateCardStatus(card: IUserCard) {
    // Logic to be implemented in Phase 2
  }
}
