import json
import re
from typing import Dict, Any


def clean_and_parse_json(llm_output: str) -> Dict[str, Any]:
    """Cleans markdown code fences, reasoning tags (<think>...</think>), and parses raw LLM output into a dictionary."""
    if not llm_output or not llm_output.strip():
        return {}

    text = llm_output.strip()

    # Remove <think>...</think> reasoning blocks (emitted by reasoning models in Groq)
    text = re.sub(r"<think>[\s\S]*?</think>", "", text, flags=re.IGNORECASE).strip()

    # Remove ```json ... ``` or ``` ... ``` wrappers
    if "```" in text:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
        if match:
            text = match.group(1).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fallback regex search for JSON object brackets
        bracket_match = re.search(r"(\{[\s\S]*\})", text)
        if bracket_match:
            try:
                return json.loads(bracket_match.group(1))
            except json.JSONDecodeError:
                pass
        return {}
