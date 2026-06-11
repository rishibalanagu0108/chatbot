"""
Response schemas - define what data we send back to the client

Why response schemas matter:
1. CONSISTENCY: All endpoints return predictable format
2. DOCUMENTATION: Auto-generates Swagger/OpenAPI docs
3. TYPE SAFETY: Pydantic ensures all fields match types
4. FRONTEND TRUST: Frontend knows exactly what to expect
5. ERROR DETECTION: Wrong data type caught at runtime with clear error

When a response doesn't match schema:
- Pydantic logs an error
- API returns 500 (internal server error)
- Frontend gets clear error message
- Developer sees validation error in logs
"""

from __future__ import annotations
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ChatResponse(BaseModel):
    """
    Response from the chat endpoint

    This is what the frontend receives after sending a message.
    Contains:
    - The AI's response text
    - Metadata about how the response was generated
    - Timestamps for debugging/logging
    - Token information for cost estimation

    Why metadata matters:
    - Frontend can show "Generated with creative role at temp 1.0"
    - Helps debug why responses are different
    - Enables analytics on what settings users prefer
    - Useful for cost estimation

    Example:
    {
        "response": "Python is a programming language...",
        "success": true,
        "role_used": "coder",
        "temperature_used": 0.7,
        "tokens_estimated": 250,
        "timestamp": "2024-01-15T10:30:45Z"
    }
    """

    response: str = Field(
        min_length=1,
        description="The AI's generated response text"
    )
    """The AI's generated response"""

    success: bool = Field(
        default=True,
        description="Whether the request succeeded (true = good response)"
    )
    """Whether the request was successful"""

    role_used: Optional[str] = Field(
        default=None,
        description="Which role was used for generation (assistant, coder, tutor, creative)"
    )
    """Which role/personality was used"""

    temperature_used: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="Temperature value used (0.0=deterministic, 2.0=very random)"
    )
    """Temperature setting used for generation"""

    max_tokens_used: Optional[int] = Field(
        default=None,
        ge=100,
        le=4000,
        description="Max tokens limit used"
    )
    """Max tokens limit used for generation"""

    tokens_estimated: Optional[int] = Field(
        default=None,
        ge=1,
        description="Estimated number of tokens in the response"
    )
    """Estimated tokens in response (for cost/length estimation)"""

    model_used: Optional[str] = Field(
        default=None,
        description="Which LLM model was used (e.g., 'gemini-pro')"
    )
    """Which model generated this response"""

    timestamp: Optional[datetime] = Field(
        default=None,
        description="When the response was generated (ISO 8601 format)"
    )
    """ISO 8601 timestamp of when response was generated"""

    processing_time_ms: Optional[float] = Field(
        default=None,
        ge=0,
        description="How long the LLM took to generate response in milliseconds"
    )
    """Processing time in milliseconds (useful for monitoring)"""

    formatted_blocks: Optional[List["FormattedBlock"]] = Field(
        default=None,
        description="Response parsed into formatted blocks for rich rendering"
    )
    """Formatted blocks for frontend rendering (paragraphs, code, headings, etc.)"""

    formatting_metadata: Optional[ResponseMetadata] = Field(
        default=None,
        description="Metadata about the formatted response (has_code, code_languages, etc.)"
    )
    """Metadata about formatting (code languages, block count, etc.)"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "response": "Python is a high-level programming language. Here's a simple example:\n\n```python\ndef hello():\n    print('world')\n```\n\nKey features:\n- Easy to learn\n- Readable syntax",
                "success": True,
                "role_used": "coder",
                "temperature_used": 0.7,
                "max_tokens_used": 1000,
                "tokens_estimated": 150,
                "model_used": "gemini-pro",
                "timestamp": "2024-01-15T10:30:45Z",
                "processing_time_ms": 1250.5,
                "formatted_blocks": [
                    {
                        "type": "paragraph",
                        "content": "Python is a high-level programming language. Here's a simple example:",
                        "metadata": None
                    },
                    {
                        "type": "code",
                        "content": "def hello():\n    print('world')",
                        "metadata": {"language": "python"}
                    },
                    {
                        "type": "paragraph",
                        "content": "Key features:",
                        "metadata": None
                    }
                ],
                "formatting_metadata": {
                    "has_code": True,
                    "code_languages": ["python"],
                    "has_markdown": True,
                    "block_count": 3,
                    "code_block_count": 1,
                    "character_count": 180
                }
            }
        }
    )

    @field_validator('tokens_estimated', 'processing_time_ms', mode='before')
    @classmethod
    def allow_none(cls, v):
        """Allow None values"""
        return v


class BlockType(str, Enum):
    """Types of content blocks in formatted response"""
    PARAGRAPH = "paragraph"
    CODE = "code"
    HEADING = "heading"
    LIST = "list"
    QUOTE = "quote"
    BOLD = "bold"
    ITALIC = "italic"
    LINK = "link"
    TABLE = "table"


class FormattedBlock(BaseModel):
    """
    A single formatted block of content

    The LLM returns plain text. This schema represents it
    as structured blocks for rich rendering on frontend.

    Example:
    {
        "type": "code",
        "content": "def hello():\n    print('world')",
        "metadata": {"language": "python"}
    }
    """

    type: BlockType = Field(description="Type of content block")
    """Type of this block (paragraph, code, heading, etc.)"""

    content: str = Field(description="The actual content/text of this block")
    """The content of this block"""

    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional metadata (language for code, level for heading, etc.)"
    )
    """Optional metadata (e.g., language for code blocks)"""


class ResponseMetadata(BaseModel):
    """Metadata about the formatted response"""

    has_code: bool = Field(description="Whether response contains code blocks")
    code_languages: List[str] = Field(description="Programming languages found in code blocks")
    has_markdown: bool = Field(description="Whether response contains markdown syntax")
    block_count: int = Field(description="Number of formatted blocks")
    code_block_count: int = Field(description="Number of code blocks")
    character_count: int = Field(description="Total characters in response")


class RoleInfo(BaseModel):
    """Information about an available LLM role"""
    name: str = Field(description="Role name (assistant, coder, tutor, creative)")
    description: str = Field(description="What this role does")


class ConfigResponse(BaseModel):
    """
    Response containing available configuration options

    The frontend calls /api/chat/config on startup to get:
    - What roles are available
    - What temperature presets are available
    - What the defaults are
    - Message length constraints

    This lets the frontend build UI dropdowns and validate input.

    Why return config?
    - Frontend doesn't hardcode role names (easy to add new roles)
    - If defaults change, frontend automatically uses new defaults
    - Validation constraints (min/max length) come from server
    - Frontend can populate dropdown menus from this response

    Example:
    {
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
        "max_message_length": 5000,
        "api_version": "1.0.0"
    }
    """

    roles: List[RoleInfo] = Field(description="Available LLM roles with descriptions")
    """List of available roles - frontend uses this to populate dropdowns"""

    temperature_presets: Dict[str, float] = Field(description="Temperature presets mapping")
    """Available temperature presets and their values (e.g., precise: 0.2)"""

    default_temperature: float = Field(
        ge=0.0,
        le=2.0,
        description="Default temperature if user doesn't specify"
    )
    """Default temperature setting"""

    default_max_tokens: int = Field(
        ge=100,
        le=4000,
        description="Default max tokens if user doesn't specify"
    )
    """Default max tokens limit"""

    min_message_length: int = Field(
        ge=1,
        description="Minimum characters required in a message"
    )
    """Minimum characters required in message"""

    max_message_length: int = Field(
        ge=100,
        description="Maximum characters allowed in a message"
    )
    """Maximum characters allowed in message"""

    min_temperature: float = Field(
        default=0.0,
        description="Minimum temperature value allowed"
    )
    """Minimum temperature the API accepts"""

    max_temperature: float = Field(
        default=2.0,
        description="Maximum temperature value allowed"
    )
    """Maximum temperature the API accepts"""

    api_version: str = Field(
        default="1.0.0",
        description="Version of the API schema"
    )
    """Version of this API - helps frontend know what features are available"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "roles": [
                    {"name": "assistant", "description": "General helpful assistant"},
                    {"name": "coder", "description": "Programming expert"},
                    {"name": "tutor", "description": "Patient educational tutor"},
                    {"name": "creative", "description": "Creative and imaginative"}
                ],
                "temperature_presets": {
                    "precise": 0.2,
                    "balanced": 0.7,
                    "creative": 1.0
                },
                "default_temperature": 0.7,
                "default_max_tokens": 1000,
                "min_message_length": 1,
                "max_message_length": 5000,
                "min_temperature": 0.0,
                "max_temperature": 2.0,
                "api_version": "1.0.0"
            }
        }
    )


