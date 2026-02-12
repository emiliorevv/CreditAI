import { useState, useEffect } from 'react'
import './App.css'
import { ICreditCard } from '@credit-ai/shared';

function App() {
  const [card, setCard] = useState<ICreditCard | null>(null);

  useEffect(() => {
    // Simulate fetching data with shared type
    const dummyCard: ICreditCard = {
      id: '1',
      user_id: 'u1',
      name: 'Frontend Test Card',
      closing_date: 1,
      payment_due_date: 20,
      limit: 1000,
      current_balance: 0,
      benefits: { 'test': 'ok' }
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
