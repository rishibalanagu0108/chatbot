"""
Configuration Settings for AI Chat Application

This module handles all application configuration including:
- Google Gemini API settings
- LLM parameters (temperature, max_tokens)
- System prompts for different roles
- CORS settings
- Logging configuration
"""

import os
from enum import Enum
from typing import Dict
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class LLMRole(str, Enum):
    """
    Enum for different LLM roles/personalities

    Each role has a different system prompt that shapes how the model behaves:
    - ASSISTANT: General-purpose helpful assistant
    - CODER: Focuses on programming and technical explanations
    - TUTOR: Educational, patient, explains concepts thoroughly
    - CREATIVE: Encourages creativity and original thinking
    """
    ASSISTANT = "assistant"
    CODER = "coder"
    TUTOR = "tutor"
    CREATIVE = "creative"


class TemperaturePreset(str, Enum):
    """
    Temperature presets for controlling LLM randomness/creativity

    Temperature controls how "creative" or "deterministic" the model is:
    - PRECISE (0.2): Very focused, consistent, good for facts and code
    - BALANCED (0.7): Default, good mix of consistency and creativity
    - CREATIVE (1.0): Very random and creative, good for brainstorming

    Why temperature matters:
    - Lower values (0.0-0.3): Model repeats same answers, focuses on most likely words
    - Higher values (0.7-1.0): Model picks more varied words, more creative
    """
    PRECISE = "precise"
    BALANCED = "balanced"
    CREATIVE = "creative"


class Settings:
    """
    Application settings loaded from environment variables

    This class centralizes all configuration, making it easy to:
    - Change settings without editing code
    - Use different settings per environment (dev, staging, prod)
    - Access settings from anywhere in the app
    """

    # =========================================================================
    # GOOGLE GEMINI API CONFIGURATION
    # =========================================================================

    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    """Google Gemini API Key - MUST be set in .env file"""

    # =========================================================================
    # LLM PARAMETER CONFIGURATION
    # =========================================================================

    # Default temperature - controls randomness/creativity (0.0 to 2.0)
    # 0.0 = deterministic, always same answer
    # 1.0 = balanced randomness
    # 2.0 = very random and creative
    DEFAULT_TEMPERATURE: float = 0.7
    """Default temperature for LLM responses"""

    # Default max tokens - controls response length
    # More tokens = longer responses (but slower and more expensive)
    # Typical: 500-2000 for reasonable response length
    DEFAULT_MAX_TOKENS: int = 1000
    """Default maximum tokens in LLM response"""

    # =========================================================================
    # SYSTEM PROMPTS FOR DIFFERENT ROLES
    # =========================================================================
    # System prompts shape the model's behavior and personality
    # The model treats these as instructions that override its base training

    SYSTEM_PROMPTS: Dict[LLMRole, str] = {
        LLMRole.ASSISTANT: """You are a helpful, friendly AI assistant.
Your goal is to provide accurate, useful information and help users with their questions.
Be concise but thorough. If you don't know something, say so honestly.""",

        LLMRole.CODER: """You are an expert programming assistant.
Help users with code, debugging, architecture, and technical explanations.
Provide code examples when helpful. Explain technical concepts clearly.
Ask clarifying questions if needed.""",

        LLMRole.TUTOR: """You are a patient, knowledgeable tutor.
Your goal is to help users learn and understand concepts deeply.
Break down complex topics into simple steps.
Ask questions to check understanding. Encourage learning with examples.""",

        LLMRole.CREATIVE: """You are a creative and imaginative AI assistant.
Help users brainstorm ideas, write stories, create content, and think outside the box.
Be encouraging and expansive in your thinking.
Don't limit yourself to practical constraints - explore creative possibilities.""",
    }
    """System prompts for each LLM role"""

    # Temperature values for each preset
    TEMPERATURE_VALUES: Dict[TemperaturePreset, float] = {
        TemperaturePreset.PRECISE: 0.2,      # Very focused, consistent
        TemperaturePreset.BALANCED: 0.7,     # Good mix
        TemperaturePreset.CREATIVE: 1.0,     # Very random and creative
    }
    """Temperature values for each preset"""

    # =========================================================================
    # LLM MODEL CONFIGURATION
    # =========================================================================

    # Model to use - can be overridden or auto-detected
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-pro")
    """Model name to use for generating responses"""

    # =========================================================================
    # SERVER CONFIGURATION
    # =========================================================================

    # CORS origins - which domains can access this API
    CORS_ORIGINS: list = [
        "http://localhost:3000",      # Standard React dev port (CRA)
        "http://localhost:5173",      # Vite dev server
        "http://127.0.0.1:5173",      # Alternative localhost
        "http://localhost:8000",      # Same machine testing
    ]
    """CORS allowed origins"""

    # Server host and port
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    """Server host address"""

    SERVER_PORT: int = int(os.getenv("SERVER_PORT", 8000))
    """Server port number"""

    # =========================================================================
    # LOGGING CONFIGURATION
    # =========================================================================

    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    """Logging level - INFO, DEBUG, WARNING, ERROR"""

    # =========================================================================
    # VALIDATION CONFIGURATION
    # =========================================================================

    # Maximum message length (characters)
    MAX_MESSAGE_LENGTH: int = 5000
    """Maximum message length allowed from user"""

    # Minimum message length (characters)
    MIN_MESSAGE_LENGTH: int = 1
    """Minimum message length required"""

    @staticmethod
    def get_system_prompt(role: LLMRole) -> str:
        """
        Get the system prompt for a specific role

        Args:
            role: The LLM role to get the prompt for

        Returns:
            The system prompt string for that role
        """
        return Settings.SYSTEM_PROMPTS.get(role, Settings.SYSTEM_PROMPTS[LLMRole.ASSISTANT])

    @staticmethod
    def get_temperature(preset: TemperaturePreset) -> float:
        """
        Get the temperature value for a preset

        Args:
            preset: The temperature preset

        Returns:
            The temperature value (0.0-2.0)
        """
        return Settings.TEMPERATURE_VALUES.get(preset, Settings.DEFAULT_TEMPERATURE)

    @staticmethod
    def validate_api_key() -> bool:
        """
        Validate that the API key is configured

        Returns:
            True if API key is set and non-empty
        """
        return bool(Settings.GOOGLE_API_KEY and Settings.GOOGLE_API_KEY.strip())


# Export settings instance for use in other modules
settings = Settings()
