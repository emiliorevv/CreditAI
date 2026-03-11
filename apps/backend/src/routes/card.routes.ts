import { Router } from 'express';
import { CardController } from '../controllers/CardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', CardController.getCards);
router.get('/models', CardController.getModels);
router.post('/', CardController.createCard);
router.get('/:cardId/transactions', CardController.getTransactions);

export default router;
