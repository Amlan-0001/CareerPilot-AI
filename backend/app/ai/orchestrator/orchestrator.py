from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.ai.agents.resume_parser import resume_parser_agent
from app.ai.agents.jd_analyzer import jd_analyzer_agent
from app.ai.agents.resume_optimizer import resume_optimizer_agent
from app.ai.agents.question_answer import question_answer_agent
from app.services.memory_service import memory_service
from app.schemas.memory_schema import AIMemoryResponse


class AgentOrchestrator:
    @staticmethod
    def parse_resume(resume_text: str) -> Dict[str, Any]:
        """Routes resume parsing request to ResumeParserAgent."""
        return resume_parser_agent.parse_resume_text(resume_text)

    @staticmethod
    def analyze_jd(
        db: Session,
        user_id: str,
        job_description: str,
        job_title: str = "",
        company_name: str = "",
    ) -> Dict[str, Any]:
        """Routes JD analysis request to JDAnalyzerAgent with user's AI Memory profile."""
        memory_orm = memory_service.get_or_create_memory(db, user_id)
        memory_schema = AIMemoryResponse.model_validate(memory_orm)
        memory_data = memory_schema.model_dump()

        return jd_analyzer_agent.analyze(
            job_description=job_description,
            ai_memory_data=memory_data,
            job_title=job_title,
            company_name=company_name,
        )

    @staticmethod
    def optimize_resume(
        db: Session,
        user_id: str,
        base_resume_id: str,
        job_description: str,
        target_role: str = "",
        target_company: str = "",
        preview_only: bool = False,
        custom_summary: Optional[str] = None,
        custom_bullet_points: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Routes resume optimization request to ResumeOptimizerAgent."""
        return resume_optimizer_agent.optimize(
            db,
            user_id=user_id,
            base_resume_id=base_resume_id,
            job_description=job_description,
            target_role=target_role,
            target_company=target_company,
            preview_only=preview_only,
            custom_summary=custom_summary,
            custom_bullet_points=custom_bullet_points,
        )

    @staticmethod
    def generate_answer(
        db: Session,
        user_id: str,
        question: str,
        job_description: str = "",
    ) -> Dict[str, Any]:
        """Routes application question answering request to QuestionAnswerAgent."""
        memory_orm = memory_service.get_or_create_memory(db, user_id)
        memory_schema = AIMemoryResponse.model_validate(memory_orm)
        memory_data = memory_schema.model_dump()

        return question_answer_agent.answer_question(
            question=question,
            job_description=job_description,
            ai_memory_data=memory_data,
        )


orchestrator = AgentOrchestrator()
