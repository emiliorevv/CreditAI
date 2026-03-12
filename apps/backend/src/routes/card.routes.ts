import { Router } from 'express';
import { CardController } from '../controllers/CardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/models', CardController.getModels); // Public endpoint
router.post('/', authMiddleware, CardController.createCard);
router.get('/:cardId/transactions', authMiddleware, CardController.getTransactions);
router.get('/', authMiddleware, CardController.getCards);

export default router;
