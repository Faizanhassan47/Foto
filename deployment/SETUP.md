# Deployment Setup

## Local Development

Local env files are already created:

- `backend/.env`
- `frontend/.env`

They are configured for:

- local JSON data
- local uploads
- frontend at `http://127.0.0.1:5173`
- backend at `http://127.0.0.1:4000`

## Production Env Files

Copy and fill these with your real values:

- `deployment/backend.production.env.example`
- `deployment/frontend.production.env.example`
- `deployment/github.secrets.example.env`

Suggested workflow:

1. Copy `deployment/github.secrets.example.env` to `deployment/github.secrets.env`
2. Replace every placeholder with your real deployment values
3. Install GitHub CLI and authenticate with `gh auth login`
4. Run:

```powershell
.\scripts\set-github-secrets.ps1
```

## Values You Still Need To Supply

- MongoDB Atlas connection string
- AWS region
- AWS S3 bucket names
- AWS access key and secret
- CloudFront distribution URL and optional distribution ID
- Render deploy hook URL
- Production frontend domain
- Production backend API URL
