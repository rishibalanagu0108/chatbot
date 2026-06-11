"""
Entry point for the FastAPI server

This is what you run with: python main.py

It imports the FastAPI app from app/main.py and runs it with uvicorn.
"""

import uvicorn
from app.config.settings import Settings

if __name__ == "__main__":
    """
    Main entry point - runs the FastAPI server

    uvicorn is an ASGI (Asynchronous Server Gateway Interface) server.
    It's a high-performance server that can handle many concurrent requests.
    """
    # Start the server
    uvicorn.run(
        "app.main:app",  # Import path: app/main.py, FastAPI instance 'app'
        host=Settings.SERVER_HOST,  # Listen on all network interfaces
        port=Settings.SERVER_PORT,  # Default port 8000
        reload=True,  # Auto-reload when code changes (for development)
        log_level=Settings.LOG_LEVEL.lower(),  # Logging level
    )
