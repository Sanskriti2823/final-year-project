# LearnSmart AI — AI E-Learning Recommendation System

Repository: `final-year-project`

A final-year project starter using React + Vite, Express + MongoDB, JWT authentication, and a Python FastAPI recommendation service.

The learner dashboard includes course recommendations, saved courses, progress summaries, and a continue-learning panel. The course library supports text search, topic and level filters, enrollment, and persistent light/dark themes.

## Requirements
- Node.js 20+
- Python 3.10+
- MongoDB local or MongoDB Atlas
- Optional: an API key for the AI study assistant

## 1. Configure the backend
```powershell
cd backend
Copy-Item .env.example .env
npm install
```
Edit `backend/.env`. For local MongoDB, the default URI is suitable if MongoDB is running on your computer. Change `JWT_SECRET` to a long random secret.

## 2. Configure the AI service
Open another terminal:
```powershell
cd ai-service
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```
If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope Process Bypass` in that terminal and activate again. You can alternatively use `.venv\Scripts\python.exe -m pip install -r requirements.txt`.

Test at http://localhost:8000/docs.

## 3. Seed sample courses and start backend
In another terminal:
```powershell
cd backend
npm run seed
npm run dev
```
Run the backend regression tests with `npm test`.
Backend health: http://localhost:5000/api/health

## 4. Start frontend
In another terminal:
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```
Open the URL Vite prints, normally http://localhost:5173.

## 5. Try it
1. Register an account.
2. Browse courses and enroll.
3. Open For You to see recommendations.
4. Try quiz, progress, and AI Tutor pages.
5. To enable AI Tutor, configure `LLM_API_URL`, `LLM_API_KEY`, and `LLM_MODEL` in `backend/.env`. Use your provider's actual compatible chat-completions endpoint.

## Environment variables
See `.env.example` files. Never commit `.env` files or put secrets in frontend `VITE_` variables.
The backend `CLIENT_URL` accepts a comma-separated allowlist of browser origins. In development, both `http://localhost:5173` and `http://127.0.0.1:5173` are allowed; production only allows the configured origins.

## Upload this project to GitHub

The repository root is this `learnsmart-ai` folder. Create an empty repository on GitHub, then run these commands from this folder, replacing the remote URL with your repository URL:

```powershell
git add .
git status --short
git commit -m "Prepare LearnSmart AI for deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repository>.git
git push -u origin main
```

Before committing, confirm that `.env` files, `node_modules`, `.venv`, and `dist` are not listed for upload; `.gitignore` excludes them.

## Deploy to Render

The root `render.yaml` configures the frontend, Express API, and Python recommendation service as a Render Blueprint. MongoDB must be hosted separately; MongoDB Atlas has a free tier.

1. Push the contents of this `learnsmart-ai` folder to a GitHub repository. Do not upload `.env` files, virtual environments, or `node_modules`.
2. Create a MongoDB Atlas cluster, database user, and database named `learnsmart_ai`. Configure Atlas Network Access so Render can connect, then copy the cluster connection string. Replace the password placeholder and URL-encode special characters in the password.
3. In Render, choose **New → Blueprint**, connect the GitHub repository, and select `render.yaml`.
4. When Render asks for Blueprint variables, provide:
   - `MONGO_URI`: the Atlas connection string.
   - `CLIENT_URL`: `https://learnsmart-frontend.onrender.com`.
   - `VITE_API_URL`: `https://learnsmart-backend.onrender.com/api`.
   - `AI_SERVICE_KEY`: create one long random value and enter the **same value** for both the recommendation service and backend.
   - Render generates `JWT_SECRET` automatically.
5. Apply the Blueprint. The backend seeds the 12 example courses when it starts. Wait for all three services to finish deploying, then open the frontend URL.
6. If Render reports that one of these service names is already taken, rename that service in `render.yaml` and update the corresponding URLs above and the backend `AI_SERVICE_URL` to match.

The AI Tutor remains optional. To enable it, add `LLM_API_URL`, `LLM_API_KEY`, and `LLM_MODEL` to the backend service's Render environment settings and redeploy. Free Render web services may sleep when idle, so the first request after inactivity can take longer.

For manual or other-host deployment, set `MONGO_URI`, a strong `JWT_SECRET`, `CLIENT_URL`, `AI_SERVICE_URL`, and matching `AI_SERVICE_KEY` on the backend. Set the frontend's build-time `VITE_API_URL` to the backend URL plus `/api`, and configure an SPA fallback to `index.html`.

## Current project scope
This is a runnable academic starter, not a production-hardened commercial platform. It includes baseline content-based recommendations, JWT login, course catalog/enrollment, quiz attempts, progress tracking, and optional LLM chat. Add rate limiting, email verification, password reset, richer admin UI, and broader tests before production use.
