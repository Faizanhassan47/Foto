# Zero-Cost Deployment Guide (Fotos)

This guide walks you through deploying the Fotos app to a production environment for **$0/month** using Render and MongoDB Atlas.

## Prerequisites
- A **GitHub** account.
- A **Render** account (connect it to your GitHub).
- A **MongoDB Atlas** account.

---

## Step 1: Set up MongoDB Atlas (Free Tier)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **Shared Cluster** (Free tier).
3. Under **Network Access**, add `0.0.0.0/0` (Allow access from anywhere).
4. Under **Database Access**, create a user with a password.
5. Click **Connect** > **Drivers** > **Node.js** and copy your **Connection String**.
   - *Example*: `mongodb+srv://user:pass@cluster.xxxx.mongodb.net/fotos?retryWrites=true&w=majority`

## Step 2: Push your code to GitHub
1. Create a **Private** repository on GitHub.
2. Push your local `Fotos` directory to the repository:
   ```bash
   git add .
   git commit -m "chore: prepare for production deployment"
   git push origin main
   ```

## Step 3: Deploy to Render
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Select **Blueprints** > **New Blueprint Instance**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and prepare the services:
   - **fotos-api** (Web Service)
   - **fotos-app** (Static Site)
5. Under **Service Customization**, you will be prompted for Environment Variables:
   - `MONGODB_URI`: Paste your string from Step 1.
   - `JWT_SECRET`: Leave blank (Render will generate one) or enter a long random string.
   - `CLIENT_ORIGIN`: You will need to update this **after** the first deployment with your frontend URL.

## Step 4: Finalize Connectivity
1. Once the **fotos-app** (Static Site) is deployed, copy its URL (e.g., `https://fotos-app.onrender.com`).
2. Go to the **fotos-api** settings on Render.
3. Update the `CLIENT_ORIGIN` environment variable to match your frontend URL.
4. Trigger a manual deploy of the **fotos-api** to apply the change.

---

## Troubleshooting
- **Spin-up Delay**: The Backend (API) is on a free plan. If it hasn't been accessed for 15 minutes, it will sleep. The first request will take about 30 seconds to wake it up.
- **Image Uploads**: By default, this deployment is configured for AWS S3. If you haven't provided S3 credentials, the app will fall back to local storage (which resets on every deploy). For permanent free image hosting, consider switching the `STORAGE_PROVIDER` to **Cloudinary**.

---
*Generated for the Fotos Project Deployment.*
