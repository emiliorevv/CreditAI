import path from 'path';
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

import express from 'express';
import cors from 'cors';

import cardRoutes from './routes/card.routes';
import aiRoutes from './routes/ai.routes';
import transactionRoutes from './routes/transaction.routes';

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'];
const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));
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
