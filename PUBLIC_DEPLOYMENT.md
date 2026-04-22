# Make ScoreApp Public

This project can be made public with:
- Backend on Render
- Frontend on Netlify

## 1) Deploy Backend on Render

1. Push project to GitHub.
2. In Render, create a new Web Service from your repo.
3. Configure:
   - Root Directory: backend
   - Build Command: npm install
   - Start Command: npm start
4. Add environment variables:
   - PORT=10000
   - JWT_SECRET=any_secure_random_string
   - CORS_ORIGIN=<your netlify site URL>
   - MONGO_URI=<optional>
5. Deploy and copy backend URL, for example:
   - https://scoreapp-backend.onrender.com

Health check:
- Open backend URL in browser.
- You should see: ScoreApp backend is running.

## 2) Deploy Frontend on Netlify

1. In Netlify, create a new site from your repo.
2. Configure:
   - Base directory: frontendcd
   - Build command: npm run build
   - Publish directory: build
3. Add environment variable:
   - REACT_APP_API_BASE_URL=<your render backend URL>
4. Deploy site.

The frontend will be public with a URL like:
- https://your-scoreapp.netlify.app

## 3) Final CORS Step

Set backend variable CORS_ORIGIN to the exact Netlify URL.
Then redeploy backend once.

## 4) Share

Share the Netlify frontend URL with users.
They can open the link and complete the ScoreApp assessment from any device.
