# CampusPulse 🎓⚡
## Smart Campus Issue Reporting & Resolution System

A full-stack web application built with React + Vite (frontend) and Node.js + Express + SQLite (backend).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone / navigate to project
```bash
cd campuspulse
```

### 2. Start the backend
```bash
cd server
npm install
node seed.js      # Initialize DB + seed demo data
npm start         # Runs on http://localhost:5000
```

### 3. Start the frontend (new terminal)
```bash
cd client
npm install
npm run dev       # Runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## 🔐 Demo Login Credentials

| Role    | Email                        | Password    |
|---------|------------------------------|-------------|
| Admin   | admin@campuspulse.edu        | admin123    |
| Student | student@campuspulse.edu      | student123  |
| Student | alex@campuspulse.edu         | test123     |

> ⚠️ These are demo accounts for development only. Never use these credentials in production.

---

## 🌍 Environment Variables

### server/.env
```
PORT=5000
JWT_SECRET=campuspulse_super_secret_jwt_key_2024
NODE_ENV=development
```

### client/.env
```
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint             | Description          | Auth     |
|--------|----------------------|----------------------|----------|
| POST   | /api/auth/register   | Register student     | None     |
| POST   | /api/auth/login      | Login                | None     |
| GET    | /api/auth/me         | Get current user     | JWT      |

### Complaints
| Method | Endpoint                        | Description             | Auth        |
|--------|---------------------------------|-------------------------|-------------|
| POST   | /api/complaints                 | Submit complaint        | Student     |
| GET    | /api/complaints                 | List complaints         | JWT         |
| GET    | /api/complaints/:id             | Get complaint detail    | JWT (owner) |
| PATCH  | /api/complaints/:id/status      | Update status           | Admin       |
| DELETE | /api/complaints/:id             | Delete complaint        | Admin       |

### Statistics
| Method | Endpoint          | Description            | Auth    |
|--------|-------------------|------------------------|---------|
| GET    | /api/stats/admin  | Full dashboard stats   | Admin   |
| GET    | /api/stats/student| Student's own stats    | Student |

---

## 🏗️ Project Structure

```
campuspulse/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── api/axios.js       # Axios instance + interceptors
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React context (Auth)
│   │   ├── pages/             # Page components
│   │   ├── App.jsx            # Router setup
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                    # Node.js + Express backend
│   ├── db/database.js         # SQLite init + schema
│   ├── middleware/auth.js     # JWT middleware
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   ├── complaints.js      # Complaint CRUD
│   │   └── stats.js           # Statistics
│   ├── data/campuspulse.db    # SQLite database
│   ├── seed.js                # DB seeder
│   ├── index.js               # Server entry
│   └── .env                   # Environment config
│
└── README.md
```

---

## 🧪 Testing Results

| Test Case                                      | Status |
|------------------------------------------------|--------|
| Student registration                           | ✅     |
| Student login                                  | ✅     |
| Admin login                                    | ✅     |
| Invalid credentials rejected                   | ✅     |
| Student can submit complaint                   | ✅     |
| Student sees only their own complaints         | ✅     |
| Admin sees all complaints                      | ✅     |
| Admin can update complaint status              | ✅     |
| Status history tracked                         | ✅     |
| Dashboard stats update correctly               | ✅     |
| Unauthorized API requests rejected (401/403)   | ✅     |
| Session preserved on page refresh              | ✅     |
| Duplicate complaint detection                  | ✅     |
| Delete with confirmation modal                 | ✅     |

---

## 🚢 Deployment

### Backend (e.g., Render, Railway)
1. Push `server/` to a Git repo
2. Set environment variables: `JWT_SECRET`, `PORT`, `NODE_ENV=production`
3. Build command: `npm install`
4. Start command: `node index.js`
5. Run `node seed.js` once after deploy

### Frontend (e.g., Vercel, Netlify)
1. Push `client/` to a Git repo
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variable: `VITE_API_URL=https://your-backend-url.com/api`

---

## ✨ Features

- **Role-based access control** — students and admins see different UIs
- **JWT authentication** — secure, stateless, 7-day tokens
- **Automatic complaint IDs** — format `CP-YYYY-XXXXX`
- **Rule-based priority classification** — keyword analysis, no AI APIs
- **Duplicate detection** — prevents identical complaints within 24h
- **Status timeline** — full audit trail of status changes
- **Charts & analytics** — bar, pie, trend charts via Recharts
- **Mobile responsive** — works on all screen sizes
- **Real-time search & filter** — debounced search, status/category filters

