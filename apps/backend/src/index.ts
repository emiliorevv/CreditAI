import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import express from 'express';
import cors from 'cors';


import cardRoutes from './routes/card.routes';
import aiRoutes from './routes/ai.routes';
import transactionRoutes from './routes/transaction.routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());



app.use('/api/cards', cardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api', aiRoutes);

app.get('/', (req, res) => {
    res.send('CreditAI Backend is running!');
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
