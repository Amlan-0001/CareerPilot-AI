from typing import Optional, List, Dict, Any
from pydantic import BaseModel


# Resume Parser Agent
class ParseResumeRequest(BaseModel):
    resume_id: str


class ParseResumeResponse(BaseModel):
    status: str
    parsed_data: Dict[str, Any]
    memory_updated: bool = True


# JD Analyzer Agent
class AnalyzeJDRequest(BaseModel):
    job_description: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None


class AnalyzeJDResponse(BaseModel):
    match_score: float
    key_skills: List[str]
    missing_skills: List[str]
    summary: str
    recommendations: List[str]


# Resume Optimizer Agent
class OptimizeResumeRequest(BaseModel):
    resume_id: str
    job_description: str
    target_role: Optional[str] = None
    target_company: Optional[str] = None
    preview_only: Optional[bool] = False
    # Optional human-in-the-loop custom edits
    custom_summary: Optional[str] = None
    custom_bullet_points: Optional[List[str]] = None


class OptimizeResumeResponse(BaseModel):
    new_resume_id: Optional[str] = None
    resume_name: str
    tailored_summary: Optional[str] = None
    tailored_bullet_points: Optional[List[str]] = None
    missing_skills_or_lacks: Optional[List[str]] = None
    improvement_recommendations: Optional[List[str]] = None
    ats_score: float


# Question Answer Agent
class QuestionAnswerRequest(BaseModel):
    question: str
    job_description: Optional[str] = None
    field_context: Optional[str] = None


class QuestionAnswerResponse(BaseModel):
    answer: str
    confidence_score: Optional[float] = 0.90


# Alias for backward compatibility
GenerateAnswerRequest = QuestionAnswerRequest
GenerateAnswerResponse = QuestionAnswerResponse
