"""
LLM Service - Business logic for interacting with Google Gemini API

The service layer is a design pattern that:
1. Encapsulates business logic (how to use the LLM)
2. Separates concerns (API endpoints don't know API details)
3. Makes testing easier (can mock the service)
4. Makes code reusable (multiple endpoints can use same service)

This service handles:
- Configuring the LLM model
- Sending messages to the API
- Managing system prompts and roles
- Formatting responses
- Error handling and logging
"""

import logging
from typing import Optional, Tuple
from ..config.settings import Settings, LLMRole, TemperaturePreset
from ..utils.validators import validate_api_key, validate_message_length
from ..models.llm_config import LLMConfig
import google.generativeai as genai

logger = logging.getLogger(__name__)


class LLMService:
    """
    Service for managing LLM operations

    This class encapsulates all logic for interacting with Google Gemini API.
    Benefits:
    - Single responsibility: only handles LLM operations
    - Easy to test: can be tested independently
    - Reusable: any part of the app can use this service
    - Maintainable: all LLM logic in one place
    """

    def __init__(self):
        """Initialize the LLM service"""
        # Validate API key exists
        is_valid, error = validate_api_key(Settings.GOOGLE_API_KEY)
        if not is_valid:
            logger.error(f"API Key validation failed: {error}")
            raise ValueError(error)

        # Configure the Google Generative AI library
        # This tells the SDK which API key to use for requests
        genai.configure(api_key=Settings.GOOGLE_API_KEY)

        # Initialize the model
        # This is the actual model we'll use for generation
        self._model = None
        self._initialize_model()

    def _initialize_model(self) -> None:
        """
        Initialize the LLM model

        Why a separate method?
        - Model initialization can fail (API issues, permissions, etc.)
        - We want clear error handling
        - We might need to reinitialize later
        """
        try:
            # Try to list available models to find the best one
            logger.info("Attempting to list available models...")
            available_models = genai.list_models()

            # Find first model that supports generateContent
            model_name = None
            for model in available_models:
                if "generateContent" in model.supported_generation_methods:
                    model_name = model.name
                    logger.info(f"Found supported model: {model_name}")
                    break

            # Use found model or fallback to default
            if model_name:
                # Remove "models/" prefix if present (API returns "models/gemini-pro")
                if model_name.startswith("models/"):
                    model_name = model_name.replace("models/", "")
                self._model = genai.GenerativeModel(model_name)
            else:
                # Fallback to known model if listing fails
                logger.warning("No supported model found, using fallback: gemini-pro")
                self._model = genai.GenerativeModel("gemini-pro")

        except Exception as e:
            # If listing fails entirely, use fallback
            logger.warning(f"Could not list models ({str(e)}), using fallback: gemini-pro")
            self._model = genai.GenerativeModel("gemini-pro")

    async def generate_response(
        self,
        message: str,
        role: LLMRole = LLMRole.ASSISTANT,
        temperature: Optional[float] = None,
        temperature_preset: Optional[TemperaturePreset] = None,
        max_tokens: Optional[int] = None,
    ) -> Tuple[str, dict]:
        """
        Generate a response from the LLM

        Args:
            message: User's input message
            role: Which system prompt/personality to use
            temperature: How random/creative (0.0-2.0)
            temperature_preset: Use a preset instead of custom temperature
            max_tokens: Maximum response length

        Returns:
            Tuple of (response_text, metadata)

        Why this is a separate method:
        - All response generation logic is in one place
        - Easy to modify behavior (add caching, retry logic, etc.)
        - Easy to test
        - Handles all the complexity of the Gemini API
        """
        # Validate input message
        is_valid, error = validate_message_length(message)
        if not is_valid:
            logger.warning(f"Message validation failed: {error}")
            raise ValueError(error)

        # Determine temperature to use
        final_temperature = temperature
        if temperature_preset:
            final_temperature = Settings.get_temperature(temperature_preset)
            logger.info(f"Using temperature preset '{temperature_preset.value}': {final_temperature}")
        elif temperature is None:
            final_temperature = Settings.DEFAULT_TEMPERATURE

        # Determine max_tokens to use
        final_max_tokens = max_tokens or Settings.DEFAULT_MAX_TOKENS

        # Get the system prompt for this role
        system_prompt = Settings.get_system_prompt(role)

        # Log what we're about to do
        logger.info(
            f"Generating response | "
            f"Role: {role.value} | "
            f"Temperature: {final_temperature} | "
            f"Max tokens: {final_max_tokens}"
        )

        try:
            # Create the prompt with system message and user message
            # Format: [System prompt]\n\n[User message]
            full_prompt = f"{system_prompt}\n\n{message}"

            # Call the Gemini API to generate content
            # The GenerativeModel.generate_content() method:
            # 1. Sends the prompt to Google's servers
            # 2. Processes it through the model
            # 3. Returns a response object
            response = self._model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=final_temperature,
                    max_output_tokens=final_max_tokens,
                )
            )

            # Extract the response text
            if not response or not response.text:
                logger.warning("LLM returned empty response")
                raise ValueError("LLM returned an empty response")

            response_text = response.text
            logger.info(f"Successfully generated response ({len(response_text)} chars)")

            # Estimate token count
            # Note: This is an estimate, actual token count may vary
            estimated_tokens = self._estimate_tokens(response_text)

            # Prepare metadata about this response
            metadata = {
                "role_used": role.value,
                "temperature_used": final_temperature,
                "max_tokens_used": final_max_tokens,
                "tokens_estimated": estimated_tokens,
                "model_used": str(self._model.model_name) if self._model else "unknown",
            }

            return response_text, metadata

        except ValueError as e:
            # Re-raise validation errors
            logger.error(f"Validation error: {str(e)}")
            raise
        except Exception as e:
            # Catch any other errors from the API
            error_str = str(e)
            logger.error(f"LLM API error: {error_str}")

            # Provide helpful error messages based on error type
            if "429" in error_str or "quota" in error_str.lower():
                raise ValueError("API rate limit reached. Please try again in a moment.")
            elif "not found" in error_str.lower() or "not supported" in error_str.lower():
                raise ValueError("Model is not available. Please try again later.")
            elif "permission" in error_str.lower() or "auth" in error_str.lower():
                raise ValueError("API authentication failed. Check your API key.")
            else:
                raise ValueError(f"Failed to generate response: {error_str[:100]}")

    def _estimate_tokens(self, text: str) -> int:
        """
        Estimate token count for a text

        Token estimation logic:
        - Most tokens are roughly 4 characters for English
        - This is a rough estimate; actual count may vary
        - Used for UI display and cost estimation

        Args:
            text: Text to estimate tokens for

        Returns:
            Estimated token count
        """
        # Simple estimate: ~4 chars per token
        # More accurate methods exist but require API calls
        return max(1, len(text) // 4)

    def get_available_roles(self) -> list:
        """
        Get list of available roles

        Returns:
            List of available role names
        """
        return [role.value for role in LLMRole]

    def get_available_temperature_presets(self) -> dict:
        """
        Get available temperature presets

        Returns:
            Dictionary of preset names to temperature values
        """
        return {
            preset.value: Settings.get_temperature(preset)
            for preset in TemperaturePreset
        }
