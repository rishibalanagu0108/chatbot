# Quick Start Guide

Get the AI Chat Application running in 5 minutes! ⚡

## Prerequisites
- Python 3.7+
- Node.js 16+
- Google Gemini API Key (free from https://aistudio.google.com/app/apikey)

## 1️⃣ Setup Backend (2 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate          # Mac/Linux
# OR
venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API key
# Replace YOUR_API_KEY with your actual key
cat > .env << EOF
GOOGLE_API_KEY=YOUR_API_KEY
EOF

# Start the server
python main.py
# ✅ You should see: "Uvicorn running on http://0.0.0.0:8000"
```

## 2️⃣ Setup Frontend (2 minutes)

In a **NEW TERMINAL**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# ✅ You should see: "Local: http://localhost:5173"
```

## 3️⃣ Start Chatting! (1 minute)

1. Open http://localhost:5173 in your browser
2. Type a message and press **Enter**
3. Watch the AI respond! 🎉

## 🎮 Quick Tips

| Action | How |
|--------|-----|
| Send message | Press **Enter** |
| New line | Press **Shift+Enter** |
| Dark mode | Click **🌙** icon |
| Light mode | Click **☀️** icon |

## ❌ Troubleshooting

### Backend won't start
```bash
# Check Python is installed
python --version

# Check in backend directory
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend won't start
```bash
# Check Node is installed
node --version
npm --version

# If npm install fails
cd frontend
npm cache clean --force
npm install
npm run dev
```

### "Cannot connect to backend"
```bash
# Make sure backend is running:
# Terminal 1: cd backend && python main.py

# And frontend:
# Terminal 2: cd frontend && npm run dev

# Both should be running!
```

### "API key not found"
```bash
# Check backend/.env exists
cd backend
cat .env

# Should show your API key
# If not, create it:
echo "GOOGLE_API_KEY=your_key_here" > .env
```

## 📖 Full Documentation

For more details, see:
- **README.md** - Complete project overview
- **TESTING.md** - Comprehensive testing checklist
- **CLAUDE.md** - Development guidelines

## ✨ What Works

✅ Send messages to AI  
✅ Get instant responses  
✅ Dark/light mode toggle  
✅ Auto-scrolling messages  
✅ Error handling  
✅ Works on mobile!  

## 🆘 Still Having Issues?

1. Check that **both servers are running**
2. Check browser console for errors (F12)
3. Check terminal output for error messages
4. Verify your API key is valid
5. Try stopping and restarting both servers

---

**Happy chatting!** 🚀
