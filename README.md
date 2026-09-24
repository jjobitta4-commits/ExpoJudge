# ExpoJudge

Project Expo Judging & Evaluation System with A4 printable consolidated evaluation sheets and aggregated leaderboards.

## Architecture

This project is organized into two independent sub-projects:

- **[`client/`](./client/)**: React 19 frontend built with Vite, Tailwind CSS, and Lucide React.
- **[`server/`](./server/)**: Express 5 backend with MongoDB (Mongoose) and JWT authentication.

## Running the Application

### 1. Frontend (Client)

```bash
cd client
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.

### 2. Backend (Server)

```bash
cd server
npm install
npm run dev
```

The backend API will run on `http://localhost:5000`.
