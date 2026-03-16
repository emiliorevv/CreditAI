import type { ICardStatus, ICardModel, IUserCard, ITransaction } from '@credit-ai/shared';
import { supabase } from '../lib/supabase';

const API_URL = 'http://localhost:3000/api';

const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
        throw new Error('No active session');
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const api = {
    getCards: async (): Promise<ICardStatus[]> => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/cards`, { headers });
        if (!response.ok) throw new Error('Failed to fetch cards');
        return response.json();
    },

    getCardModels: async (): Promise<ICardModel[]> => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/cards/models`, { headers });
        if (!response.ok) throw new Error('Failed to fetch card models');
        return response.json();
    },

    createCard: async (data: Partial<IUserCard>): Promise<IUserCard> => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/cards`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create card');
        return response.json();
    },

    getTransactions: async (cardId: string): Promise<ITransaction[]> => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/cards/${cardId}/transactions`, { headers });
        if (!response.ok) throw new Error('Failed to fetch transactions');
        return response.json();
    },

    createTransaction: async (transaction: Partial<ITransaction>): Promise<ITransaction> => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers,
            body: JSON.stringify(transaction),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            let errorJson;
            try {
                errorJson = JSON.parse(errorText);
            } catch (e) {
                throw new Error(`Failed to create transaction: ${response.status} ${response.statusText}`);
            }
            throw new Error(errorJson.error || 'Failed to create transaction');
        }
        return response.json();
    }
};
