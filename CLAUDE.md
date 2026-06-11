# AI Chat Application - Development Guide

## Project Overview
Building a simple, educational AI chat application with React frontend and Python FastAPI backend that integrates with Google Gemini API.

## Core Principles
- **Absolute Simplicity**: No fancy features, no memory/history, no tools, no RAG
- **Complete Understanding**: Every line of code is heavily commented and explained
- **Educational Focus**: Learning how to interact with LLM APIs directly
- **Staged Development**: Each feature is committed with clean git history

## Tech Stack
- **Frontend**: React 18 with Vite (dark/light mode, professional UI)
- **Backend**: FastAPI (simple, fast Python web framework)
- **LLM**: Google Gemini API (via google-generativeai SDK)
- **Styling**: Vanilla CSS with CSS variables for dark/light mode

## Feature Requirements

### Frontend (React)
1. Professional, attractive UI with dark/light mode toggle
2. Message display area (scrollable, shows user and AI messages)
3. Text input field with send button
4. Loading state while waiting for API response
5. Display any errors gracefully
6. No message history persistence (each refresh starts fresh)

### Backend (FastAPI)
1. Simple API endpoint to receive user messages
2. Call Google Gemini API with the message
3. Return the raw response to frontend
4. Handle CORS properly for React frontend
5. Environment variable for API key management
6. Health check endpoint for testing

### Code Quality
- Heavy comments on EVERY line explaining what it does
- No external styling libraries (vanilla CSS only)
- Minimal dependencies (keep it simple)
- Each stage results in a working feature
- Git commits after each completed stage

## Project Structure
```
ai-chat-app/
├── backend/
│   ├── main.py              # FastAPI server with all endpoints
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Google API key (git ignored)
│   └── .env.example          # Template for .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   ├── main.jsx         # Entry point
│   │   ├── styles.css       # Dark/light mode styling
│   │   └── api.js           # Backend API calls
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite configuration
│   ├── package.json         # Node dependencies
│   └── .env.local           # API URL configuration
├── .gitignore
├── README.md
├── CLAUDE.md                # This file
└── .git/                    # Git repository
```

## Development Workflow
1. Complete one stage
2. Test that stage works
3. Provide commit message for user to use
4. Move to next stage

## Stages
1. ✅ **Stage 1**: Project initialization (structure, files, git)
2. **Stage 2**: Python backend - basic FastAPI server
3. **Stage 3**: Python backend - Gemini API integration
4. **Stage 4**: Python backend - CORS & error handling
5. **Stage 5**: React frontend - project setup
6. **Stage 6**: React frontend - UI components
7. **Stage 7**: React frontend - API integration
8. **Stage 8**: Testing & final polish

## Key Notes
- Keep everything in one file per component (App.jsx for React, main.py for Flask)
- No external state management (just React hooks)
- No build-time magic (plain JavaScript, plain CSS)
- Heavy documentation through comments
- Environment variables for all secrets/config

## Testing the Application
1. Backend: `python main.py` runs on http://localhost:8000
2. Frontend: `npm run dev` runs on http://localhost:5173
3. Test health endpoint: `curl http://localhost:8000/health`
4. Manual testing: Use UI to send messages and verify responses
