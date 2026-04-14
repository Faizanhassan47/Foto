# Tasveer_Hubs

Tasveer_Hubs is a full-stack event photo sharing app built from the project docs in `DOC/`.

## Stack

- React + Vite frontend
- Node.js + Express backend
- JWT authentication with creator and consumer roles
- Local JSON persistence and local image uploads for development
- Optional MongoDB Atlas via Mongoose
- Optional AWS S3 + CloudFront-ready image delivery
- GitHub Actions CI/CD and Render deployment config

## Features

- Register and log in as a `creator` or `consumer`
- Creator-only photo uploads with metadata
- Gallery browsing and search
- Photo detail pages with comments and ratings
- Role-based route protection
- Backend API tests for CI

## Project Structure

- `frontend/` React application
- `backend/` Express API with local and cloud-ready providers
- `docs/` architecture, API, and deployment notes
- `.github/workflows/` CI and deployment workflows
- `render.yaml` backend deployment blueprint

## Local Setup

1. Install backend dependencies:

   ```bash
   npm install --prefix backend
   ```

2. Install frontend dependencies:

   ```bash
   npm install --prefix frontend
   ```

3. Start the backend:

   ```bash
   npm run dev --prefix backend
   ```

4. Start the frontend in a second terminal:

   ```bash
   npm run dev --prefix frontend
   ```

The frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:4000` by default.

Actual local env files are included now:

- `backend/.env`
- `frontend/.env`

## Running Tests

```bash
npm test --prefix backend
```

## Cloud Configuration

The app still runs locally out of the box, but you can switch to the documented cloud services with env vars:

- Set `DATA_PROVIDER=mongo` and `MONGODB_URI=...` to use MongoDB Atlas
- Set `STORAGE_PROVIDER=s3`, `AWS_REGION`, and `AWS_S3_BUCKET` to use S3 uploads
- Set `AWS_CLOUDFRONT_URL` if you want returned image URLs to use CloudFront
- Set `CLIENT_ORIGIN` to your deployed frontend domain before deploying the backend

See `backend/.env.example`, `docs/architecture-notes.md`, and `docs/deployment-notes.md` for the full setup.

Production-ready env templates and GitHub secret templates are in:

- `deployment/backend.production.env.example`
- `deployment/frontend.production.env.example`
- `deployment/github.secrets.example.env`
- `deployment/SETUP.md`

## Deployment

- `render.yaml` provisions the backend as a Render web service
- `.github/workflows/ci.yml` runs backend tests and frontend builds on push/PR
- `.github/workflows/deploy.yml` can deploy the frontend to S3 and trigger a Render backend deploy

## Notes

- Development defaults are local JSON + local uploads so the project works without any cloud accounts.
- When cloud env vars are present, the backend switches to MongoDB Atlas and S3 without changing the frontend contract.
