from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ResumeCreate(BaseModel):
    resume_name: str
    resume_source: Optional[str] = "HTML"
    job_description: Optional[str] = None
    notes: Optional[str] = None


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    resume_name: str
    resume_pdf: str
    resume_source: str
    job_description: Optional[str] = None
    ats_score: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
