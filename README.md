# Yusroh Calculator

A modern minimalist vintage scientific calculator built as a single-page web app with a warm, elegant interface and fast backend math processing.

## Tech Stack
- Frontend: React, TypeScript, Tailwind CSS, Vite
- Backend: Python, FastAPI

## Local Development
### Backend
```bash
cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will run at http://localhost:5173 and will use http://localhost:8000 as the default backend URL during local development.

## Deployment
- Frontend: Vercel
- Backend: Vercel Serverless Functions or another Python hosting provider

For production, set the frontend environment variable VITE_API_URL to your deployed backend URL.
