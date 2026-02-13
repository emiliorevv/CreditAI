import { useState, useEffect } from 'react'
import './App.css'
import type { IUserCard } from '@credit-ai/shared';

function App() {
  const [card, setCard] = useState<IUserCard | null>(null);

  useEffect(() => {
    // Simulate fetching data with shared type
    const dummyCard: IUserCard = {
      id: '1',
      user_id: 'u1',
      model_id: 'm1',
      current_balance: 0,
      credit_limit: 1000,
      closing_day: 1,
      due_day: 20,
      card_model: {
        id: 'm1',
        name: 'Frontend Test Card',
        issuer: 'TechBank',
        benefits: { 'test': 1 },
        rewards_type: 'cashback'
      }
    };
    setCard(dummyCard);
  }, []);

  return (
    <>
      <h1>Credit AI Setup</h1>
      <div className="card">
        <h2>Shared Type Integration Check</h2>
        {card ? (
          <pre>{JSON.stringify(card, null, 2)}</pre>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  )
}

export default App
