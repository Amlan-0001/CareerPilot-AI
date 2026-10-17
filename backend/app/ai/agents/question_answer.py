from typing import Dict, Any
from fastapi import HTTPException, status
from app.ai.llm.llm_service import llm_service
from app.ai.llm.prompt_builder import prompt_builder


class QuestionAnswerAgent:
    def answer_question(
        self,
        question: str,
        job_description: str,
        ai_memory_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        if not question or not question.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question input is empty.",
            )

        skills_str = ", ".join(
            [s.get("skill_name", "") for s in ai_memory_data.get("skills", [])]
        ) or "Software engineering skills"
        exp_str = "; ".join(
            [f"{e.get('role', '')} at {e.get('company', '')}" for e in ai_memory_data.get("experiences", [])]
        ) or "Software background"
        summary_str = ai_memory_data.get("summary") or "Motivated software professional."

        prompt = prompt_builder.load_prompt(
            "question_answer.txt",
            question=question,
            job_description=job_description or "Job Opportunity",
            candidate_summary=summary_str,
            candidate_skills=skills_str,
            candidate_experiences=exp_str,
        )

        result = llm_service.generate_json(prompt)
        return result


question_answer_agent = QuestionAnswerAgent()
