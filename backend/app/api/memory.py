from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.memory_schema import (
    AIMemoryResponse,
    AIMemoryUpdate,
    SkillCreate,
    SkillResponse,
    ProjectCreate,
    ProjectResponse,
    ExperienceCreate,
    ExperienceResponse,
)
from app.services.memory_service import memory_service

router = APIRouter(tags=["AI Memory"])


@router.get(
    "",
    response_model=AIMemoryResponse,
    summary="Get authenticated user's complete AI Memory profile",
)
def get_memory(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return memory_service.get_or_create_memory(db, current_user_id)


@router.put(
    "",
    response_model=AIMemoryResponse,
    summary="Update authenticated user's core AI Memory profile",
)
def update_memory(
    memory_in: AIMemoryUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return memory_service.update_memory(db, current_user_id, memory_in)


@router.post(
    "/skills",
    response_model=SkillResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a skill to user memory",
)
def add_skill(
    skill_in: SkillCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return memory_service.add_skill(db, current_user_id, skill_in)


@router.delete(
    "/skills/{skill_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a skill record from user memory",
)
def delete_skill(
    skill_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    memory_service.delete_skill(db, current_user_id, skill_id)
    return None


@router.post(
    "/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a project to user memory",
)
def add_project(
    project_in: ProjectCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return memory_service.add_project(db, current_user_id, project_in)


@router.delete(
    "/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a project record from user memory",
)
def delete_project(
    project_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    memory_service.delete_project(db, current_user_id, project_id)
    return None


@router.post(
    "/experiences",
    response_model=ExperienceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add an experience record to user memory",
)
def add_experience(
    exp_in: ExperienceCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return memory_service.add_experience(db, current_user_id, exp_in)


@router.delete(
    "/experiences/{experience_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an experience record from user memory",
)
def delete_experience(
    experience_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    memory_service.delete_experience(db, current_user_id, experience_id)
    return None
