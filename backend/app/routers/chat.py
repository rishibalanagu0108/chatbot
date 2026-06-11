"""
Chat router - API endpoints for chat functionality

Routes are API endpoints that:
1. Receive HTTP requests from the frontend
2. Validate using Pydantic schemas (automatic)
3. Call service layer (business logic)
4. Return HTTP responses (automatically validated by Pydantic)

Why separate router from service?
- SERVICE: Business logic (how to call LLM, format responses)
- ROUTER: HTTP API (request validation, response formatting)
- Easy to test both independently
- Easy to add new interfaces (GraphQL, WebSockets, gRPC)

Pydantic automatically:
1. Validates incoming requests match ChatRequest schema
2. Returns 422 Unprocessable Entity if validation fails
3. Validates outgoing responses match ChatResponse schema
4. Documents API in Swagger (GET /docs)

This router handles:
- POST /api/chat/chat - Send a message and get response
- GET /api/chat/config - Get available configurations
"""

import logging
import time
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import Optional

from ..schemas.request import ChatRequest, LLMRole as SchemaLLMRole, TemperaturePreset
from ..schemas.response import ChatResponse, ConfigResponse, RoleInfo
from ..services.llm_service import LLMService
from ..config.settings import Settings, LLMRole

logger = logging.getLogger(__name__)

# Create a router for chat endpoints
# router is a FastAPI feature that groups related endpoints
router = APIRouter(prefix="/api/chat", tags=["chat"])

