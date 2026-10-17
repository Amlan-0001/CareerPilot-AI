from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.extension_schema import (
    ExtractJDRequest,
    ExtractJDResponse,
    FillFormRequest,
    FillFormResponse,
)
from app.services.extension_service import extension_service

router = APIRouter(tags=["Chrome Extension Bridge"])


@router.post(
    "/extract-jd",
    response_model=ExtractJDResponse,
    summary="Extract job description from browser page and analyze candidate match",
)
def extract_jd(
    req: ExtractJDRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    analysis = extension_service.extract_jd_and_analyze(
        db,
        user_id=current_user_id,
        page_text=req.page_text,
        page_url=req.page_url or "",
        job_title=req.job_title or "",
        company_name=req.company_name or "",
    )
    return {
        "job_title": req.job_title or "Extracted Position",
        "company_name": req.company_name or "Company",
        "job_description": req.page_text[:1000],
        "analysis": analysis,
    }


@router.post(
    "/fill-form",
    response_model=FillFormResponse,
    summary="Intelligently match application form inputs to candidate AI Memory & generate answers",
)
def fill_form(
    req: FillFormRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    autofilled = extension_service.autofill_form_fields(
        db,
        user_id=current_user_id,
        form_fields=[f.model_dump() for f in req.fields],
        job_description=req.job_description or "",
    )
    return {"fields": autofilled}
