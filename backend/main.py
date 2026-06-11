"""
AI Chat Application - FastAPI Backend
Stage 4: Error Handling & Input Validation

This is the main FastAPI server that will:
1. Handle requests from the React frontend
2. Call the Google Gemini API
3. Return responses to the frontend
4. Validate all inputs
5. Handle errors gracefully with proper HTTP status codes

Every line is commented to explain exactly what it does.
"""

# ============================================================================
# IMPORTS - These bring in libraries we need
# ============================================================================

# FastAPI: A modern, fast Python web framework for building APIs
from fastapi import FastAPI, HTTPException
# CORSMiddleware: Allows requests from different domains (React frontend)
from fastapi.middleware.cors import CORSMiddleware
# BaseModel: Used to define the structure of data we receive from frontend
from pydantic import BaseModel, Field
# load_dotenv: Loads environment variables from .env file
from dotenv import load_dotenv
# os: Allows us to read environment variables (like API key)
import os
# logging: For recording important events and debugging
import logging
# google.generativeai: SDK for Google's Gemini AI API
import google.generativeai as genai

# ============================================================================
# CONFIGURATION
# ============================================================================

# Set up logging to track important events and errors
# This helps us debug issues and understand what's happening
logging.basicConfig(
    level=logging.INFO,  # Log info level and higher (info, warning, error, critical)
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"  # Format includes timestamp, name, level, message
)
logger = logging.getLogger(__name__)  # Create a logger for this module

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
    # min_length=1 means the message must have at least 1 character
    # max_length=5000 means the message cannot be longer than 5000 characters
    message: str = Field(
        min_length=1,
        max_length=5000,
        description="The user's message to send to the AI"
    )


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

    # Extract and log the message
    user_message = request.message.strip()  # Remove leading/trailing whitespace
    logger.info(f"Received message from user: {user_message[:100]}...")  # Log first 100 chars

    # Validate the message isn't just whitespace after stripping
    if not user_message:
        logger.warning("User sent empty or whitespace-only message")
        raise HTTPException(
            status_code=400,  # 400 = Bad Request
            detail="Message cannot be empty or just whitespace"
        )

    # Try to get a response from Google Gemini API
    # We wrap this in a try-except to handle specific error types
    try:
        # Call the Gemini model with the user's message
        # generate_content() is the main method to get AI responses
        logger.info("Sending message to Gemini API...")
        response = model.generate_content(user_message)

        # Check if the response has content
        if not response or not response.text:
            logger.warning("Gemini API returned empty response")
            raise HTTPException(
                status_code=500,  # 500 = Internal Server Error
                detail="AI model returned an empty response. Please try again."
            )

        # Extract the text from the response
        # response.text contains the actual AI-generated response
        ai_response = response.text
        logger.info("Successfully received response from Gemini API")

        # Return the response in the expected format
        return ChatResponse(
            response=ai_response,
            success=True
        )

    # Handle specific API authentication errors
    except ValueError as e:
        # ValueError usually means invalid API key or configuration
        logger.error(f"API Configuration error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="API configuration error. Check your API key."
        )

    # Handle rate limiting or quota errors
    except Exception as e:
        error_str = str(e)
        logger.error(f"Gemini API error: {error_str}")

        # Check if it's a rate limit error
        if "429" in error_str or "quota" in error_str.lower():
            raise HTTPException(
                status_code=429,  # 429 = Too Many Requests
                detail="API rate limit reached. Please try again in a moment."
            )

        # Check if it's a model availability error
        if "not found" in error_str.lower() or "not supported" in error_str.lower():
            raise HTTPException(
                status_code=500,
                detail="AI model is not available. Please try again later."
            )

        # Generic error handler for any other API errors
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get response from AI: {error_str[:100]}"
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
