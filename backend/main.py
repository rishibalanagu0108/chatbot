"""
AI Chat Application - FastAPI Backend
Stage 2: Basic Server Setup with Health Check

This is the main FastAPI server that will:
1. Handle requests from the React frontend
2. Call the Google Gemini API
3. Return responses to the frontend

Every line is commented to explain exactly what it does.
"""

# ============================================================================
# IMPORTS - These bring in libraries we need
# ============================================================================

# FastAPI: A modern, fast Python web framework for building APIs
from fastapi import FastAPI
# CORSMiddleware: Allows requests from different domains (React frontend)
from fastapi.middleware.cors import CORSMiddleware
# BaseModel: Used to define the structure of data we receive from frontend
from pydantic import BaseModel
# load_dotenv: Loads environment variables from .env file
from dotenv import load_dotenv
# os: Allows us to read environment variables (like API key)
import os
# google.generativeai: SDK for Google's Gemini AI API
import google.generativeai as genai

# ============================================================================
# CONFIGURATION
# ============================================================================

# Load environment variables from .env file
# This reads GOOGLE_API_KEY and other settings from .env
load_dotenv()

# Get the Google API key from environment variables
# This should be set in your .env file as GOOGLE_API_KEY=your_key_here
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Configure the google.generativeai library with your API key
# This tells the SDK which account to use for API requests
genai.configure(api_key=GOOGLE_API_KEY)

# Get the list of available models to find one that supports generateContent
# Different API keys may have access to different models
try:
    # List all available models
    available_models = genai.list_models()

    # Find the first model that supports generateContent
    model_name = None
    for available_model in available_models:
        # Check if this model supports generateContent method
        if "generateContent" in available_model.supported_generation_methods:
            model_name = available_model.name
            break

    # If we found a supported model, use it
    # Otherwise, use a default fallback
    if model_name:
        # Remove "models/" prefix if present (genai returns "models/model-name")
        if model_name.startswith("models/"):
            model_name = model_name.replace("models/", "")
        model = genai.GenerativeModel(model_name)
    else:
        # Fallback to a known model if listing fails
        model = genai.GenerativeModel("gemini-pro")

except Exception as e:
    # If we can't list models, try a fallback model
    # This might happen if the API key doesn't have listModels permission
    print(f"Warning: Could not list models ({str(e)}), using fallback model")
    model = genai.GenerativeModel("gemini-pro")

# Create a FastAPI application instance
# This is the core of our web server
app = FastAPI(
    title="AI Chat API",  # Name of the API
    description="Simple chat API that integrates with Google Gemini",  # Description
    version="0.0.1"  # Version number
)

# ============================================================================
# CORS CONFIGURATION
# Add CORS middleware to allow requests from React frontend
# ============================================================================

# Define which origins (domains) can access our API
allowed_origins = [
    "http://localhost:3000",      # Standard React dev port (if using CRA)
    "http://localhost:5173",      # Vite dev server port (we're using this)
    "http://127.0.0.1:5173",      # Alternative localhost
    "http://localhost:8000",      # For testing from same machine
]

# Add CORS middleware to the FastAPI app
# This tells the server to accept requests from the allowed_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Which domains can access this API
    allow_credentials=True,          # Allow cookies and auth
    allow_methods=["*"],             # Allow all HTTP methods (GET, POST, etc)
    allow_headers=["*"],             # Allow all headers
)

# ============================================================================
# DATA MODELS - Define the structure of data we expect/send
# ============================================================================

# This defines what data we expect to receive from the frontend
class ChatRequest(BaseModel):
    """
    Structure of the chat message request from frontend

    Example:
    {
        "message": "Hello, how are you?"
    }
    """
    # The user's message text
    message: str


# This defines what data we'll send back to the frontend
class ChatResponse(BaseModel):
    """
    Structure of the chat response we send back to frontend

    Example:
    {
        "response": "I'm doing well, thank you for asking!",
        "success": true
    }
    """
    # The AI's response text
    response: str
    # Whether the request was successful
    success: bool


# ============================================================================
# ROUTES - Define the API endpoints
# ============================================================================

# Health check endpoint - simple endpoint to verify server is running
@app.get("/health")
async def health_check():
    """
    Health check endpoint - called to verify the server is running

    This endpoint doesn't require any data. Just visit http://localhost:8000/health
    in your browser and you should see {"status": "ok"}

    Returns:
        dict: A simple status message
    """
    # Return a simple JSON response indicating the server is healthy
    return {"status": "ok", "message": "Server is running"}


# Chat endpoint - the main endpoint that will handle messages
@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Main chat endpoint - receives a message and returns a response

    This endpoint will:
    1. Receive a message from the frontend
    2. Send it to Google Gemini API
    3. Return the response

    Args:
        request (ChatRequest): Contains the user's message

    Returns:
        ChatResponse: Contains the AI's response
    """

    # Extract the message from the request
    user_message = request.message

    # Try to get a response from Google Gemini API
    # We wrap this in a try-except to handle any errors gracefully
    try:
        # Call the Gemini model with the user's message
        # generate_content() is the main method to get AI responses
        response = model.generate_content(user_message)
        print(response)

        # Extract the text from the response
        # response.text contains the actual AI-generated response
        ai_response = response.text

        # Return the response in the expected format
        return ChatResponse(
            response=ai_response,
            success=True
        )

    # If something goes wrong (API error, invalid key, etc), catch it here
    except Exception as e:
        # Return an error message to the frontend
        # This helps with debugging and tells the user something went wrong
        error_message = f"Error: {str(e)}"
        return ChatResponse(
            response=error_message,
            success=False
        )


# ============================================================================
# ERROR HANDLING - What happens if something goes wrong
# ============================================================================

@app.get("/")
async def root():
    """
    Root endpoint - what appears when you visit http://localhost:8000/

    This is just informational - tells users how to use the API
    """
    return {
        "message": "Welcome to AI Chat API",
        "endpoints": {
            "health": "GET /health - Check if server is running",
            "chat": "POST /api/chat - Send a message",
            "docs": "GET /docs - Interactive API documentation"
        }
    }


# ============================================================================
# MAIN - This runs when we execute this script
# ============================================================================

if __name__ == "__main__":
    """
    This code only runs when we execute this file directly
    (not when it's imported by another file)

    It starts the FastAPI server using Uvicorn ASGI server
    """

    # Import uvicorn for running the server
    import uvicorn

    # Start the server
    # host="0.0.0.0" means the server listens on all network interfaces
    # port=8000 means the server runs on http://localhost:8000
    # reload=True means the server restarts when we change code (good for development)
    uvicorn.run(
        "main:app",  # Run the 'app' FastAPI instance from this file
        host="0.0.0.0",  # Listen on all network interfaces
        port=8000,  # Use port 8000
        reload=True  # Auto-reload when code changes
    )
