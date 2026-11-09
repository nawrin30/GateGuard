# GateGuard Authentication Setup

The authentication code supports:
- Email + password registration and login (MongoDB required)
- GitHub OAuth login
- Google OAuth login (Google account / Gmail address)

## 1. Backend environment

Copy `backend/.env.example` to `backend/.env` and set:

- `MONGODB_URI`: your MongoDB connection string
- `JWT_SECRET`: a new random secret with at least 32 characters
- `CLIENT_URL`: the deployed frontend origin (no trailing slash; comma-separated origins are supported)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_LOGIN_CALLBACK_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`

For GitHub login, configure this exact callback URL in the GitHub OAuth App:
`https://YOUR_BACKEND_DOMAIN/api/auth/oauth/github/callback`

For Google login, add this exact Authorized redirect URI in Google Cloud Console:
`https://YOUR_BACKEND_DOMAIN/api/auth/oauth/google/callback`

For local development, the callback URLs are shown in `.env.example`.

The old GitHub repository-connection feature additionally uses `GITHUB_CALLBACK_URL` and `TOKEN_ENCRYPTION_KEY`. If enabled, keep both configured as shown in `.env.example`.

## 2. Frontend environment

Set `VITE_API_URL` to the backend API base URL, including `/api`, for example:
`https://YOUR_BACKEND_DOMAIN/api`

## 3. Run locally

In separate terminals:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

## Notes

- Google sign-in uses Google OAuth / OpenID Connect; users can choose their Gmail/Google account.
- Email/password registration requires a reachable MongoDB database.
- OAuth cannot work until valid provider credentials and exact callback URLs are configured in the provider dashboards and backend environment.
- Never commit `.env` or publish OAuth client secrets, database credentials, JWT secrets, or API keys.
