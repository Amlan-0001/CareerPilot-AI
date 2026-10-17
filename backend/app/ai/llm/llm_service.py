import json
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from groq import Groq
from app.core.config import settings
from app.core.logging import logger
from app.ai.llm.response_parser import clean_and_parse_json


class LLMService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
                self.client = None
        else:
            self.client = None
            logger.warning("GROQ_API_KEY is not configured in backend .env.")

    def _ensure_client(self):
        # Refresh API key dynamically if configured at runtime
        if not self.client and settings.GROQ_API_KEY:
            self.api_key = settings.GROQ_API_KEY
            self.client = Groq(api_key=self.api_key)

        if not self.client or not settings.GROQ_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Groq LLM Service Unavailable. Please configure GROQ_API_KEY in backend .env file.",
            )

    def generate_text(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> str:
        self._ensure_client()
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.2,
            )
            return chat_completion.choices[0].message.content or ""
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Groq LLM Service API Request Failed: {str(e)}",
            )

    def generate_json(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        text = self.generate_text(prompt, system_prompt)
        parsed = clean_and_parse_json(text)
        if not parsed:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to parse structured JSON response from Groq LLM Service.",
            )
        return parsed


llm_service = LLMService()
