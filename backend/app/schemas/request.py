"""
Request schemas - define what data we expect from the client

Pydantic BaseModel:
- Validates incoming data matches the schema
- Provides type hints for IDE autocomplete
- Auto-generates API documentation
- Converts JSON to Python objects automatically
"""

from pydantic import BaseModel, Field
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
        description="The user's message"
    )
    """The user's message to send to the AI"""

    role: LLMRole = Field(
        default=LLMRole.ASSISTANT,
        description="The LLM role/personality to use"
    )
    """Which role/personality to use"""

    temperature: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="Temperature for response generation (0.0 to 2.0)"
    )
    """Temperature for response - lower = more focused, higher = more creative"""

    temperature_preset: Optional[TemperaturePreset] = Field(
        default=None,
        description="Predefined temperature preset (precise/balanced/creative)"
    )
    """Use a preset instead of custom temperature"""

    max_tokens: Optional[int] = Field(
        default=None,
        ge=100,
        le=4000,
        description="Maximum tokens in response"
    )
    """Maximum response length in tokens"""

    class Config:
        """Pydantic configuration"""
        json_schema_extra = {
            "example": {
                "message": "What is Python?",
                "role": "coder",
                "temperature": 0.7,
                "max_tokens": 1000
            }
        }


class ConfigRequest(BaseModel):
    """
    Request to update configuration

    Example:
    {
        "role": "coder",
        "temperature": 0.8
    }
    """

    role: Optional[LLMRole] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    temperature_preset: Optional[TemperaturePreset] = None
