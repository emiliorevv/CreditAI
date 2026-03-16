import { getServiceRoleClient } from '../config/supabase';
import { ITransaction } from '@credit-ai/shared';

export class TransactionService {
    static async getTransactions(userId: string, cardId: string): Promise<ITransaction[]> {
        // 1. Verify card ownership
        const supabase = getServiceRoleClient();
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
        const supabase = getServiceRoleClient();
        const { data: card, error: cardError } = await supabase
            .from('user_cards')
            .select('user_id, current_balance, credit_limit')
            .eq('id', transactionData.card_id)
            .single();

        if (cardError || !card) {
            console.error('Error fetching card for validation:', { cardError, cardId: transactionData.card_id, userId });
            throw new Error('Card not found for transaction validation');
        }

        if (card.user_id !== userId) {
            console.error('Forbidden: User attempted to create transaction on unauthorized card', { userId, cardId: transactionData.card_id });
            throw new Error('Forbidden: Card does not belong to user');
        }

        // 2. Validate Limit
        const newBalance = (card.current_balance || 0) + (transactionData.amount || 0);
        if (newBalance > card.credit_limit) {
            throw new Error(`Transaction declined: Exceeds credit limit. Available: $${(card.credit_limit - card.current_balance).toFixed(2)}`);
        }

        // 3. Insert Transaction
        const sanitizedPayload = {
            card_id: transactionData.card_id,
            amount: transactionData.amount,
            date: transactionData.date,
            description: transactionData.description,
            category: transactionData.category,
            user_id: userId
        };

        const { data, error } = await supabase
            .from('transactions')
            .insert(sanitizedPayload)
            .select()
            .single();

        if (error) {
            console.error('Supabase Error in createTransaction:', error);
            throw error;
        }
        return data as ITransaction;
    }
}
