"""
LLM Configuration Model

This module defines data models for LLM configurations.
Models are Python classes that represent data structures in our application.
Using models (like Pydantic BaseModel) provides:
1. Type checking - ensures data is the right type
2. Validation - ensures data meets requirements
3. Documentation - clear structure of what data we work with
4. Auto-documentation - can generate API docs automatically
"""

from typing import Optional, List
from enum import Enum


class LLMRole(str, Enum):
    """Available LLM roles - shape model behavior"""
    ASSISTANT = "assistant"
    CODER = "coder"
    TUTOR = "tutor"
    CREATIVE = "creative"


class TemperaturePreset(str, Enum):
    """Temperature presets for controlling creativity/randomness"""
    PRECISE = "precise"
    BALANCED = "balanced"
    CREATIVE = "creative"


class LLMConfig:
    """
    Configuration for LLM generation

    This holds all the parameters that control how the LLM generates responses:
    - role: Which personality/system prompt to use
    - temperature: How random/creative the output should be
    - max_tokens: Maximum length of response
    """

    def __init__(
        self,
        role: LLMRole = LLMRole.ASSISTANT,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        temperature_preset: Optional[TemperaturePreset] = None
    ):
        self.role = role
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.temperature_preset = temperature_preset

    def to_dict(self):
        """Convert config to dictionary"""
        return {
            "role": self.role.value,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "temperature_preset": self.temperature_preset.value if self.temperature_preset else None
        }
