"""
Request schemas - define what data we expect from the client

Pydantic is a Python library that helps us:
1. VALIDATE: Ensure data matches expected types and constraints
2. CONVERT: Transform JSON to Python objects automatically
3. DOCUMENT: Auto-generate API docs from schema
4. FAIL FAST: Catch errors before they reach business logic

Why this matters:
- Security: Prevents injection attacks and malformed requests
- Robustness: Catches bugs early with clear error messages
- API clarity: Frontend knows exactly what to send
- Testing: Easy to test with various invalid inputs
"""

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional
from enum import Enum


class LLMRole(str, Enum):
    """Available LLM roles"""
    ASSISTANT = "assistant"
    CODER = "coder"
    TUTOR = "tutor"
    CREATIVE = "creative"


class TemperaturePreset(str, Enum):
    """Temperature presets"""
    PRECISE = "precise"
    BALANCED = "balanced"
    CREATIVE = "creative"


class ChatRequest(BaseModel):
    """
    Request to send a message to the LLM

    This schema validates the user's request before it reaches the service layer.
    Pydantic automatically:
    1. Converts JSON to Python object
    2. Validates all fields match constraints
    3. Runs custom validators (see @field_validator below)
    4. Returns 422 error with details if validation fails

    Example:
    {
        "message": "Hello, how are you?",
        "role": "assistant",
        "temperature": 0.7,
        "max_tokens": 1000
    }
    """

    message: str = Field(
        min_length=1,
        max_length=5000,
        description="The user's message (1-5000 characters)"
    )
    """The user's message to send to the AI"""

    role: LLMRole = Field(
        default=LLMRole.ASSISTANT,
        description="The LLM role/personality: assistant, coder, tutor, or creative"
    )
    """Which role/personality to use - shapes model behavior"""

    temperature: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="Temperature (0.0=precise/deterministic, 2.0=very creative)"
    )
    """Temperature for response randomness - lower = consistent, higher = creative"""

    temperature_preset: Optional[TemperaturePreset] = Field(
        default=None,
        description="Predefined temperature preset: precise (0.2), balanced (0.7), or creative (1.0)"
    )
    """Use a preset instead of custom temperature - easier for users"""

    max_tokens: Optional[int] = Field(
        default=None,
        ge=100,
        le=4000,
        description="Maximum tokens in response (100-4000, ~4 chars = 1 token)"
    )
    """Maximum response length in tokens - controls cost and speed"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "What is Python?",
                "role": "coder",
                "temperature": 0.7,
                "max_tokens": 1000
            }
        }
    )

    @field_validator('message')
    @classmethod
    def validate_message(cls, v: str) -> str:
        """
        Custom validator for message field

        @field_validator is a Pydantic decorator that runs AFTER basic validation.
        Use it for complex validation logic that can't be expressed with Field().

        This validator:
        1. Strips whitespace from ends
        2. Checks message isn't just whitespace
        3. Returns cleaned message
        """
        # Strip leading/trailing whitespace
        cleaned = v.strip()

        # Reject if only whitespace
        if not cleaned:
            raise ValueError("Message cannot be empty or contain only whitespace")

        # Return the cleaned message
        return cleaned

    @field_validator('temperature', 'max_tokens', mode='before')
    @classmethod
    def allow_none(cls, v):
        """
        Allow None values to pass through unchanged

        In Pydantic v2, we need to explicitly handle None in validators.
        This validator runs BEFORE type checking and allows None to pass.
        """
        if v is None:
            return v
        return v


class ConfigRequest(BaseModel):
    """
    Request to update LLM configuration (for future use)

    This schema would be used by endpoints that let users change settings.
    Currently defined for future extensibility.

    Example:
    {
        "role": "coder",
        "temperature": 0.8
    }
    """

    role: Optional[LLMRole] = Field(
        default=None,
        description="New role to use"
    )

    temperature: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="New temperature (0.0-2.0)"
    )

    max_tokens: Optional[int] = Field(
        default=None,
        ge=100,
        le=4000,
        description="New max tokens"
    )

    temperature_preset: Optional[TemperaturePreset] = Field(
        default=None,
        description="Temperature preset to use"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "role": "coder",
                "temperature_preset": "balanced",
                "max_tokens": 2000
            }
        }
    )
