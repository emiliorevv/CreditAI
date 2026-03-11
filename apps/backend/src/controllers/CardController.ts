import { Request, Response } from 'express';
import { CardService } from '../services/CardService';
import { TransactionService } from '../services/TransactionService';
import { AuthRequest } from '../middleware/authMiddleware';

export class CardController {

    private static getUserId(req: Request): string | null {
        return (req as AuthRequest).user?.id || null;
    }

    static async getCards(req: Request, res: Response) {
        try {
            const userId = CardController.getUserId(req);
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

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
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const newCard = await CardService.createCard(userId, req.body);
            res.status(201).json(newCard);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTransactions(req: Request, res: Response) {
        try {
            const userId = CardController.getUserId(req);
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const { cardId } = req.params;

            const transactions = await TransactionService.getTransactions(userId, cardId);
            res.json(transactions);
        } catch (error: any) {
            if (error.message === 'Card not found') {
                return res.status(404).json({ error: 'Card not found' });
            }
            if (error.message === 'Forbidden: Card does not belong to user') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
