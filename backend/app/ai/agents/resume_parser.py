from typing import Dict, Any
from fastapi import HTTPException, status
from app.ai.llm.llm_service import llm_service
from app.ai.llm.prompt_builder import prompt_builder


class ResumeParserAgent:
    def parse_resume_text(self, resume_text: str) -> Dict[str, Any]:
        # Handle scanned/empty PDF text gracefully by providing placeholder context to LLM
        text_to_parse = (
            resume_text.strip()
            if (resume_text and resume_text.strip())
            else "Uploaded Candidate Resume PDF Document"
        )

        prompt = prompt_builder.load_prompt("resume_parser.txt", resume_text=text_to_parse)
        result = llm_service.generate_json(prompt)
        return result


resume_parser_agent = ResumeParserAgent()
