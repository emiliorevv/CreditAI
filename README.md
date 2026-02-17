# CreditAI
Credit AI

PHASE 1: DATABASE AND BACKEND INITIALIZATION

Let's start with Phase 1: Backend and Database Schema. I need to design the Supabase schema. We need tables for:
users: Basic profile and auth link.
card_models: Static market data (Name, issuer, benefits, rewards categories like groceries or travel).
user_cards: The specific cards owned by the user (Current balance, limit, closing day, payment due day).
Please provide the SQL for Supabase and the initial Node.js folder structure with TypeScript, including the database connection and the interfaces for these tables.

PHASE 2: FINANCIAL LOGIC AND API ENDPOINTS

Now let's move to Phase 2: API and Business Logic. Create a Node.js/TypeScript service that calculates the following for a given card:
Days remaining until the closing date.
The exact "Pay by" date to avoid interest (usually 20 days after closing).
Credit health status (Balance vs. Credit Limit ratio). Use date-fns for date manipulation and ensure all API responses are strictly typed.
PHASE 3: FRONTEND DEVELOPMENT (REACT + TS)

Phase 3: Frontend Dashboard. Create a dashboard using React, TypeScript, and Tailwind CSS. I need:
A 'Credit Card' visual component showing balance, closing date, and a visual countdown for the payment deadline.
A selector to add new cards from the existing card_models in the database.
Use TanStack Query (React Query) for data fetching and synchronization with the Node.js backend.
PHASE 4: AI AGENT INTEGRATION

Final Phase: AI Recommendation Agent. Implement a backend function that acts as the agent. The agent must receive:
The list of the user's cards (including balances and specific benefits).
User input (e.g., 'I am at a gas station, which card gives me the best return?').
The agent should reason: 'Card A gives 3% back on gas, while Card B only gives 1%. Use Card A.' Use the Vercel AI SDK or OpenAI SDK with TypeScript to handle the prompts and function calling. Ensure the agent has a 'System Message' that keeps it professional and focused only on financial advice.