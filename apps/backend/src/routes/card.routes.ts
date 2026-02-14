import { Router } from 'express';
import { CardController } from '../controllers/CardController';

const router = Router();

router.get('/', CardController.getCards);
router.get('/models', CardController.getModels);
router.post('/', CardController.createCard);

export default router;
