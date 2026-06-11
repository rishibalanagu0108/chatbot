# AI Chat Application

A modern, professional chat application built with React and FastAPI, powered by Google Gemini API. Perfect for learning how to build LLM-powered applications.

## ✨ Features

- **Modern UI/UX**: Clean, professional interface with smooth animations
- **Dark/Light Mode**: Toggle theme preference (persisted to localStorage)
- **Real-time Chat**: Instant messaging with Google Gemini AI
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Input Validation**: Smart message validation with character counter
- **Error Handling**: Comprehensive error messages and recovery
- **Auto-scrolling**: Messages automatically scroll into view
- **Loading States**: Visual feedback while waiting for responses
- **Keyboard Shortcuts**: Press Enter to send, Shift+Enter for new lines
- **Formatted Responses**: AI responses with proper newline formatting

## 🏗️ Architecture

```
Frontend (React + Vite)
        ↓ (HTTP REST API)
Backend (FastAPI)
        ↓ (API Call)
Google Gemini API
```

**Tech Stack:**
- **Frontend**: React 18, Vite, Vanilla CSS (dark/light theme variables)
- **Backend**: FastAPI, Uvicorn, Google Generative AI SDK
- **Environment**: Python 3.7+, Node.js 16+, npm/yarn

## 📋 Prerequisites

- **Python 3.7+** - For running the backend
- **Node.js 16+** - For running the frontend
- **Google Gemini API Key** - Free from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Git** - For version control

## 🚀 Quick Start

### Step 1: Clone & Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API key
cat > .env << EOF
GOOGLE_API_KEY=your_actual_api_key_here
EOF

# Start the backend server
python main.py
# Server runs on http://localhost:8000
```

### Step 2: Setup & Run Frontend

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 3: Start Chatting!

Open http://localhost:5173 in your browser and start talking to the AI! 🎉

## 🎮 User Guide

### Keyboard Shortcuts
- **Enter** - Send message
- **Shift + Enter** - New line in message
- **🌙/☀️ Button** - Toggle dark/light mode

### Features
| Feature | How to Use |
|---------|-----------|
| **Dark Mode** | Click the moon/sun icon in top right |
| **Message Formatting** | AI responses automatically format newlines |
| **Character Count** | Shows current/max characters (5000) |
| **Timestamps** | Each message shows when it was sent |
| **Error Messages** | Clear, actionable error messages when something fails |

## 🧪 Testing Checklist

### Functional Testing
- [ ] Send a normal message and receive AI response
- [ ] Toggle dark/light mode and verify theme change
- [ ] Send multi-line message using Shift+Enter
- [ ] Verify timestamps display correctly
- [ ] Test auto-scrolling with multiple messages

### Error Handling Testing
- [ ] Stop backend and try to send message (should show connection error)
- [ ] Restart backend and verify recovery
- [ ] Try empty message (should be disabled)
- [ ] Try whitespace-only message (should be rejected)
- [ ] Test message longer than 5000 chars (should warn)

### UI/UX Testing
- [ ] Verify responsive design on different screen sizes
- [ ] Check loading dots while waiting for response
- [ ] Verify send button disabled during loading
- [ ] Check message bubbles are readable with proper spacing
- [ ] Verify smooth scrolling and animations

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 API Endpoints

### Backend Routes

**Health Check**
```bash
GET /health
# Returns: {"status": "ok", "message": "Server is running"}
```

**Chat Endpoint**
```bash
POST /api/chat
Content-Type: application/json

# Request:
{
  "message": "What is Python?"
}

# Response (Success):
{
  "response": "Python is a high-level programming language...",
  "success": true
}

# Response (Error):
{
  "response": "Error message here",
  "success": false
}
```

**Interactive Documentation**
```
GET http://localhost:8000/docs
# Opens Swagger UI with interactive API explorer
```

## 📁 Project Structure

```
chatbot/
├── backend/
│   ├── main.py                 # FastAPI server with all routes
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # API keys (git ignored)
│   └── .env.example             # Template for .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── main.jsx            # React entry point
│   │   └── styles.css          # Professional styling
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   ├── package.json            # Node dependencies
│   ├── .env.local              # API URL config
│   └── .env.example            # Template for .env.local
│
├── .gitignore                  # Git ignore rules
├── .git/                       # Git repository
├── README.md                   # This file
└── CLAUDE.md                   # Development guidelines
```

## 🐛 Troubleshooting

### Frontend won't connect to backend
```bash
# Check if backend is running on port 8000
curl http://localhost:8000/health

# If not running, start it:
cd backend && python main.py
```

### "API key not found" error
```bash
# Make sure .env file exists in backend/ directory
cd backend
cat .env  # Should show: GOOGLE_API_KEY=your_key

# If missing, create it:
echo "GOOGLE_API_KEY=your_actual_key" > .env
```

### npm install fails on Windows
```bash
# Try clearing npm cache
npm cache clean --force
npm install
```

### Port 8000 already in use
```bash
# Find and kill process using port 8000
# On Mac/Linux:
lsof -ti:8000 | xargs kill -9

# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Port 5173 already in use
```bash
# Edit vite.config.js and change the port:
# server: { port: 5174, ... }
```

## 📊 Development Notes

### Code Quality
- **Every line is heavily commented** for educational clarity
- **No external UI libraries** - Pure React and vanilla CSS
- **Responsive design** using CSS media queries
- **Accessibility** with ARIA labels and semantic HTML

### Performance Considerations
- **Message limit**: Max 100 messages per session to prevent memory issues
- **Input limit**: 5000 characters per message to avoid API limits
- **Auto-scroll**: Smooth scrolling with requestAnimationFrame
- **CSS variables**: Efficient theme switching without re-renders
- **Lazy evaluation**: Theme persisted to localStorage

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔐 Security Notes

- **API keys** are never exposed in frontend code
- **Environment variables** stored in `.env` (git ignored)
- **No direct API calls** from frontend to Gemini - all through backend
- **CORS** properly configured for development
- **Input validation** on both frontend and backend

## 📚 Learning Resources

- [Google Gemini API Documentation](https://ai.google.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 📝 License

Educational project - Free to use and modify.

## 🤝 Contributing

This is an educational project. Feel free to:
- Modify the code to learn
- Add new features
- Improve the UI/UX
- Share improvements

## 📞 Support

If you encounter issues:
1. Check the **Troubleshooting** section
2. Verify both servers are running
3. Check that your API key is valid
4. Review error messages in browser console (F12)
