# Fotos Architecture Notes

## Runtime Modes

The backend supports two interchangeable runtime layers:

- Local mode: JSON persistence in `backend/data/db.json` and local uploads in `backend/uploads/`
- Cloud mode: MongoDB Atlas for data and AWS S3 for image objects

The mode is selected through environment variables:

- `DATA_PROVIDER=local|mongo`
- `STORAGE_PROVIDER=local|s3`

If those variables are omitted, the backend auto-selects:

- `mongo` when `MONGODB_URI` is present
- `s3` when `AWS_S3_BUCKET` and `AWS_REGION` are present

## Backend Layers

- `src/routes/`: REST endpoints
- `src/controllers/`: request/response orchestration
- `src/services/`: app logic, validation, serialization
- `src/data/`: local and MongoDB provider implementations
- `src/storage/`: local and S3 file persistence
- `src/middleware/`: auth, roles, upload validation, errors

## MongoDB Atlas Path

When `DATA_PROVIDER=mongo`, the backend connects with Mongoose and stores:

- `users`
- `photos`
- `comments`
- `ratings`

The Mongo provider keeps the API response shape aligned with the local mode, so the frontend does not need special cloud handling.

## AWS S3 and CloudFront Path

When `STORAGE_PROVIDER=s3`, Multer uses memory storage and the backend uploads the image buffer to S3 through the AWS SDK.

Returned image URLs resolve in this order:

1. `AWS_CLOUDFRONT_URL`
2. `AWS_S3_PUBLIC_BASE_URL`
3. Default regional S3 URL

That makes the same API work for:

- direct S3 delivery
- CloudFront-backed delivery
- S3-compatible endpoints

## Scalability Notes

- The API remains stateless and token-based
- Images live outside the app server when S3 is enabled
- CDN delivery is supported through CloudFront URL rewriting
- MongoDB Atlas replaces the local JSON file for shared persistent storage
