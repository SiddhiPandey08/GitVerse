# GitVerse frontend

GitVerse is a React 19 single-page frontend built with Vite, MUI, Tailwind CSS,
Axios, and React Router. The frontend talks to the Express/MongoDB backend in
the sibling `backend` directory.

## Requirements

- Node.js 20 or newer
- A running GitVerse backend
- MongoDB configured for the backend

## Install

```bash
cd frontend
npm install
```

## Environment

Copy `.env.example` to `.env` and set the backend URL:

```dotenv
VITE_API_URL=http://localhost:3000
```

Vite exposes environment variables at build time. Restart the dev server after
changing `.env`.

## Run

Start the backend in one terminal, then start the frontend:

```bash
cd frontend
npm run dev
```

The development server is normally available at `http://localhost:5173`.

Useful scripts:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start Vite with hot reload |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest test suite |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run format` | Format frontend files with Prettier |

## Routes

Public routes:

- `/` — landing page
- `/auth` — sign in
- `/signup` — account creation

Authenticated routes:

- `/dashboard` — personal and public repositories
- `/create-new-repo` — create a repository
- `/repositories/:repoId` — repository details, files, commits, and README
- `/starredRepo` — starred repositories
- `/profile` — user profile
- `/edit-profile` — edit profile

Unknown paths show the not-found page.

## API overview

The shared Axios client is in `src/api/client.js`. It attaches the JWT from
local storage and redirects to `/auth` when the backend returns `401`.
Components use service modules instead of constructing URLs:

- `src/api/users.js`: login, signup, profile, and profile updates
- `src/api/repositories.js`: repository CRUD, stars, visibility, commits, and files
- `src/api/activity.js`: user activity

The backend currently does not expose dedicated endpoints for global search,
notifications, starred repositories, or forks. The frontend therefore omits
those unsupported controls and derives starred repositories from the existing
repository listing response.

## Security notes

The current authentication flow stores the JWT in `localStorage`, which is
vulnerable to theft if an XSS issue is introduced. Moving the token to an
HttpOnly, Secure, SameSite cookie would require an approved backend change;
this frontend does not change that contract.
