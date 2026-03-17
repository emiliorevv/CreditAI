# CreditAI

CreditAI is a full-stack application for managing credit cards, logging transactions, and interacting with an AI assistant for expense analysis.

The project is structured as a monorepo containing a React (Vite) frontend and an Express/TypeScript backend. It utilizes Supabase for authentication and database management, and the Vercel AI SDK for the assistant integrations.

---

## System Requirements

Before starting, ensure the following are installed:

- **Node.js**: v20 or higher is recommended (development currently tested on v24.9.0).
- **npm**: v10 or higher (development currently tested on v11.6.0).
- **Git**: For version control.
- **Supabase CLI** (optional): For local database development.

No other external build tools are required.

---

## Project Setup

This repository uses npm workspaces to manage packages for the frontend, backend, and shared libraries.

### 1. Install Dependencies
Navigate to the root directory and install dependencies across all workspaces:

```bash
npm install
```

### 2. Environment Variables
Environment variables must be configured for both the frontend and backend. 

**Backend (`apps/backend/.env`)**
Create an `.env` file in `apps/backend` with the following:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

**Frontend (`apps/frontend/.env`)**
Create an `.env` file in `apps/frontend` with the following:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Build Instructions

The project uses TypeScript for the frontend and backend. Build steps can be executed from the root repository or within individual workspaces.

### Building the Entire Monorepo
To compile the frontend and backend sequentially, run the following from the root directory:
```bash
npm run build
```

This command executes the build scripts defined in each workspace:
1. **Backend (`apps/backend`)**: Runs `tsc` to compile TypeScript source code to the `dist/` directory.
2. **Frontend (`apps/frontend`)**: Runs `tsc -b && vite build` to type-check and generate an optimized production bundle in the `dist/` directory.

---

## Usage Guide

### Starting the Development Servers
From the root directory, start the development servers:

- **Start Backend:** `npm run dev:backend` (Starts the Express server on port 3000).
- **Start Frontend:** `npm run dev:frontend` (Starts the Vite dev server on port 5173).

Alternatively, navigate into each directory (`apps/backend` or `apps/frontend`) and run `npm run dev`.

### Features and Workflows

Once both servers are running, access the frontend application at `http://localhost:5173`.

1. **Authentication**
   - Create a new account or log into an existing one via the `/login` or `/register` pages. Authentication is managed by Supabase.
   
2. **Managing Credit Cards**
   - Add new credit cards and define their initial credit limits from the main dashboard.
   - View active cards, current balances, and available limits.

3. **Logging Transactions**
   - Log new expenses against specific credit cards.
   - Frontend and backend validations ensure that transactions do not exceed the defined credit limits.

4. **AI Assistant**
   - Use the AI Assistant to query and analyze spending.
   - Example queries: 
     - *"What is my total balance across all cards?"*
     - *"Can I afford a $500 transaction on my primary card?"*
     - *"Show me my recent expenses."*
