# Notes App — Cohort 9 MERN Assignment

A full-stack notes-taking application with authentication, rich text editing, and note management (pin, search, filter, export/import). Built as part of the Cohort 9 MERN assignment for 10Pearls.

## Tech Stack

**Frontend**
- React 19 + TypeScript + Vite
- React Router DOM — routing & protected routes
- Axios — API communication
- TipTap — rich text editor (bold, italic, lists, links)
- Context API — auth state management
- Vitest + React Testing Library — unit tests

**Backend**
- Node.js + Express 5
- PostgreSQL + Sequelize ORM
- JWT — authentication
- bcryptjs — password hashing
- express-validator — request validation
- Mocha + Chai + Sinon + Supertest — testing

**Code Quality**
- SonarQube — static analysis & quality gate
- CodeRabbit — AI-assisted code review

## Features

- User signup & login (JWT-based auth)
- Protected dashboard routes
- Create, edit, delete notes with a rich text editor
- Pin / unpin important notes
- Live search and filter (All / Recent / Oldest)
- Export notes as JSON, import notes from JSON

## Project Structure

cohort-9-mern-7434-anchalbai/
├── frontend/   # React + Vite client
└── backend/    # Express + PostgreSQL API

## Getting Started

### Backend
cd backend
npm install
# create .env with DATABASE_URL, JWT_SECRET, PORT
npm run dev

### Frontend
cd frontend
npm install
# create .env with VITE_API_URL pointing to backend
npm run dev

## API Endpoints

**Auth**
- POST /signup — register a new user
- POST /login — login and receive a JWT
- GET /me — get current authenticated user
- POST /logout — logout

**Notes (all require authentication)**
- GET / — list notes (supports search/filter)
- POST / — create a note
- GET /:id — get a single note
- PUT /:id — update a note
- DELETE /:id — delete a note
- PATCH /:id/pin — toggle pin status
- GET /export — export notes as JSON
- POST /import — import notes from JSON

## Testing

# frontend
npm run test
npm run test:coverage

# backend
npm run test

## Author
Anchal Bai