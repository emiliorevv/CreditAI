import { Request, Response } from 'express';
import { CardService } from '../services/CardService';

export class CardController {
    static async getCards(req: Request, res: Response) {
        try {
            // In a real app, userId comes from Auth middleware
            // For now, we might expect it in headers or query for testing
            const userId = req.headers['x-user-id'] as string; // Temporary

            if (!userId) {
                return res.status(400).json({ error: 'User ID required' });
            }

            const cards = await CardService.getUserCards(userId);
            res.json(cards);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
