from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ApplicationCreate(BaseModel):
    company: str
    job_role: str
    platform: Optional[str] = "Google Forms"
    resume_id: Optional[str] = None
    application_status: Optional[str] = "Applied"
    match_score: Optional[float] = None
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    job_role: Optional[str] = None
    platform: Optional[str] = None
    resume_id: Optional[str] = None
    application_status: Optional[str] = None
    match_score: Optional[float] = None
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    company: str
    job_role: str
    platform: str
    resume_id: Optional[str] = None
    application_status: str
    match_score: Optional[float] = None
    submitted_at: datetime
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
