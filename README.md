# AI Chat Application

A simple chat application with a React frontend and Python FastAPI backend that integrates with Google Gemini API.

## Architecture

- **Frontend**: React with dark/light mode toggle
- **Backend**: FastAPI server
- **LLM**: Google Gemini API

## Setup Instructions

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment:
   - Mac/Linux: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create `.env` file with your Google Gemini API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```
6. Run server: `python main.py`

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## API Endpoints

- `GET /health` - Check if server is running
- `POST /api/chat` - Send a message to the chat API

## Project Structure

```
ai-chat-app/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```
