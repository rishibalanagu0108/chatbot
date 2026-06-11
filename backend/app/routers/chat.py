"""
Chat router - API endpoints for chat functionality

Routes are API endpoints that:
1. Receive HTTP requests from the frontend
2. Call service layer (business logic)
3. Return HTTP responses

Why separate router from service?
- Service layer is about WHAT to do (business logic)
- Router layer is about HOW to expose it (HTTP API)
- Easy to add new interfaces (GraphQL, WebSockets, gRPC, etc.)
- Easy to test both independently

This router handles:
- POST /api/chat - Send a message
- GET /api/chat/config - Get available configurations
"""

import logging
from fastapi import APIRouter, HTTPException
from typing import Optional

from ..schemas.request import ChatRequest, LLMRole as SchemaLLMRole, TemperaturePreset
from ..schemas.response import ChatResponse, ConfigResponse, HealthResponse
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
    1. Receives a chat request with message and optional settings
    2. Validates the input (done automatically by Pydantic)
    3. Calls the LLMService to generate a response
    4. Returns the response with metadata

    Args:
        request: ChatRequest containing message and optional settings

    Returns:
        ChatResponse with AI response and metadata

    Raises:
        HTTPException: If validation or generation fails
    """
    # Check if LLM service initialized successfully
    if llm_service is None:
        logger.error("LLM service is not initialized")
        raise HTTPException(
            status_code=500,
            detail="Server error: LLM service not initialized. Check API configuration."
        )

    try:
        # Extract parameters from request
        message = request.message
        role = LLMRole[request.role.value.upper()] if request.role else LLMRole.ASSISTANT
        temperature = request.temperature
        temperature_preset = request.temperature_preset
        max_tokens = request.max_tokens

        logger.info(f"Processing chat request | Role: {role.value}")

        # Generate response using LLMService
        response_text, metadata = await llm_service.generate_response(
            message=message,
            role=role,
            temperature=temperature,
            temperature_preset=temperature_preset,
            max_tokens=max_tokens,
        )

        # Return successful response
        return ChatResponse(
            response=response_text,
            success=True,
            role_used=metadata.get("role_used"),
            temperature_used=metadata.get("temperature_used"),
            max_tokens_used=metadata.get("max_tokens_used"),
            tokens_estimated=metadata.get("tokens_estimated"),
        )

    except ValueError as e:
        # Handle validation errors
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        # Handle unexpected errors
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

    Returns information about:
    - Available roles
    - Temperature presets
    - Default settings
    - Validation limits

    This is called by the frontend on startup to populate UI options.

    Returns:
        ConfigResponse with all available options
    """
    logger.info("Config requested")

    try:
        # Get available roles with descriptions
        roles = [
            {
                "name": "assistant",
                "description": "General helpful assistant"
            },
            {
                "name": "coder",
                "description": "Expert programming assistant"
            },
            {
                "name": "tutor",
                "description": "Patient educational tutor"
            },
            {
                "name": "creative",
                "description": "Creative and imaginative"
            },
        ]

        # Get temperature presets
        temperature_presets = {
            "precise": Settings.TEMPERATURE_VALUES["precise"],
            "balanced": Settings.TEMPERATURE_VALUES["balanced"],
            "creative": Settings.TEMPERATURE_VALUES["creative"],
        }

        # Convert to proper types for ConfigResponse
        from ..config.settings import TemperaturePreset as ConfigTemperaturePreset
        temperature_presets = {
            preset.value: Settings.get_temperature(preset)
            for preset in ConfigTemperaturePreset
        }

        return ConfigResponse(
            roles=roles,
            temperature_presets=temperature_presets,
            default_temperature=Settings.DEFAULT_TEMPERATURE,
            default_max_tokens=Settings.DEFAULT_MAX_TOKENS,
            min_message_length=Settings.MIN_MESSAGE_LENGTH,
            max_message_length=Settings.MAX_MESSAGE_LENGTH,
        )

    except Exception as e:
        logger.error(f"Error getting config: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get configuration"
        )
