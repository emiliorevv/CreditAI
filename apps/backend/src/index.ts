import express from 'express';
import cors from 'cors';


import cardRoutes from './routes/card.routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/cards', cardRoutes);

app.get('/', (req, res) => {
    res.send('CreditAI Backend is running!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