class HealthResponse(BaseModel):
    """
    Response from the health check endpoint

    Simple response indicating if the server is running.
    Used by monitoring tools and load balancers to check if API is alive.

    Example:
    {
        "status": "ok",
        "message": "Server is running",
        "timestamp": "2024-01-15T10:30:45Z"
    }
    """

    status: str = Field(
        pattern="^(ok|degraded|error)$",
        description="Server status: 'ok' (healthy), 'degraded', or 'error'"
    )
    """Server status - 'ok' means healthy, 'error' means something is wrong"""

    message: str = Field(description="Detailed status message")
    """Detailed status message"""

    timestamp: Optional[datetime] = Field(
        default=None,
        description="When this health check was performed"
    )
    """Timestamp of health check"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "ok",
                "message": "Server is running and healthy",
                "timestamp": "2024-01-15T10:30:45Z"
            }
        }
    )


class ErrorResponse(BaseModel):
    """
    Standard error response format

    All errors return this format for consistency.
    This helps frontend handle all errors the same way.

    Error codes are standardized:
    - INVALID_MESSAGE: Message fails validation (too short, too long, empty)
    - INVALID_TEMPERATURE: Temperature outside allowed range
    - INVALID_TOKENS: Max tokens outside allowed range
    - RATE_LIMIT: API rate limit exceeded
    - API_ERROR: LLM API error
    - SERVER_ERROR: Unexpected server error

    Example:
    {
        "detail": "Message cannot be empty",
        "status_code": 400,
        "error_code": "INVALID_MESSAGE",
        "timestamp": "2024-01-15T10:30:45Z"
    }
    """

    detail: str = Field(description="Human-readable error description")
    """Human-readable error message"""

    status_code: int = Field(
        ge=400,
        le=599,
        description="HTTP status code"
    )
    """HTTP status code (400-599 range)"""

    error_code: Optional[str] = Field(
        default=None,
        description="Application error code (e.g., INVALID_MESSAGE, RATE_LIMIT)"
    )
    """Application-specific error code for programmatic handling"""

    timestamp: Optional[datetime] = Field(
        default=None,
        description="When this error occurred"
    )
    """When the error occurred"""

    request_id: Optional[str] = Field(
        default=None,
        description="Unique ID for this request (for support/debugging)"
    )
    """Unique request ID for debugging - include this in support tickets"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "detail": "Message cannot be empty or contain only whitespace",
                "status_code": 400,
                "error_code": "INVALID_MESSAGE",
                "timestamp": "2024-01-15T10:30:45Z",
                "request_id": "req_12345abcde"
            }
        }
    )
