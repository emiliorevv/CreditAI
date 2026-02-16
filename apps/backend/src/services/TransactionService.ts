import { supabase } from '../config/supabase';
import { ITransaction } from '@credit-ai/shared';

export class TransactionService {
    static async getTransactions(cardId: string): Promise<ITransaction[]> {
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

    static async createTransaction(transactionData: Partial<ITransaction>): Promise<ITransaction> {
        // 1. Fetch current card details
        const { data: card, error: cardError } = await supabase
            .from('user_cards')
            .select('current_balance, credit_limit')
            .eq('id', transactionData.card_id)
            .single();

        if (cardError || !card) {
            console.error('Error fetching card for validation:', cardError);
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
            .insert(transactionData)
            .select()
            .single();

        if (error) {
            console.error('Supabase Error in createTransaction:', error);
            throw error;
        }
        return data as ITransaction;
    }
}
