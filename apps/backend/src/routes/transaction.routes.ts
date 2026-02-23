import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// These were in index.ts:
// app.get('/api/cards/:cardId/transactions', ...)
// app.post('/api/transactions', ...)

// We can structure them here.
// Note: The GET route has :cardId, which usually suggests it might be better under card routes card/:id/transactions
// But for now let's keep the path structure if possible or map it here.
// If we mount this router at /api/transactions, we can't easily capture /api/cards/:cardId/transactions here unless we change structure.
// Let's keep /api/transactions for the POST.
// And maybe handling the GET in this file too but the path needs to be correct.
// Or we can add `router.get('/cards/:cardId/transactions', ...)` and mount this router at `/api`.
// Let's try to group them logically.

router.post('/', TransactionController.createTransaction);

// For the GET by card ID, it might be cleaner to have it in CardRoutes or here.
// If we put it here, we need to ensure the route matching works.
// Let's assume we mount this at /api and define full paths or move GET to card routes.
// Moving GET to card routes makes more sense REST-fully: /api/cards/:id/transactions
// But `index.ts` had it.
// Let's put `createTransaction` here (POST /api/transactions).
// And `getTransactions` can be here too if we want, or attached to card routes.
// Let's stick to what index.ts had but reorganized.

export default router;
