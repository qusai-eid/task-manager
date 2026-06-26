# PrecastFlow — Design Department Task Manager

A full-stack task management system built for Design Departments at precast concrete construction companies. Manages the complete design workflow from initial request through to factory issuance.

---

## Features

- **10-stage Design Workflow Kanban Board** — New Request → Under Review → Concept Design → Structural Design → Shop Drawings → Internal Review → Client/Consultant Review → Revisions → Approved for Production → Issued to Factory
- **File Version Control** — Upload DWG, PDF, and other engineering files with automatic versioning (v1.0, v1.1, v2.0…), inline preview, and full history
- **Team Performance KPIs** — Real-time productivity metrics, completion rates, attendance, and leaderboards for managers
- **Role-Based Access** — Admin / Manager / Member with granular permissions
- **Mila AI Assistant** — Built-in help assistant that explains every feature and page
- **Dark & Light Mode** — Fully themed with CSS custom properties
- **Activity Audit Log** — Complete trail of every action taken
- **Real-time Notifications** — Task assignments, approvals, factory issuance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js 22, Express, TypeScript |
| Database | SQLite (via `node:sqlite` built-in) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File uploads | Multer (disk storage) |
| Charts | Recharts |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites
- Node.js 22.5 or higher
- npm

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/precastflow.git
cd precastflow
```

### 2. Set up the backend

```bash
cd backend
npm install

# Copy the environment template and fill in your values
cp .env.example .env
# Edit .env — at minimum set JWT_SECRET to a random string
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

### 4. Run in development

Open **two terminals**:

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

The app auto-seeds the database on first run with sample tasks and four demo accounts:

| Email | Password | Role |
|---|---|---|
| admin@taskflow.com | admin123 | Admin |
| sarah@taskflow.com | manager123 | Manager |
| john@taskflow.com | member123 | Member |
| emma@taskflow.com | member123 | Member |

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-long-random-secret-here
JWT_EXPIRES_IN=7d

# Optional — enables GPT-4o-mini for Mila's AI responses
# Leave blank to use Mila's built-in local knowledge base (works without a key)
OPENAI_API_KEY=
```

---

## Project Structure

```
precastflow/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, permissions, file upload, validation
│   │   ├── models/        # SQLite schema + seeder
│   │   └── routes/        # Express routers
│   ├── data/              # SQLite database + uploaded files (git-ignored)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components (layout, tasks, dashboard, AI…)
│   │   ├── contexts/      # Auth + Theme contexts
│   │   ├── pages/         # Page-level components
│   │   ├── services/      # Axios API calls
│   │   └── types/         # TypeScript interfaces
│   └── package.json
└── README.md
```

---

## Mila — AI Help Assistant

Mila is a built-in chat assistant (floating **M** button, bottom-right corner) that explains every feature in the system. She works immediately with no API key using a local knowledge base.

To enable GPT-4o-mini responses for more flexible answers, add your OpenAI API key to `backend/.env`.

---

## License

MIT
