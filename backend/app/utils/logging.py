"""
Logging utilities

Logging is important for:
1. Debugging - see what's happening in your app
2. Monitoring - track errors and issues in production
3. Auditing - keep records of important events
4. Analytics - understand user behavior and system performance
"""

import logging
import sys
from typing import Optional

# Cache for loggers to avoid creating duplicates
_loggers: dict = {}


def setup_logging(level: str = "INFO") -> None:
    """
    Set up logging configuration for the entire application

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Create root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Remove existing handlers to avoid duplicates
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Create console handler with formatting
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)

    # Create formatter with timestamp, logger name, level, and message
    formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)

    # Add the console handler to root logger
    root_logger.addHandler(console_handler)


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Get a logger instance

    Args:
        name: Logger name (typically __name__ from the calling module)

    Returns:
        Logger instance
    """
    if name is None:
        name = "app"

    # Return cached logger if it exists
    if name in _loggers:
        return _loggers[name]

    # Create new logger
    logger = logging.getLogger(name)
    _loggers[name] = logger

    return logger
