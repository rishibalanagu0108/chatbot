"""
Response schemas - define what data we send back to the client

These schemas ensure:
1. Consistent API responses across all endpoints
2. API documentation shows what clients will receive
3. Type safety when building responses
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ChatResponse(BaseModel):
    """
    Response from the chat endpoint

    Contains:
    - The AI's response text
    - Metadata about the response (tokens, role used, etc.)
    - Whether the request was successful

    Example:
    {
        "response": "Python is a programming language...",
        "success": true,
        "role_used": "coder",
        "temperature_used": 0.7,
        "tokens_estimated": 250
    }
    """

    response: str = Field(description="The AI's response text")
    """The AI's generated response"""

    success: bool = Field(default=True, description="Whether the request succeeded")
    """Whether the request was successful"""

    role_used: Optional[str] = Field(default=None, description="Which role was used")
    """Which role/personality was used for generation"""

    temperature_used: Optional[float] = Field(default=None, description="Temperature used")
    """Temperature value used for generation"""

    max_tokens_used: Optional[int] = Field(default=None, description="Max tokens used")
    """Max tokens limit used for generation"""

    tokens_estimated: Optional[int] = Field(default=None, description="Estimated tokens in response")
    """Estimated number of tokens in the response"""

    class Config:
        json_schema_extra = {
            "example": {
                "response": "Python is a high-level programming language...",
                "success": True,
                "role_used": "coder",
                "temperature_used": 0.7,
                "max_tokens_used": 1000,
                "tokens_estimated": 150
            }
        }


class ConfigResponse(BaseModel):
    """
    Response containing available configuration options

    Tells the frontend:
    - Available roles and their descriptions
    - Available temperature presets
    - Current default settings

    Example:
    {
        "roles": [
            {"name": "assistant", "description": "..."},
            {"name": "coder", "description": "..."}
        ],
        "temperature_presets": {
            "precise": 0.2,
            "balanced": 0.7,
            "creative": 1.0
        },
        "default_temperature": 0.7,
        "default_max_tokens": 1000
    }
    """

    roles: List[Dict[str, str]] = Field(description="Available LLM roles")
    """List of available roles with descriptions"""

    temperature_presets: Dict[str, float] = Field(description="Temperature presets")
    """Available temperature presets and their values"""

    default_temperature: float = Field(description="Default temperature")
    """Default temperature setting"""

    default_max_tokens: int = Field(description="Default max tokens")
    """Default max tokens limit"""

    min_message_length: int = Field(description="Minimum message length")
    """Minimum characters required in message"""

    max_message_length: int = Field(description="Maximum message length")
    """Maximum characters allowed in message"""

    class Config:
        json_schema_extra = {
            "example": {
                "roles": [
                    {"name": "assistant", "description": "General helpful assistant"},
                    {"name": "coder", "description": "Programming expert"}
                ],
                "temperature_presets": {
                    "precise": 0.2,
                    "balanced": 0.7,
                    "creative": 1.0
                },
                "default_temperature": 0.7,
                "default_max_tokens": 1000,
                "min_message_length": 1,
                "max_message_length": 5000
            }
        }


class HealthResponse(BaseModel):
    """
    Response from the health check endpoint

    Simple response indicating if the server is running

    Example:
    {
        "status": "ok",
        "message": "Server is running"
    }
    """

    status: str = Field(description="Server status")
    """Server status - 'ok' means healthy"""

    message: str = Field(description="Status message")
    """Detailed status message"""

    class Config:
        json_schema_extra = {
            "example": {
                "status": "ok",
                "message": "Server is running"
            }
        }


class ErrorResponse(BaseModel):
    """
    Standard error response format

    All errors return this format for consistency

    Example:
    {
        "detail": "Message cannot be empty",
        "status_code": 400,
        "error_code": "INVALID_MESSAGE"
    }
    """

    detail: str = Field(description="Error description")
    """Human-readable error message"""

    status_code: int = Field(description="HTTP status code")
    """HTTP status code"""

    error_code: Optional[str] = Field(default=None, description="Application error code")
    """Application-specific error code"""

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Message cannot be empty",
                "status_code": 400,
                "error_code": "INVALID_MESSAGE"
            }
        }
