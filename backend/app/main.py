"""
Main FastAPI Application

This is the entry point for the FastAPI server.
It:
1. Creates the FastAPI app instance
2. Sets up middleware (logging, CORS, etc.)
3. Registers routes
4. Configures error handling
5. Provides root endpoints

Think of this as the "conductor" that orchestrates all the pieces of the application.
"""

import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config.settings import Settings
from .utils.logging import setup_logging, get_logger
from .middleware.logging_middleware import LoggingMiddleware
from .routers.chat import router as chat_router
from .schemas.response import HealthResponse

# Set up logging first, before anything else
setup_logging(Settings.LOG_LEVEL)
logger = get_logger(__name__)

# Create the FastAPI application
# FastAPI is a modern web framework for building APIs in Python
# Key features:
# - Automatic validation of request data
# - Automatic generation of API documentation
# - High performance
# - Easy to use with clear syntax
app = FastAPI(
    title="AI Chat API",
    description="Professional AI Chat Application with Google Gemini",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI at /docs
    redoc_url="/redoc",  # ReDoc documentation at /redoc
    openapi_url="/openapi.json",  # OpenAPI schema
)

logger.info("FastAPI application created")

# ============================================================================
# MIDDLEWARE - These run before/after each request
# ============================================================================

# Add CORS middleware
# CORS (Cross-Origin Resource Sharing) allows the React frontend to make
# requests to this backend. Without this, browsers block cross-origin requests.
logger.info(f"Adding CORS middleware | Allowed origins: {Settings.CORS_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=Settings.CORS_ORIGINS,  # Which domains can access this API
    allow_credentials=True,  # Allow cookies and auth headers
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc)
    allow_headers=["*"],  # Allow all headers
)

# Add custom logging middleware
# This logs all requests and responses for debugging
logger.info("Adding logging middleware")
app.add_middleware(LoggingMiddleware)

# ============================================================================
# ROUTERS - Include API route groups
# ============================================================================

# Include the chat router
# The router contains all the /api/chat endpoints
logger.info("Including chat router")
app.include_router(chat_router)

# ============================================================================
# ROOT ENDPOINTS
# ============================================================================


@app.get("/", tags=["Info"])
async def root():
    """
    Root endpoint - information about the API

    Returns helpful information about available endpoints
    """
    return {
        "message": "Welcome to AI Chat API",
        "description": "Professional AI Chat Application with Google Gemini",
        "version": "1.0.0",
        "endpoints": {
            "health": "GET /health",
            "chat": "POST /api/chat/chat",
            "config": "GET /api/chat/config",
            "docs": "GET /docs",
            "redoc": "GET /redoc",
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["Info"])
async def health_check():
    """
    Health check endpoint

    Used by monitoring tools and load balancers to verify server is running.

    Returns:
        HealthResponse with status "ok" if healthy
    """
    logger.info("Health check called")
    return HealthResponse(
        status="ok",
        message="Server is running and healthy",
        timestamp=datetime.utcnow()
    )


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """
    Handle HTTP exceptions

    When an HTTPException is raised, this handler formats the response.
    """
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return {
        "detail": exc.detail,
        "status_code": exc.status_code,
    }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """
    Handle unexpected exceptions

    When an unexpected exception occurs, log it and return a safe error message
    """
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return {
        "detail": "An unexpected error occurred. Please try again.",
        "status_code": 500,
    }


# ============================================================================
# STARTUP & SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """
    Events that run when the server starts up

    Use this to initialize resources, check configuration, etc.
    """
    logger.info("=" * 70)
    logger.info("AI Chat API Starting Up")
    logger.info("=" * 70)

    # Validate that API key is configured
    if not Settings.validate_api_key():
        logger.error("CRITICAL: Google API key is not configured!")
        logger.error("Please set GOOGLE_API_KEY in your .env file")
    else:
        logger.info("✓ Google API Key is configured")

    logger.info(f"✓ Server running on {Settings.SERVER_HOST}:{Settings.SERVER_PORT}")
    logger.info(f"✓ Documentation available at http://localhost:{Settings.SERVER_PORT}/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Events that run when the server shuts down

    Use this to clean up resources, close connections, etc.
    """
    logger.info("=" * 70)
    logger.info("AI Chat API Shutting Down")
    logger.info("=" * 70)
