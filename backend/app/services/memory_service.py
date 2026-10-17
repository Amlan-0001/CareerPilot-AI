from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.ai_memory import AIMemory
from app.models.skill import Skill
from app.models.project import Project
from app.models.experience import Experience
from app.schemas.memory_schema import (
    AIMemoryCreate,
    AIMemoryUpdate,
    SkillCreate,
    ProjectCreate,
    ExperienceCreate,
)


class MemoryService:
    @staticmethod
    def get_or_create_memory(db: Session, user_id: str) -> AIMemory:
        memory = db.query(AIMemory).filter(AIMemory.user_id == user_id).first()
        if not memory:
            memory = AIMemory(user_id=user_id)
            db.add(memory)
            db.commit()
            db.refresh(memory)
        return memory

    @staticmethod
    def update_memory(db: Session, user_id: str, memory_in: AIMemoryUpdate) -> AIMemory:
        memory = MemoryService.get_or_create_memory(db, user_id)
        update_data = memory_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(memory, field, value)

        db.commit()
        db.refresh(memory)
        return memory

    @staticmethod
    def add_skill(db: Session, user_id: str, skill_in: SkillCreate) -> Skill:
        db_skill = Skill(
            user_id=user_id,
            skill_name=skill_in.skill_name,
            skill_type=skill_in.skill_type,
            proficiency=skill_in.proficiency,
        )
        db.add(db_skill)
        db.commit()
        db.refresh(db_skill)
        return db_skill

    @staticmethod
    def delete_skill(db: Session, user_id: str, skill_id: str) -> bool:
        skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user_id).first()
        if not skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill record not found",
            )
        db.delete(skill)
        db.commit()
        return True

    @staticmethod
    def add_project(db: Session, user_id: str, project_in: ProjectCreate) -> Project:
        db_project = Project(
            user_id=user_id,
            title=project_in.title,
            description=project_in.description,
            technologies=project_in.technologies,
            github_url=project_in.github_url,
            live_url=project_in.live_url,
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project

    @staticmethod
    def delete_project(db: Session, user_id: str, project_id: str) -> bool:
        project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project record not found",
            )
        db.delete(project)
        db.commit()
        return True

    @staticmethod
    def add_experience(db: Session, user_id: str, exp_in: ExperienceCreate) -> Experience:
        db_exp = Experience(
            user_id=user_id,
            company=exp_in.company,
            role=exp_in.role,
            description=exp_in.description,
            start_date=exp_in.start_date,
            end_date=exp_in.end_date,
        )
        db.add(db_exp)
        db.commit()
        db.refresh(db_exp)
        return db_exp

    @staticmethod
    def delete_experience(db: Session, user_id: str, exp_id: str) -> bool:
        exp = db.query(Experience).filter(Experience.id == exp_id, Experience.user_id == user_id).first()
        if not exp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Experience record not found",
            )
        db.delete(exp)
        db.commit()
        return True


memory_service = MemoryService()
