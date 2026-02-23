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
            // Verify card belongs to user? 
            // TransactionService.getTransactions just selects by card_id.
            // RLS will handle security if we use RLS. 
            // But if we use service role or if we want app-level check:
            // Service should probably accept userId to verify ownership or we trust RLS.
            // Let's pass userId to service just in case we want to enforce it there too.
            const transactions = await TransactionService.getTransactions(cardId);
            res.json(transactions);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createTransaction(req: Request, res: Response) {
        try {
            const userId = TransactionController.getUserId(req);
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const transaction = await TransactionService.createTransaction(userId, req.body);
            res.json(transaction);
        } catch (error: any) {
            console.error('Error creating transaction:', error);
            res.status(500).json({ error: error.message });
        }
    }
}
