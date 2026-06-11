"""
Input validators

Validation is critical for security and data quality:
1. Security - prevents injection attacks and malformed requests
2. Data quality - ensures we process valid data
3. User experience - provides clear error messages
4. Performance - rejects bad data early before expensive processing
"""

from typing import Tuple, Optional
from ..config.settings import Settings


def validate_message_length(message: str) -> Tuple[bool, Optional[str]]:
    """
    Validate that a message is within acceptable length limits

    Args:
        message: The message to validate

    Returns:
        Tuple of (is_valid, error_message)
        - If valid: (True, None)
        - If invalid: (False, error_message)
    """
    # Strip whitespace from message
    stripped = message.strip()

    # Check minimum length
    if len(stripped) < Settings.MIN_MESSAGE_LENGTH:
        return False, f"Message must be at least {Settings.MIN_MESSAGE_LENGTH} character"

    # Check maximum length
    if len(stripped) > Settings.MAX_MESSAGE_LENGTH:
        return False, f"Message exceeds maximum length of {Settings.MAX_MESSAGE_LENGTH} characters"

    # Check if message is only whitespace
    if not stripped:
        return False, "Message cannot be empty or contain only whitespace"

    return True, None


def validate_api_key(api_key: str) -> Tuple[bool, Optional[str]]:
    """
    Validate that an API key is configured

    Args:
        api_key: The API key to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not api_key or not api_key.strip():
        return False, "API key is not configured. Set GOOGLE_API_KEY in .env"

    if len(api_key) < 10:
        return False, "API key appears to be invalid (too short)"

    return True, None


def validate_temperature(temperature: float) -> Tuple[bool, Optional[str]]:
    """
    Validate that temperature is within acceptable range

    Args:
        temperature: Temperature value (0.0 to 2.0)

    Returns:
        Tuple of (is_valid, error_message)
    """
    if temperature < 0.0:
        return False, "Temperature cannot be less than 0.0"

    if temperature > 2.0:
        return False, "Temperature cannot be greater than 2.0"

    return True, None


def validate_max_tokens(max_tokens: int) -> Tuple[bool, Optional[str]]:
    """
    Validate that max_tokens is within acceptable range

    Args:
        max_tokens: Maximum tokens value

    Returns:
        Tuple of (is_valid, error_message)
    """
    if max_tokens < 100:
        return False, "max_tokens must be at least 100"

    if max_tokens > 4000:
        return False, "max_tokens cannot exceed 4000"

    return True, None
