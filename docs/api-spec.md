# Tasveer_Hubs API Specification

Base path: `/api`

## Health & Status

- `GET /health`
  - Returns service status, active data/storage providers, and connectivity health.

## Authentication

- `POST /auth/register`
  - Body: `name`, `email`, `password`, `role` (`creator` | `consumer`)
  - Returns: `token`, `user` object

- `POST /auth/login`
  - Body: `email`, `password`
  - Returns: `token`, `user` object

- `GET /auth/me`
  - **Auth required**
  - Returns current authenticated user record.

## Photos Gallery

- `GET /photos`
  - Query parameters:
    - `q`: Search string (searches title, location, event, tags).
    - `sort`: Sorting criteria (`newest` | `rating`). Default: `newest`.
    - `page`: Page number for infinite scroll. Default: `1`.
    - `limit`: Photos per page. Default: `12`.
  - Returns: `photos` array (serialized with `averageRating`, `commentsCount`, etc.)

- `GET /photos/:photoId`
  - Returns a single photo object including its full comment history and rating summary.

- `POST /photos`
  - **Auth required** (Creator role only)
  - Multipart form (File upload):
    - `image`: Binary file (JPEG/PNG)
    - `title`, `caption`, `location`, `eventName`, `tags`
  - Returns: Newly created photo object.

## Social Interactions

- `POST /comments/photo/:photoId`
  - **Auth required** (Consumer role only)
  - Body: `text`
  - Returns: Created comment record.

- `GET /ratings/photo/:photoId`
  - Returns: `averageRating`, `ratingsCount`, and `distribution`.

- `POST /ratings/photo/:photoId`
  - **Auth required** (Consumer role only)
  - Body: `value` (1-5)
  - **Note**: This is an upsert operation. One rating per user per photo.
