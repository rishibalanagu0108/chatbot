"""
Logging middleware for request/response tracking

Middleware are functions that run before (or after) each request/response.
This middleware logs information about every request:
- What endpoint was called
- What method (GET, POST, etc.)
- How long the request took
- The response status code

This helps with debugging and understanding how the API is being used.
"""

import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs all requests and responses

    For each request:
    1. Records the start time
    2. Lets the request be processed
    3. Records how long it took
    4. Logs the details
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Process the request and response

        Args:
            request: The incoming HTTP request
            call_next: Function to call the next middleware/handler

        Returns:
            The HTTP response
        """
        # Record when the request started
        start_time = time.time()

        # Get request details
        method = request.method
        url = request.url.path
        client_host = request.client.host if request.client else "unknown"

        # Log the incoming request
        logger.info(f"→ {method} {url} from {client_host}")

        try:
            # Call the actual endpoint handler
            response = await call_next(request)
        except Exception as e:
            # If an error occurred, log it
            process_time = time.time() - start_time
            logger.error(f"✗ {method} {url} - Error: {str(e)} ({process_time:.3f}s)")
            raise

        # Calculate how long the request took
        process_time = time.time() - start_time

        # Log the response
        status_code = response.status_code
        # Use emoji to indicate success/failure
        status_emoji = "✓" if 200 <= status_code < 300 else "✗"
        logger.info(f"{status_emoji} {method} {url} - {status_code} ({process_time:.3f}s)")

        return response
