from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.agent_schema import (
    ParseResumeRequest,
    ParseResumeResponse,
    AnalyzeJDRequest,
    AnalyzeJDResponse,
    OptimizeResumeRequest,
    OptimizeResumeResponse,
    QuestionAnswerRequest,
    QuestionAnswerResponse,
)
from app.services.resume_service import resume_service
from app.ai.orchestrator.orchestrator import orchestrator

router = APIRouter(tags=["AI Agents"])


@router.post(
    "/parse-resume",
    response_model=ParseResumeResponse,
    summary="Invoke Resume Parser Agent to parse PDF resume and update AI Memory",
)
def parse_resume(
    req: ParseResumeRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    result = resume_service.parse_resume_and_update_memory(
        db, user_id=current_user_id, resume_id=req.resume_id
    )
    return result


@router.post(
    "/analyze-jd",
    response_model=AnalyzeJDResponse,
    summary="Invoke JD Analyzer Agent to analyze Job Description against AI Memory",
)
def analyze_jd(
    req: AnalyzeJDRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    result = orchestrator.analyze_jd(
        db,
        user_id=current_user_id,
        job_description=req.job_description,
        job_title=req.job_title or "",
        company_name=req.company_name or "",
    )
    return result


@router.post(
    "/optimize-resume",
    response_model=OptimizeResumeResponse,
    summary="Invoke Resume Optimizer Agent to generate tailored resume version",
)
def optimize_resume(
    req: OptimizeResumeRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    result = orchestrator.optimize_resume(
        db,
        user_id=current_user_id,
        base_resume_id=req.resume_id,
        job_description=req.job_description,
        target_role=req.target_role or "",
        target_company=req.target_company or "",
        preview_only=req.preview_only or False,
        custom_summary=req.custom_summary,
        custom_bullet_points=req.custom_bullet_points,
    )
    return result


@router.post(
    "/generate-answer",
    response_model=QuestionAnswerResponse,
    summary="Invoke Question Answer Agent to generate response for application question",
)
def generate_answer(
    req: QuestionAnswerRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    result = orchestrator.generate_answer(
        db,
        user_id=current_user_id,
        question=req.question,
        job_description=req.job_description or "",
    )
    return result
