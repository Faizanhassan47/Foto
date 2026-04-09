# Fotos API Spec

Base path: `/api`

## Health

- `GET /health`
  - Returns service status and active data/storage providers

## Auth

- `POST /auth/register`
  - Body: `name`, `email`, `password`, `role`
  - Returns: `token`, `user`

- `POST /auth/login`
  - Body: `email`, `password`
  - Returns: `token`, `user`

- `GET /auth/me`
  - Auth required
  - Returns current authenticated user

## Photos

- `GET /photos`
  - Optional query: `q`
  - Returns gallery photo cards

- `GET /photos/:photoId`
  - Returns a single photo with comments and rating summary fields

- `POST /photos`
  - Auth required
  - Creator role required
  - Multipart form fields:
    - `title`
    - `caption`
    - `location`
    - `eventName`
    - `tags`
    - `image`

## Comments

- `GET /comments/photo/:photoId`
  - Returns comments for a photo

- `POST /comments/photo/:photoId`
  - Auth required
  - Consumer role required
  - Body: `text`

## Ratings

- `GET /ratings/photo/:photoId`
  - Returns average rating, distribution, viewer rating, and count

- `POST /ratings/photo/:photoId`
  - Auth required
  - Consumer role required
  - Body: `value` from `1` to `5`
