import { Request, Response } from 'express';
import { CardService } from '../services/CardService';
import { TransactionService } from '../services/TransactionService';

export class CardController {

    private static getUserId(req: Request): string | null {
        // @ts-ignore
        return req.user?.id || null;
    }

    static async getCards(req: Request, res: Response) {
        try {
            const userId = CardController.getUserId(req);
            if (!userId) return res.status(400).json({ error: 'User ID required' });

            const cards = await CardService.getUserCards(userId);
            res.json(cards); // Returns ICardStatus[]
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getModels(req: Request, res: Response) {
        try {
            const models = await CardService.getCardModels();
            res.json(models);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createCard(req: Request, res: Response) {
        try {
            const userId = CardController.getUserId(req);
            if (!userId) return res.status(400).json({ error: 'User ID required' });

            const newCard = await CardService.createCard(userId, req.body);
            res.status(201).json(newCard);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTransactions(req: Request, res: Response) {
        try {
            const userId = CardController.getUserId(req);
            if (!userId) return res.status(400).json({ error: 'User ID required' });

            // Optionally verify card ownership here if not implicitly handled by RLS/Service
            // For now, simple fetch
            const { cardId } = req.params;
            // TODO: Verify card exists and belongs to user

            const transactions = await TransactionService.getTransactions(cardId);
            res.json(transactions);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
