# Fotos Premium System Guide

This guide provides an overview of the "Premium" architecture and features implemented in the Fotos (formerly EventGallery) platform.

## 1. Design Philosophy
The system follows a **Cloud-Native, Performance-First** approach. 
- **HSL Architecture**: The design system uses HSL variables for perfect dark/light mode consistency.
- **Micro-Animations**: Framer Motion is used for layout transitions and interaction feedback.
- **Glassmorphism**: UI elements use high-performance backdrop filters for a modern look.

## 2. Key UI Features

### Masonry Gallery
We implemented a **pure CSS Column-based Masonry** layout.
- **Benefit**: Zero layout shift and significantly better performance than JS-based libraries like `react-masonry-css`.
- **Location**: `.masonry-grid` in `global.css`.

### Immersive Lightbox
A custom-built component for viewing photos in high resolution without leaving context.
- **Benefit**: Smooth zoom-in animations and accessible interaction.
- **Component**: `frontend/src/components/Lightbox.jsx`.

### Infinite Scroll
Built with the modern `IntersectionObserver` API.
- **Benefit**: Low memory overhead and seamless content discovery.
- **Hook**: `frontend/src/hooks/useFetchPhotos.js`.

## 3. Backend Optimizations

### Denormalized Scale Strategy
Sorting by ratings is a common bottleneck in photo apps. 
- **Implementation**: We denormalize `averageRating` and `ratingsCount` into the `Photo` document.
- **Updating**: Automated updates via Mongoose aggregation on every new rating.
- **Benefit**: Sorting by "Highest Rated" remains an **O(1) database operation**.

### Connectivity Health
The `/api/health` endpoint provides real-time status of:
- **MongoDB Connection** (checks Mongoose heartbeats).
- **Storage Provider** (identifies current S3 vs Local mode).

## 4. Production Readiness

### Branching & Deployment
- **Git State**: The project is clean and ready for worktree merges.
- **CI/CD**: GitHub Actions are configured to build, test, and deploy both tiers automatically.

---
*Created by Antigravity AI for the Fotos Project.*
