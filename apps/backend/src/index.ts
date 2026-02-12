import express from 'express';
import cors from 'cors';
import { ICreditCard } from '@credit-ai/shared';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('CreditAI Backend is running!');
});

app.get('/test-shared', (req, res) => {
    const card: ICreditCard = {
        id: '1',
        user_id: 'user_123',
        name: 'Test Card',
        closing_date: 15,
        payment_due_date: 20,
        limit: 5000,
        current_balance: 150.50,
        benefits: { dining: '4x' }
    };
    res.json(card);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
