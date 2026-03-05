import { Router } from 'express';
import { CardController } from '../controllers/CardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', CardController.getCards);
router.get('/models', CardController.getModels); // Models might be public? Plan said public read-only. But let's protect for now for consistency, or keep public.
// Plan said: "Policies for card_models (Public read-only)". So `getModels` could be public.
// However, the router applies middleware to ALL routes if I use `router.use`.
// Let's make `getModels` public if intended, or just protect it. 
// If I use `router.use(authMiddleware)`, it applies to everything below.
// Let's put `getModels` BEFORE middleware if it should be public. 
// Actually, for alogged in app, it's fine to protect it.
router.post('/', CardController.createCard);
router.get('/:cardId/transactions', CardController.getTransactions);

export default router;
