# Task Manager (React + Node + MongoDB)

This repo contains:
- **Backend**: Express + Mongoose API (`/backend`)
- **Frontend**: React (Vite) UI (`/frontend/vite-project`)

## Frameworks used

- **Frontend**: React (Vite)
- **Backend**: Node.js + Express

## Database used

- **MongoDB** (via Mongoose)

## Steps to run the project (quick)

1. Backend:
   - `cd backend`
   - `npm install`
   - create `backend/.env` with `MONGO_URI=...`
   - `npm run start`
2. Frontend:
   - `cd frontend/vite-project`
   - `npm install`
   - `npm run dev`

## Prerequisites

- **Node.js**: Vite requires **Node 20.19+** (or **22.12+**).  
  If you see an error like “Vite requires Node.js version 20.19+”, upgrade Node.
- **MongoDB**: A MongoDB connection string (local or Atlas).

## Backend setup (API)

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create `backend/.env`:

```bash
MONGO_URI=your_mongodb_connection_string
```

3. Start the server:

```bash
cd backend
npm run start
```

- Backend runs on `http://localhost:3000`
- Health check: `GET /health`

### Backend API routes

- `GET /api/tasks` (list tasks)
- `POST /api/tasks` (create task) body: `{ "title": "..." }`
- `PATCH /api/tasks/:id` (update task) body supports:
  - `{ "title": "..." }`
  - `{ "completed": true/false }`
- `PUT /api/tasks/:id` (full update; same body as PATCH)
- `DELETE /api/tasks/:id` (delete task)

## Frontend setup (UI)

1. Install dependencies:

```bash
cd frontend/vite-project
npm install
```

2. Start the dev server:

```bash
cd frontend/vite-project
npm run dev
```

The frontend uses a Vite proxy so API calls to `/api/*` are forwarded to `http://localhost:3000`.

## Running both together (2 terminals)

Terminal 1:

```bash
cd backend
npm run start
```

Terminal 2:

```bash
cd frontend/vite-project
npm run dev
```

## Assumptions

- Tasks are stored in MongoDB and are shared (no user authentication / multi-user separation).
- A task has a required `title` and a boolean `completed`.
- In development, the frontend talks to the backend via the Vite proxy (`/api/*` → `http://localhost:3000`).
