import os
import shutil
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from app.core.config import settings
from app.models.resume import Resume
from app.models.application import Application
from app.services.memory_service import memory_service
from app.schemas.memory_schema import AIMemoryUpdate, SkillCreate, ProjectCreate, ExperienceCreate
from app.utils.helpers import generate_uuid
from app.utils.common import ensure_dir_exists, sanitize_filename
from app.utils.pdf_utils import extract_text_from_pdf_file
from app.ai.agents.resume_parser import resume_parser_agent


class ResumeService:
    @staticmethod
    def upload_resume(
        db: Session, user_id: str, file: UploadFile, resume_name: str
    ) -> Resume:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are supported for resume upload.",
            )

        # Storage directory: app/uploads/resumes
        resumes_dir = os.path.join(settings.UPLOAD_DIR, "resumes")
        ensure_dir_exists(resumes_dir)

        filename_uuid = f"{generate_uuid()}_{sanitize_filename(file.filename)}"
        file_path = os.path.join(resumes_dir, filename_uuid)

        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Create new versioned Resume record
        resume = Resume(
            user_id=user_id,
            resume_name=resume_name or file.filename,
            resume_pdf=file_path,
            resume_source="PDF Upload",
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
        return resume

    @staticmethod
    def get_user_resumes(db: Session, user_id: str) -> List[Resume]:
        return db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.created_at.desc()).all()

    @staticmethod
    def get_resume_by_id(db: Session, user_id: str, resume_id: str) -> Resume:
        resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user_id).first()
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume record not found",
            )
        return resume

    @staticmethod
    def get_resume_content_details(db: Session, user_id: str, resume_id: str) -> dict:
        resume = ResumeService.get_resume_by_id(db, user_id, resume_id)
        extracted_text = extract_text_from_pdf_file(resume.resume_pdf) if (resume.resume_pdf and os.path.exists(resume.resume_pdf)) else ""
        return {
            "id": resume.id,
            "resume_name": resume.resume_name,
            "resume_source": resume.resume_source,
            "job_description": resume.job_description,
            "created_at": resume.created_at,
            "extracted_text": extracted_text or "PDF text contents available for AI Agent processing.",
        }

    @staticmethod
    def delete_resume(db: Session, user_id: str, resume_id: str) -> bool:
        resume = ResumeService.get_resume_by_id(db, user_id, resume_id)
        
        # Unlink any applications referencing this resume
        db.query(Application).filter(Application.resume_id == resume_id).update({"resume_id": None})
        
        if resume.resume_pdf and os.path.exists(resume.resume_pdf):
            try:
                os.remove(resume.resume_pdf)
            except Exception:
                pass
        
        db.delete(resume)
        db.commit()
        return True

    @staticmethod
    def parse_resume_and_update_memory(
        db: Session, user_id: str, resume_id: str
    ) -> dict:
        resume = ResumeService.get_resume_by_id(db, user_id, resume_id)
        
        # Extract text from stored PDF file
        resume_text = extract_text_from_pdf_file(resume.resume_pdf) if (resume.resume_pdf and os.path.exists(resume.resume_pdf)) else ""
        parsed_data = resume_parser_agent.parse_resume_text(resume_text)

        # Update core AI memory fields if present
        memory_update = AIMemoryUpdate(
            phone=parsed_data.get("phone") or None,
            address=parsed_data.get("address") or None,
            college=parsed_data.get("college") or None,
            degree=parsed_data.get("degree") or None,
            branch=parsed_data.get("branch") or None,
            cgpa=parsed_data.get("cgpa") or None,
            graduation_year=parsed_data.get("graduation_year") or None,
            linkedin_url=parsed_data.get("linkedin_url") or None,
            github_url=parsed_data.get("github_url") or None,
            portfolio_url=parsed_data.get("portfolio_url") or None,
            summary=parsed_data.get("summary") or None,
        )
        memory_service.update_memory(db, user_id, memory_update)

        # Sync skills
        for sk in parsed_data.get("skills", []):
            try:
                memory_service.add_skill(
                    db,
                    user_id,
                    SkillCreate(
                        skill_name=sk.get("skill_name", "Skill"),
                        skill_type=sk.get("skill_type", "Programming"),
                        proficiency=sk.get("proficiency", 3),
                    ),
                )
            except Exception:
                pass

        # Sync projects
        for pr in parsed_data.get("projects", []):
            try:
                memory_service.add_project(
                    db,
                    user_id,
                    ProjectCreate(
                        title=pr.get("title", "Project"),
                        description=pr.get("description", ""),
                        technologies=pr.get("technologies", ""),
                        github_url=pr.get("github_url") or None,
                        live_url=pr.get("live_url") or None,
                    ),
                )
            except Exception:
                pass

        # Sync experiences
        for ex in parsed_data.get("experiences", []):
            try:
                memory_service.add_experience(
                    db,
                    user_id,
                    ExperienceCreate(
                        company=ex.get("company", "Company"),
                        role=ex.get("role", "Role"),
                        description=ex.get("description", ""),
                        start_date=ex.get("start_date", "2025-01-01"),
                        end_date=ex.get("end_date") or None,
                    ),
                )
            except Exception:
                pass

        return {
            "status": "success",
            "parsed_data": parsed_data,
            "memory_updated": True,
        }


resume_service = ResumeService()
