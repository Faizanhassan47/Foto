# Deployment Notes

## Frontend Deployment

The intended coursework deployment path is:

1. Build the frontend with `npm run build` inside `frontend/`
2. Upload `frontend/dist/` to an S3 bucket configured for static hosting
3. Put CloudFront in front of that bucket
4. Set `VITE_API_URL` to your deployed backend API URL before building

The included GitHub Actions workflow automates this with:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `VITE_API_URL`
- optional `AWS_CLOUDFRONT_DISTRIBUTION_ID`

## Backend Deployment

The repo includes `render.yaml` for backend deployment on Render.

Required backend environment variables:

- `CLIENT_ORIGIN`
- `JWT_SECRET`
- `MONGODB_URI`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- optional `AWS_CLOUDFRONT_URL`

The GitHub deployment workflow can also trigger a Render deploy hook if you add:

- `RENDER_DEPLOY_HOOK_URL`

## CI/CD Workflows

- `ci.yml`
  - installs backend dependencies
  - runs backend tests
  - installs frontend dependencies
  - builds the frontend

- `deploy.yml`
  - builds and syncs the frontend to S3
  - optionally invalidates CloudFront
  - optionally triggers a Render backend deploy

## Suggested GitHub Secrets

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`
- `VITE_API_URL`
- `RENDER_DEPLOY_HOOK_URL`
