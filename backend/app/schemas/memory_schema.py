from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# Skills Schemas
class SkillCreate(BaseModel):
    skill_name: str
    skill_type: str  # Programming, Framework, Tool, Soft Skill
    proficiency: int = 3  # 1-5


class SkillResponse(SkillCreate):
    id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Projects Schemas
class ProjectCreate(BaseModel):
    title: str
    description: str
    technologies: str
    github_url: Optional[str] = None
    live_url: Optional[str] = None


class ProjectResponse(ProjectCreate):
    id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Experiences Schemas
class ExperienceCreate(BaseModel):
    company: str
    role: str
    description: str
    start_date: str
    end_date: Optional[str] = None


class ExperienceResponse(ExperienceCreate):
    id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# AI Memory Base Schemas
class AIMemoryCreate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[float] = None
    graduation_year: Optional[int] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = None
    preferred_role: Optional[str] = None
    preferred_location: Optional[str] = None


class AIMemoryUpdate(AIMemoryCreate):
    pass


class AIMemoryResponse(AIMemoryCreate):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    skills: List[SkillResponse] = []
    projects: List[ProjectResponse] = []
    experiences: List[ExperienceResponse] = []

    model_config = ConfigDict(from_attributes=True)
