# Notes Application - Frontend

A professional React and TypeScript frontend for a full-stack notes management application.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Axios
- Lucide React

## Features

- User registration
- User login
- JWT-based authentication
- Protected routes
- Session restoration
- Logout functionality
- Responsive authentication interface
- Professional dark-themed UI

## Project Structure

```text
src/
├── assets/
├── components/
├── context/
│   └── AuthContext.tsx
├── layouts/
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   └── Signup.tsx
├── routes/
│   ├── AppRoutes.tsx
│   └── ProtectedRoute.tsx
├── services/
│   ├── api.ts
│   └── auth.service.ts
├── styles/
└── types/
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the frontend root directory:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Start the Development Server

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## Production Build

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Authentication Flow

```text
User Registration
        ↓
Backend validates input
        ↓
User account is created
        ↓
User Login
        ↓
Backend validates credentials
        ↓
JWT token is generated
        ↓
Token is stored on the client
        ↓
Protected routes become accessible
        ↓
User accesses the dashboard
```

## API Configuration

The frontend communicates with the backend API through Axios.

The API base URL is configured using:

```env
VITE_API_URL=http://localhost:5000
```

The frontend communicates with:

```text
http://localhost:5000/api
```

## Available Routes

| Route | Description | Access |
|---|---|---|
| `/login` | User login | Public |
| `/signup` | User registration | Public |
| `/dashboard` | User dashboard | Protected |

## Backend Requirement

The backend API must be running before testing authentication features.

Start the backend:

```bash
npm run dev
```

Backend server:

```text
http://localhost:5000
```

## Development

Start the development server:

```bash
npm run dev
```

Run the production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Type Safety

This project uses TypeScript to improve type safety and maintainability throughout the application.

## Routing

React Router is used for client-side navigation and protected route handling.

Unauthenticated users attempting to access protected routes are redirected to the login page.