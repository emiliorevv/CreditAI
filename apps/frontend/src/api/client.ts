import type { ICardStatus, ICardModel, IUserCard } from '@credit-ai/shared';

const API_URL = 'http://localhost:3000/api';

const HEADERS = {
    'Content-Type': 'application/json',
    'x-user-id': '150c30ea-57a8-4142-bfb9-7a29b9dd07e2' // Valid Auth User ID from Seed
};

export const api = {
    getCards: async (): Promise<ICardStatus[]> => {
        const response = await fetch(`${API_URL}/cards`, { headers: HEADERS });
        if (!response.ok) throw new Error('Failed to fetch cards');
        return response.json();
    },

    getCardModels: async (): Promise<ICardModel[]> => {
        const response = await fetch(`${API_URL}/cards/models`, { headers: HEADERS });
        if (!response.ok) throw new Error('Failed to fetch card models');
        return response.json();
    },

    createCard: async (data: Partial<IUserCard>): Promise<IUserCard> => {
        const response = await fetch(`${API_URL}/cards`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create card');
        return response.json();
    }
};
