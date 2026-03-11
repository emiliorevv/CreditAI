import { Request, Response } from 'express';
import { TransactionService } from '../services/TransactionService';

import { AuthRequest } from '../middleware/authMiddleware';

export class TransactionController {
    private static getUserId(req: Request): string | null {
        return (req as AuthRequest).user?.id || null;
    }

    static async getTransactions(req: Request, res: Response) {
        try {
            const userId = TransactionController.getUserId(req);
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const { cardId } = req.params;
            const transactions = await TransactionService.getTransactions(userId, cardId);
            res.json(transactions);
        } catch (error: any) {
            console.error('Error fetching transactions:', error);
            if (error.message === 'Card not found') {
                return res.status(404).json({ error: 'Card not found' });
            }
            if (error.message === 'Forbidden: Card does not belong to user') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async createTransaction(req: Request, res: Response) {
        try {
            const userId = TransactionController.getUserId(req);
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const transaction = await TransactionService.createTransaction(userId, req.body);
            if (transaction && transaction.id) {
                res.location(`/api/transactions/${transaction.id}`);
            }
            res.status(201).json(transaction);
        } catch (error: any) {
            console.error('Error creating transaction:', error);
            if (error.message.startsWith('Transaction declined')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
