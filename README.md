# ExpoJudge — Judge-First Exhibition & Hackathon Scoring App

**ExpoJudge** is a modern, judge-centric MERN (MongoDB, Express 5, React 19, Node.js) web application engineered for judging project exhibitions, hackathons, and science fairs. Designed with a clean **Light Theme**, intuitive touch targets for mobile/tablet use at exhibition booths, and a streamlined workflow that eliminates administrative clutter.

---

## 🌟 Key Features

1. **Light Theme & Responsive Design**:
   - Clean, high-contrast, modern light theme (`slate-50` background, crisp white cards, rich indigo accents).
   - Fully responsive across phone (≥320px), tablet, and desktop viewports with 44×44px minimum touch targets and zero horizontal scroll.

2. **Streamlined Judge-First Flow**:
   - **Login & Event Setup**: Judges log in and immediately configure their **Event Name**, **College / Institution Name**, and **Event Date** (or join an existing event via a 6-character code like `EXPO26`).
   - **Continuous Single-Panel Evaluation**:
     - When adding a team, judges have an active **"Evaluate Now" vs "Evaluate Later" toggle switch**.
     - **Evaluate Now (ON)**: The full 100-mark evaluation rubric unfolds immediately in the same panel. Judges score all 8 criteria via smooth sliders or numeric inputs, view a live running total, add remarks, and save the team and its evaluation in a single click.
     - **Evaluate Later (OFF)**: The team is registered without evaluation, added to the queue, and can be scored anytime from the dashboard.
   - **Judgement Sheet Filtering**:
     - **Exhibition Rule Enforced**: If a team is registered but not evaluated, it is **strictly excluded** from the printable judgement sheet. Only evaluated teams appear with their complete criteria breakdown and final marks.

3. **Consolidated A4 Portrait Judgement Sheets (`/sheets`)**:
   - Clean printable evaluation sheets formatted strictly for A4 portrait printing (`@media print` rules, non-splitting team blocks, official evaluator certification, and signature lines).

4. **Evaluation Matrix Grid (`/grid`)**:
   - Teams × Judges matrix with sticky team names, sticky header row, status chips (Completed / Draft / Unscored), average scores, and ranks.

5. **Fuzzy Duplicate Team Detection**:
   - Live Levenshtein similarity (≥ 0.85) and substring detection warns when similar team names are entered (e.g., "team-alpha" vs "Team Alpha"), with an "Add Anyway" option.

6. **Excel-Compatible CSV Export**:
   - Exports judge or event scores with UTF-8 BOM (`\uFEFF`) for immediate, clean opening in Microsoft Excel without encoding dialogs.

7. **Shared-Device Judge Switch**:
   - Seamless judge switching modal for shared devices/tablets without losing the active exhibition event.

8. **Zero-Setup Local Dev Fallback**:
   - Automatically spins up an in-memory MongoDB instance (`mongodb-memory-server`) if `MONGODB_URI` is not provided.

---

## 📊 Default 100-Mark Rubric

| # | Criterion | Max Marks |
|---|-----------|-----------|
| 1 | Innovation & Originality | 15 |
| 2 | Problem Relevance & Objective Clarity | 10 |
| 3 | Technical Knowledge & Feasibility | 20 |
| 4 | Functionality & Working Model / Prototype | 20 |
| 5 | Design & Implementation | 10 |
| 6 | Presentation & Communication Skills | 10 |
| 7 | Q&A Handling / Depth of Understanding | 10 |
| 8 | Cost Effectiveness & Scalability | 5 |
| | **Total** | **100** |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18+ and **npm**

### 2. Installation
Install root, server, and client dependencies:
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Environment Configuration
Default environment files are pre-configured:
- `server/.env.example` (copy to `server/.env` if customizing)
- `client/.env.example` (copy to `client/.env` if customizing)

> Note: If no `MONGODB_URI` is supplied in `server/.env`, the server automatically starts an in-memory MongoDB instance with zero configuration.

### 4. Seed Demo Data (Optional)
Populate the database with a sample event (`joinCode: EXPO26`), 8 teams, 3 judges, and sample draft/completed scores:
```bash
npm run seed
```

**Demo Judge Credentials:**
- **Email:** `judge.turing@expojudge.com` | **Password:** `judge123`
- **Email:** `judge.johnson@expojudge.com` | **Password:** `judge123`
- **Email:** `admin@expojudge.com` | **Password:** `admin123`
- **Event Join Code:** `EXPO26`

### 5. Running Locally
Run both client and server concurrently with one command from the project root:
```bash
npm run dev
```

- **Frontend (Client):** `http://localhost:5173`
- **Backend (API):** `http://localhost:5000/api`

---

## 🛠️ Project Structure

```
ExpoJudge/
├── client/                     # React 19 + Vite frontend
│   ├── src/
│   │   ├── api/                # axiosClient & resource API modules
│   │   ├── components/
│   │   │   ├── common/         # Navbar (Light theme), ProtectedRoute
│   │   │   ├── judge/          # JudgeDashboard, ScoringView, GridView, JudgeSwitchModal
│   │   │   ├── organizer/      # EventSettingsModal
│   │   │   └── shared/         # PrintableSheet
│   │   ├── constants/          # criteria.js, demoData.js
│   │   ├── context/            # AuthContext, EventContext
│   │   ├── pages/              # LoginPage, RegisterPage, EventSetupPage, AddTeamPage, ScoringPage, JudgingSheetsPage
│   │   └── utils/              # similarity.js, storage.js
│   └── package.json
├── server/                     # Express 5 + Node backend
│   ├── src/
│   │   ├── config/             # db.js (MongoDB / in-memory fallback)
│   │   ├── controllers/        # auth, event, team, score, judge, report controllers
│   │   ├── middleware/         # auth.middleware.js, error.middleware.js
│   │   ├── models/             # User, Event, Team, Score
│   │   ├── routes/             # API routes mounted at /api/*
│   │   └── utils/              # seed.js, similarity.js
│   ├── server.js
│   └── package.json
└── package.json                # Root scripts (dev, build, start, seed)
```
