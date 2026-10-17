import os
from typing import List, Optional
from fastapi import APIRouter, Depends, status, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.resume_schema import ResumeResponse
from app.services.resume_service import resume_service

router = APIRouter(tags=["Resumes"])


@router.post(
    "/upload",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a new resume PDF version",
)
def upload_resume(
    file: UploadFile = File(...),
    resume_name: Optional[str] = Form(None),
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return resume_service.upload_resume(
        db, user_id=current_user_id, file=file, resume_name=resume_name or file.filename
    )


@router.get(
    "",
    response_model=List[ResumeResponse],
    summary="List all resume versions belonging to authenticated user",
)
def list_resumes(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return resume_service.get_user_resumes(db, current_user_id)


@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
    summary="Get details of a specific resume version",
)
def get_resume(
    resume_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return resume_service.get_resume_by_id(db, current_user_id, resume_id)


@router.get(
    "/{resume_id}/download",
    summary="View or download raw PDF file for specified resume",
)
def download_resume(
    resume_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    resume = resume_service.get_resume_by_id(db, current_user_id, resume_id)
    if not resume.resume_pdf or not os.path.exists(resume.resume_pdf):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="PDF file resource not found"
        )
    return FileResponse(
        resume.resume_pdf,
        media_type="application/pdf",
        filename=f"{resume.resume_name}.pdf",
    )


@router.get(
    "/{resume_id}/content",
    summary="Get extracted text content and AI details for specified resume",
)
def get_resume_content(
    resume_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return resume_service.get_resume_content_details(db, current_user_id, resume_id)


@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a resume version",
)
def delete_resume(
    resume_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    resume_service.delete_resume(db, current_user_id, resume_id)
    return None
