import 'dotenv/config';
import express from 'express';
import cors from 'cors';


import cardRoutes from './routes/card.routes';
import aiRoutes from './routes/ai.routes';
import { CardService } from './services/CardService';
import { TransactionService } from './services/TransactionService';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/cards', cardRoutes);
app.use('/api', aiRoutes);

app.get('/', (req, res) => {
    res.send('CreditAI Backend is running!');
});

// Transactions
app.get('/api/cards/:cardId/transactions', async (req, res) => {
    try {
        const transactions = await TransactionService.getTransactions(req.params.cardId);
        res.json(transactions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});



app.post('/api/transactions', async (req, res) => {
    try {
        console.log('POST /transactions received:', req.body);
        const transaction = await TransactionService.createTransaction(req.body);
        res.json(transaction);
    } catch (error: any) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
