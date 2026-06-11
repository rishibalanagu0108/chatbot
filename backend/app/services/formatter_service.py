"""
Response Formatter Service - Format LLM responses for frontend display

Why formatting matters:
1. LLMs output plain text - frontend needs structured data
2. Markdown in responses should be detected and marked
3. Code blocks need language detection for syntax highlighting
4. Lists, bold, italic need to be identified
5. Frontend can then render beautifully

This service parses the LLM response and returns structured data:
{
    "raw_text": "original response from LLM",
    "formatted_blocks": [
        {
            "type": "paragraph",
            "content": "Some text..."
        },
        {
            "type": "code",
            "language": "python",
            "content": "def hello():\n    print('world')"
        },
        {
            "type": "list",
            "items": ["item1", "item2"]
        }
    ],
    "has_code": true,
    "has_markdown": true,
    "code_languages": ["python", "javascript"]
}

Frontend can then:
- Display paragraphs as normal text
- Show code blocks with syntax highlighting
- Format lists with bullets
- Highlight bold/italic text
"""

import re
from typing import List, Dict, Any, Optional
from enum import Enum


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


class FormattedBlock:
    """Represents a single formatted block of content"""

    def __init__(self, block_type: BlockType, content: str, metadata: Optional[Dict[str, Any]] = None):
        self.type = block_type
        self.content = content
        self.metadata = metadata or {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "type": self.type.value,
            "content": self.content,
            "metadata": self.metadata if self.metadata else None,
        }


