import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Route grouping: POST /api/transactions
router.post('/', TransactionController.createTransaction);

export default router;
