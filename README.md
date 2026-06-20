# CausalFunnel User Analytics Assignment

Simple full-stack analytics app for tracking user behavior on demo e-commerce pages and viewing the data in a React dashboard.

## What It Does

- Tracks `page_view` events.
- Tracks `click` events with x/y coordinates.
- Stores events by `session_id`.
- Shows an analytics overview, session journey, and click heatmap.
- Includes demo pages to generate tracking data.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Tracking script: Vanilla JavaScript

## Project Structure

```text
tracker/              Browser tracking script
server/               Express API and MongoDB models
client/               React analytics dashboard
demo/                 Demo e-commerce pages for testing
```

## Setup Locally

### 1. Start MongoDB

Use MongoDB Atlas or a local MongoDB instance.

Create `server/.env`:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/causalfunnel
PORT=5000
```

### 2. Run Backend

```bash
cd server
npm install
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

Demo pages:

```text
http://localhost:5000/demo/index.html
http://localhost:5000/demo/products.html
http://localhost:5000/demo/about.html
```

### 3. Run Frontend

Create `client/.env.local`:

```env
VITE_API_BASE=http://localhost:5000/api
```

Then run:

```bash
cd client
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## API Endpoints

- `POST /api/events` - Store tracking event
- `GET /api/stats` - Dashboard overview stats
- `GET /api/sessions` - Session list with event counts
- `GET /api/sessions/:sessionId` - Ordered events for one session
- `GET /api/heatmap?page_url=...` - Click coordinates for a page
- `GET /api/pages` - List tracked pages
- `GET /api/health` - Backend health check

## Tracker Usage

Add this script to any page:

```html
<script
  src="http://localhost:5000/tracker/cf-tracker.js"
  data-endpoint="http://localhost:5000/api/events"
></script>
```

For hosted usage, replace `localhost:5000` with the deployed backend URL.

## Dashboard Pages

- `/dashboard` - Overview cards, top pages, recent sessions, click summary
- `/sessions` - Session list and ordered user journey
- `/heatmap` - Page selector with click dots

## Deployment Guide

Recommended simple deployment:

- MongoDB Atlas for database
- Render for backend
- Vercel or Netlify for frontend

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial CausalFunnel analytics assignment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Make the GitHub repository public before sharing.

### 2. Deploy Backend on Render

Create a new Render Web Service from the GitHub repo.

Use these settings:

```text
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Add environment variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
```

Render provides `PORT` automatically. Keep `PORT=5000` only for local development.

After deploy, Render gives a URL like:

```text
https://your-api.onrender.com
```

Test:

```text
https://your-api.onrender.com/api/health
```

Hosted demo pages:

```text
https://your-api.onrender.com/demo/products.html
```

### 3. Deploy Frontend on Vercel

Create a new Vercel project from the same GitHub repo.

Use these settings:

```text
Root Directory: client
Build Command: npm run build
Output Directory: dist
```

`client/vercel.json` is included so React Router URLs like `/dashboard` work after refresh.

Add environment variable:

```env
VITE_API_BASE=https://your-api.onrender.com/api
```

Deploy and open the Vercel URL.

### 4. Generate Data After Deploy

Open:

```text
https://your-api.onrender.com/demo/products.html
```

Click product cards, `Add to cart`, and `Buy now` buttons. Then open the frontend dashboard and refresh.

## Assumptions and Trade-offs

- Session IDs are stored in `localStorage`.
- A session expires after 30 minutes of inactivity.
- Only `page_view` and `click` events are tracked because those were required.
- Heatmap uses simple click dots instead of a heavy heatmap library.
- CORS is open for assignment/demo simplicity. In production, restrict it to trusted domains.
- Demo pages are served from the backend so hosted tracking works without extra setup.
