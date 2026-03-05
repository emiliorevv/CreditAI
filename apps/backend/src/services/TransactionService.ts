import { supabase } from '../config/supabase';
import { ITransaction } from '@credit-ai/shared';

export class TransactionService {
    static async getTransactions(userId: string, cardId: string): Promise<ITransaction[]> {
        // 1. Verify card ownership
        const { data: card, error: cardError } = await supabase
            .from('user_cards')
            .select('user_id')
            .eq('id', cardId)
            .single();

        if (cardError || !card) {
            console.error('Error fetching card for validation:', { cardError, cardId, userId });
            throw new Error('Card not found');
        }

        if (card.user_id !== userId) {
            throw new Error('Forbidden: Card does not belong to user');
        }

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('card_id', cardId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Supabase Error in getTransactions:', error);
            throw error;
        }
        return data as ITransaction[];
    }

    static async createTransaction(userId: string, transactionData: Partial<ITransaction>): Promise<ITransaction> {
        // 1. Fetch current card details
        const { data: card, error: cardError } = await supabase
            .from('user_cards')
            .select('current_balance, credit_limit')
            .eq('id', transactionData.card_id)
            .single();

        if (cardError || !card) {
            console.error('Error fetching card for validation:', { cardError, cardId: transactionData.card_id, userId });
            throw new Error('Card not found for transaction validation');
        }

        // 2. Validate Limit
        const newBalance = (card.current_balance || 0) + (transactionData.amount || 0);
        if (newBalance > card.credit_limit) {
            throw new Error(`Transaction declined: Exceeds credit limit. Available: $${(card.credit_limit - card.current_balance).toFixed(2)}`);
        }

        // 3. Insert Transaction
        const { data, error } = await supabase
            .from('transactions')
            .insert({ ...transactionData, user_id: userId })
            .select()
            .single();

        if (error) {
            console.error('Supabase Error in createTransaction:', error);
            throw error;
        }
        return data as ITransaction;
    }
}
