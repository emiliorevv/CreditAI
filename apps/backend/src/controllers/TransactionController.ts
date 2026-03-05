import { Request, Response } from 'express';
import { TransactionService } from '../services/TransactionService';

export class TransactionController {
    private static getUserId(req: Request): string | null {
        // @ts-ignore
        return req.user?.id || null;
    }

    static async getTransactions(req: Request, res: Response) {
        try {
            const userId = TransactionController.getUserId(req);
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const { cardId } = req.params;
            const transactions = await TransactionService.getTransactions(userId, cardId);
            res.json(transactions);
        } catch (error: any) {
            if (error.message === 'Forbidden: Card does not belong to user') {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
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
            res.status(500).json({ error: error.message });
        }
    }
}
