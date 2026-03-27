"""Input sanitization utilities for user-provided text."""

import re


# Control characters except newline, carriage return, tab
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def sanitize_user_input(text: str, max_length: int = 2000) -> str:
    """Clean and truncate user-provided text.

    - Truncates to max_length
    - Strips null bytes and control characters (preserves newlines/tabs)
    - Strips leading/trailing whitespace
    """
    if not text:
        return ""
    # Remove control characters
    cleaned = _CONTROL_CHARS.sub("", text)
    # Truncate
    cleaned = cleaned[:max_length]
    return cleaned.strip()


def wrap_user_content(text: str, tag: str = "user_provided_context", max_length: int = 2000) -> str:
    """Sanitize text and wrap in XML-style delimiters for LLM prompt safety."""
    sanitized = sanitize_user_input(text, max_length)
    if not sanitized:
        return ""
    return f"<{tag}>\n{sanitized}\n</{tag}>"