class FormatterService:
    """
    Service for formatting LLM responses

    The LLM returns plain text. This service:
    1. Detects markdown syntax
    2. Identifies code blocks and their language
    3. Parses lists, headings, quotes
    4. Creates structured blocks for frontend
    5. Provides metadata about the response
    """

    # Regex patterns for detecting markdown/special content
    CODE_BLOCK_PATTERN = r"```(\w*)\n(.*?)\n```"
    INLINE_CODE_PATTERN = r"`([^`]+)`"
    HEADING_PATTERN = r"^(#{1,6})\s+(.+)$"
    LIST_PATTERN = r"^[\s]*[-*+]\s+(.+)$"
    BOLD_PATTERN = r"\*\*(.+?)\*\*"
    ITALIC_PATTERN = r"\*(.+?)\*"
    LINK_PATTERN = r"\[(.+?)\]\((.+?)\)"
    QUOTE_PATTERN = r"^>\s+(.+)$"

    def format_response(self, response_text: str) -> Dict[str, Any]:
        """
        Format a raw LLM response into structured blocks

        Args:
            response_text: The raw response from the LLM

        Returns:
            Dictionary with:
            - raw_text: Original response
            - formatted_blocks: List of formatted blocks
            - metadata: Information about the response
                - has_code: Whether response contains code blocks
                - code_languages: Languages found in code blocks
                - has_markdown: Whether response contains markdown
                - block_count: Number of blocks
                - code_block_count: Number of code blocks
        """
        if not response_text or not response_text.strip():
            return {
                "raw_text": response_text,
                "formatted_blocks": [
                    FormattedBlock(BlockType.PARAGRAPH, "(Empty response)").to_dict()
                ],
                "metadata": {
                    "has_code": False,
                    "code_languages": [],
                    "has_markdown": False,
                    "block_count": 1,
                    "code_block_count": 0,
                }
            }

        # Parse response into blocks
        blocks = self._parse_blocks(response_text)

        # Extract metadata
        code_languages = set()
        has_code = False
        code_count = 0

        for block in blocks:
            if block.type == BlockType.CODE:
                has_code = True
                code_count += 1
                if "language" in block.metadata:
                    code_languages.add(block.metadata["language"])

        # Detect if response contains markdown
        has_markdown = self._has_markdown(response_text)

        return {
            "raw_text": response_text,
            "formatted_blocks": [block.to_dict() for block in blocks],
            "metadata": {
                "has_code": has_code,
                "code_languages": sorted(list(code_languages)),
                "has_markdown": has_markdown,
                "block_count": len(blocks),
                "code_block_count": code_count,
                "character_count": len(response_text),
            }
        }

    def _parse_blocks(self, text: str) -> List[FormattedBlock]:
        """
        Parse response text into formatted blocks

        Strategy:
        1. Split by code blocks (they're highest priority)
        2. Then parse remaining text for other markdown
        3. Default to paragraphs for plain text

        Args:
            text: The response text to parse

        Returns:
            List of FormattedBlock objects
        """
        blocks = []

        # Split by code blocks first (they have highest priority)
        parts = re.split(self.CODE_BLOCK_PATTERN, text, flags=re.MULTILINE | re.DOTALL)

        for i, part in enumerate(parts):
            # Every 3rd part is a code block (pattern: [before, lang, code, after, lang, code, ...])
            # pattern matches: ```lang\ncode\n```
            # split returns: [before, lang, code, after, lang, code, ...]

            if i % 3 == 0:  # Text before/between code blocks
                if part.strip():
                    # Parse this text section for other markdown
                    self._parse_text_section(part, blocks)
            elif i % 3 == 1:  # Language specifier
                # This is captured with the code, skip
                continue
            else:  # Code content (i % 3 == 2)
                # Get the language from previous part
                language = parts[i - 1] if i > 0 else "plaintext"
                if not language:
                    language = "plaintext"

                blocks.append(
                    FormattedBlock(
                        BlockType.CODE,
                        part.strip(),
                        {"language": language}
                    )
                )

        return blocks if blocks else [FormattedBlock(BlockType.PARAGRAPH, text)]

    def _parse_text_section(self, text: str, blocks: List[FormattedBlock]) -> None:
        """
        Parse a text section for markdown syntax

        Handles:
        - Headings (# ## ### etc.)
        - Lists (- * +)
        - Quotes (>)
        - Paragraphs (default)

        Args:
            text: Text section to parse
            blocks: List to append blocks to
        """
        lines = text.split("\n")
        current_paragraph = []

        for line in lines:
            stripped = line.strip()

            if not stripped:
                # Empty line - end current paragraph
                if current_paragraph:
                    blocks.append(
                        FormattedBlock(
                            BlockType.PARAGRAPH,
                            "\n".join(current_paragraph)
                        )
                    )
                    current_paragraph = []
                continue

            # Check for heading
            heading_match = re.match(self.HEADING_PATTERN, line)
            if heading_match:
                # Save current paragraph
                if current_paragraph:
                    blocks.append(
                        FormattedBlock(
                            BlockType.PARAGRAPH,
                            "\n".join(current_paragraph)
                        )
                    )
                    current_paragraph = []

                # Add heading
                level = len(heading_match.group(1))
                blocks.append(
                    FormattedBlock(
                        BlockType.HEADING,
                        heading_match.group(2),
                        {"level": level}
                    )
                )
                continue

            # Check for list item
            list_match = re.match(self.LIST_PATTERN, line)
            if list_match:
                # Save current paragraph
                if current_paragraph:
                    blocks.append(
                        FormattedBlock(
                            BlockType.PARAGRAPH,
                            "\n".join(current_paragraph)
                        )
                    )
                    current_paragraph = []

                # Collect consecutive list items
                items = [list_match.group(1)]
                continue

            # Check for quote
            quote_match = re.match(self.QUOTE_PATTERN, line)
            if quote_match:
                # Save current paragraph
                if current_paragraph:
                    blocks.append(
                        FormattedBlock(
                            BlockType.PARAGRAPH,
                            "\n".join(current_paragraph)
                        )
                    )
                    current_paragraph = []

                blocks.append(
                    FormattedBlock(
                        BlockType.QUOTE,
                        quote_match.group(1)
                    )
                )
                continue

            # Regular text - add to current paragraph
            current_paragraph.append(stripped)

        # Add remaining paragraph
        if current_paragraph:
            blocks.append(
                FormattedBlock(
                    BlockType.PARAGRAPH,
                    "\n".join(current_paragraph)
                )
            )

    def _has_markdown(self, text: str) -> bool:
        """
        Check if text contains markdown syntax

        Args:
            text: Text to check

        Returns:
            True if markdown is detected
        """
        patterns = [
            self.CODE_BLOCK_PATTERN,
            self.HEADING_PATTERN,
            self.BOLD_PATTERN,
            self.ITALIC_PATTERN,
            self.LINK_PATTERN,
            self.LIST_PATTERN,
            self.QUOTE_PATTERN,
        ]

        for pattern in patterns:
            if re.search(pattern, text, flags=re.MULTILINE):
                return True

        return False

    @staticmethod
    def detect_language(code: str) -> str:
        """
        Try to detect programming language from code

        Uses simple heuristics to identify language

        Args:
            code: Code snippet

        Returns:
            Language name or "plaintext"
        """
        # Common language keywords and patterns
        patterns = {
            "python": [r"def\s+\w+\(", r"import\s+", r"from\s+\w+\s+import", r"class\s+\w+:"],
            "javascript": [r"function\s+\w+\(", r"const\s+\w+\s*=", r"let\s+\w+\s*=", r"=>"],
            "typescript": [r":\s*(string|number|boolean|any)", r"interface\s+\w+", r"type\s+\w+"],
            "java": [r"public\s+(class|static|void)", r"import\s+java\."],
            "cpp": [r"#include\s*[<\"]", r"std::", r"void\s+\w+\("],
            "sql": [r"SELECT\s+", r"FROM\s+", r"WHERE\s+", r"INSERT\s+INTO"],
            "html": [r"<html|<div|<p>|<!DOCTYPE"],
            "css": [r"\.\w+\s*\{|#\w+\s*\{|\w+\s*\{"],
            "json": [r"^\s*\{|^\s*\["],
            "bash": [r"#!/bin/bash|^#!/bin/sh"],
        }

        for language, language_patterns in patterns.items():
            for pattern in language_patterns:
                if re.search(pattern, code, re.IGNORECASE | re.MULTILINE):
                    return language

        return "plaintext"
