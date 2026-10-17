import os
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.ai.llm.llm_service import llm_service
from app.ai.llm.prompt_builder import prompt_builder
from app.models.resume import Resume
from app.services.resume_service import resume_service
from app.services.memory_service import memory_service
from app.utils.pdf_utils import extract_text_from_pdf_file
from app.utils.pdf_generator import generate_tailored_resume_pdf
from app.utils.helpers import generate_uuid
from app.utils.common import ensure_dir_exists, sanitize_filename


class ResumeOptimizerAgent:
    def optimize(
        self,
        db: Session,
        user_id: str,
        base_resume_id: str,
        job_description: str,
        target_role: str = "",
        target_company: str = "",
        preview_only: bool = False,
        custom_summary: Optional[str] = None,
        custom_bullet_points: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        base_resume = resume_service.get_resume_by_id(db, user_id, base_resume_id)
        resume_text = extract_text_from_pdf_file(base_resume.resume_pdf) or "Base Candidate Resume Content"
        user_memory = memory_service.get_or_create_memory(db, user_id)

        prompt = prompt_builder.load_prompt(
            "resume_optimizer.txt",
            target_role=target_role or "Target Position",
            target_company=target_company or "Target Company",
            job_description=job_description,
            resume_content=resume_text,
        )

        result = llm_service.generate_json(prompt)

        final_summary = custom_summary or result.get("tailored_summary", "")
        final_bullet_points = custom_bullet_points or result.get("tailored_bullet_points", [])
        new_resume_name = f"Optimized - {target_role or 'Target'} ({target_company or 'Company'})"

        # If preview_only is True, return AI analysis without writing PDF or saving to database
        if preview_only:
            return {
                "new_resume_id": "",
                "resume_name": new_resume_name,
                "tailored_summary": final_summary,
                "tailored_bullet_points": final_bullet_points,
                "missing_skills_or_lacks": result.get("missing_skills_or_lacks", []),
                "improvement_recommendations": result.get("improvement_recommendations", []),
                "ats_score": result.get("ats_score", 85.0),
            }

        # Otherwise, render brand new PDF document on disk & save 1 Resume DB record
        resumes_dir = os.path.join(settings.UPLOAD_DIR, "resumes")
        ensure_dir_exists(resumes_dir)

        candidate_name = user_memory.user.full_name if user_memory and user_memory.user else "Candidate"
        filename = f"{generate_uuid()}_optimized_{sanitize_filename(target_role or 'tailored')}.pdf"
        pdf_path = os.path.join(resumes_dir, filename)

        contact_info = {
            "email": user_memory.user.email if user_memory and user_memory.user else "",
            "phone": user_memory.phone or "",
            "college": user_memory.college or "",
            "linkedin_url": user_memory.linkedin_url or "",
        } if user_memory else {}

        # Render brand new PDF
        generate_tailored_resume_pdf(
            file_path=pdf_path,
            candidate_name=candidate_name,
            target_role=target_role or "Tailored Candidate",
            target_company=target_company or "",
            tailored_summary=final_summary,
            tailored_bullet_points=final_bullet_points,
            contact_info=contact_info,
        )

        # Save single versioned Resume record in DB
        new_resume = Resume(
            user_id=user_id,
            resume_name=new_resume_name,
            resume_pdf=pdf_path,
            resume_source="AI Optimization",
            job_description=job_description,
        )
        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)

        return {
            "new_resume_id": new_resume.id,
            "resume_name": new_resume.resume_name,
            "tailored_summary": final_summary,
            "tailored_bullet_points": final_bullet_points,
            "missing_skills_or_lacks": result.get("missing_skills_or_lacks", []),
            "improvement_recommendations": result.get("improvement_recommendations", []),
            "ats_score": result.get("ats_score", 85.0),
        }


resume_optimizer_agent = ResumeOptimizerAgent()