# Initialize the LLM service
# This is a global instance that will be used by all request handlers
try:
    llm_service = LLMService()
    logger.info("LLMService initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize LLMService: {str(e)}")
    llm_service = None


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Main chat endpoint - Send a message and get a response from the LLM

    This endpoint:
    1. Receives a chat request (automatically validated by Pydantic)
    2. Checks LLM service is ready
    3. Calls LLMService to generate response with system prompt and settings
    4. Returns response with complete metadata

    The request is automatically validated by Pydantic:
    - message must be 1-5000 characters
    - role must be one of the valid roles
    - temperature must be 0.0-2.0 (if provided)
    - max_tokens must be 100-4000 (if provided)

    If validation fails, returns 422 Unprocessable Entity with detailed errors.

    Args:
        request: ChatRequest (validated by Pydantic)
                {
                    "message": "What is Python?",
                    "role": "coder",
                    "temperature": 0.7,
                    "max_tokens": 1000
                }

    Returns:
        ChatResponse with AI response and metadata
        {
            "response": "Python is a programming language...",
            "success": true,
            "role_used": "coder",
            "temperature_used": 0.7,
            "max_tokens_used": 1000,
            "tokens_estimated": 150,
            "model_used": "gemini-pro",
            "timestamp": "2024-01-15T10:30:45Z",
            "processing_time_ms": 1250.5
        }

    Raises:
        HTTPException 400: Validation failed
        HTTPException 429: Rate limit reached
        HTTPException 500: Server error
    """
    # Record start time for performance tracking
    start_time = time.time()

    # Check if LLM service initialized successfully
    if llm_service is None:
        logger.error("LLM service is not initialized")
        raise HTTPException(
            status_code=500,
            detail="Server error: LLM service not initialized. Check API configuration."
        )

    try:
        # Extract parameters from request (Pydantic already validated them)
        message = request.message
        role = LLMRole[request.role.value.upper()] if request.role else LLMRole.ASSISTANT
        temperature = request.temperature
        temperature_preset = request.temperature_preset
        max_tokens = request.max_tokens

        logger.info(f"Processing chat request | Role: {role.value} | Message length: {len(message)}")

        # Generate response using LLMService
        # LLMService handles:
        # - System prompt injection for the role
        # - API call to Google Gemini
        # - Error handling and retry logic
        # - Token estimation
        response_text, metadata = await llm_service.generate_response(
            message=message,
            role=role,
            temperature=temperature,
            temperature_preset=temperature_preset,
            max_tokens=max_tokens,
        )

        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000  # Convert to milliseconds

        logger.info(f"Chat request successful | Time: {processing_time:.1f}ms")

        # Return successful response with all metadata
        return ChatResponse(
            response=response_text,
            success=True,
            role_used=metadata.get("role_used"),
            temperature_used=metadata.get("temperature_used"),
            max_tokens_used=metadata.get("max_tokens_used"),
            tokens_estimated=metadata.get("tokens_estimated"),
            model_used=metadata.get("model_used"),
            timestamp=datetime.utcnow(),
            processing_time_ms=processing_time,
        )

    except ValueError as e:
        # Handle validation errors from service
        error_msg = str(e)
        logger.warning(f"Validation error: {error_msg}")

        # Determine error code based on message
        error_code = "SERVER_ERROR"
        if "temperature" in error_msg.lower():
            error_code = "INVALID_TEMPERATURE"
        elif "token" in error_msg.lower():
            error_code = "INVALID_TOKENS"
        elif "message" in error_msg.lower():
            error_code = "INVALID_MESSAGE"

        raise HTTPException(
            status_code=400,
            detail=error_msg
        )

    except Exception as e:
        # Handle unexpected errors from LLM API
        error_str = str(e)
        logger.error(f"Unexpected error in chat endpoint: {error_str}")

        # Return appropriate error based on error type
        if "rate limit" in error_str.lower() or "429" in error_str:
            raise HTTPException(
                status_code=429,
                detail="API rate limit reached. Please try again in a moment."
            )
        elif "authentication" in error_str.lower() or "auth" in error_str.lower():
            raise HTTPException(
                status_code=500,
                detail="Authentication error with AI service. Please check configuration."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate response: {error_str[:100]}"
            )


@router.get("/config", response_model=ConfigResponse)
async def get_config() -> ConfigResponse:
    """
    Get available configuration options

    The frontend calls this on startup to:
    1. Get available roles (to populate dropdown)
    2. Get temperature presets (for preset buttons)
    3. Get validation constraints (min/max message length)
    4. Learn the API version (for feature detection)

    This makes the frontend generic - it doesn't hardcode role names
    or validation rules. If the backend changes, frontend automatically
    adapts.

    Returns:
        ConfigResponse with all available options, including:
        - roles: Available LLM personalities
        - temperature_presets: Temperature shorthand values
        - default_temperature: Default temp if user doesn't specify
        - default_max_tokens: Default token limit
        - min/max message lengths for validation
        - min/max temperature values
        - api_version: Version for feature detection
    """
    logger.info("Config endpoint called")

    try:
        # Build list of available roles with descriptions
        roles = [
            RoleInfo(
                name="assistant",
                description="General helpful assistant for any question"
            ),
            RoleInfo(
                name="coder",
                description="Expert programming assistant - great for code and technical explanations"
            ),
            RoleInfo(
                name="tutor",
                description="Patient educational tutor - explains concepts step by step"
            ),
            RoleInfo(
                name="creative",
                description="Creative and imaginative - perfect for brainstorming and writing"
            ),
        ]

        # Get temperature presets with their values
        # Import the enum to get all presets
        from ..config.settings import TemperaturePreset
        temperature_presets = {
            preset.value: Settings.get_temperature(preset)
            for preset in TemperaturePreset
        }

        logger.info(f"Returning config with {len(roles)} roles and {len(temperature_presets)} temperature presets")

        return ConfigResponse(
            roles=roles,
            temperature_presets=temperature_presets,
            default_temperature=Settings.DEFAULT_TEMPERATURE,
            default_max_tokens=Settings.DEFAULT_MAX_TOKENS,
            min_message_length=Settings.MIN_MESSAGE_LENGTH,
            max_message_length=Settings.MAX_MESSAGE_LENGTH,
            min_temperature=0.0,
            max_temperature=2.0,
            api_version="1.0.0",
        )

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error getting config: {error_msg}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get configuration"
        )
