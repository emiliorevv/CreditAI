import { Router } from 'express';
import { CardController } from '../controllers/CardController';

const router = Router();

router.get('/', CardController.getCards);

export default router;
