from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.ai.orchestrator.orchestrator import orchestrator
from app.services.memory_service import memory_service
from app.schemas.memory_schema import AIMemoryResponse


class ExtensionService:
    @staticmethod
    def extract_jd_and_analyze(
        db: Session,
        user_id: str,
        page_text: str,
        page_url: str = "",
        job_title: str = "",
        company_name: str = "",
    ) -> Dict[str, Any]:
        """Extracts job description from extension page text and computes candidate match score."""
        return orchestrator.analyze_jd(
            db,
            user_id=user_id,
            job_description=page_text,
            job_title=job_title,
            company_name=company_name,
        )

    @staticmethod
    def autofill_form_fields(
        db: Session,
        user_id: str,
        form_fields: List[Dict[str, Any]],
        job_description: str = "",
    ) -> List[Dict[str, Any]]:
        """Matches detected form inputs to user AI Memory profile or generates AI answers."""
        memory_orm = memory_service.get_or_create_memory(db, user_id)
        user_obj = memory_orm.user

        full_name = user_obj.full_name if user_obj else ""
        email = user_obj.email if user_obj else ""
        phone = memory_orm.phone or ""
        college = memory_orm.college or ""
        degree = memory_orm.degree or ""
        branch = memory_orm.branch or ""
        cgpa = str(memory_orm.cgpa) if memory_orm.cgpa is not None else ""
        grad_year = str(memory_orm.graduation_year) if memory_orm.graduation_year is not None else ""
        linkedin = memory_orm.linkedin_url or ""
        github = memory_orm.github_url or ""
        portfolio = memory_orm.portfolio_url or ""
        summary = memory_orm.summary or ""
        preferred_role = memory_orm.preferred_role or ""

        skills_list = [s.skill_name for s in (memory_orm.skills or [])]
        skills_str = ", ".join(skills_list) if skills_list else ""

        proposals = []
        for field in form_fields:
            field_name = (field.get("name") or "").lower()
            label = (field.get("label") or "").lower()
            field_type = (field.get("type") or "text").lower()
            options = field.get("options") or []

            value = ""
            source = "AI Memory"
            confidence = "High"
            is_resume_upload = False

            # Name matching
            if any(k in label or k in field_name for k in ["full name", "your name", "candidate name", "first name", "name"]):
                value = full_name
                source = "AI Memory" if value else "Not Found"
                confidence = "High" if value else "Low"

            # Email matching
            elif any(k in label or k in field_name for k in ["email", "e-mail", "mail"]):
                value = email
                source = "AI Memory" if value else "Not Found"
                confidence = "High" if value else "Low"

            # Phone matching
            elif any(k in label or k in field_name for k in ["phone", "mobile", "contact", "number"]):
                value = phone
                source = "AI Memory" if value else "Not Found"
                confidence = "High" if value else "Low"

            # College / University matching
            elif any(k in label or k in field_name for k in ["college", "university", "school", "institute"]):
                value = college
                source = "AI Memory" if value else "Not Found"
                confidence = "High" if value else "Low"

            # Degree matching
            elif any(k in label or k in field_name for k in ["degree", "qualification"]):
                value = degree
                source = "AI Memory" if value else "Not Found"
                confidence = "High" if value else "Low"

            # Branch / Major matching
            elif any(k in label or k in field_name for k in ["branch", "stream", "department", "major", "field of study"]):
                value = branch or degree
                source = "AI Memory" if value else "Not Found"
                confidence = "High" if value else "Low"

            # CGPA / GPA matching
            elif any(k in label or k in field_name for k in ["cgpa", "gpa", "score", "marks"]):
                value = cgpa
                source = "AI Memory" if value else "Not Found"
                confidence = "High" if value else "Low"

            # Graduation year
            elif any(k in label or k in field_name for k in ["graduat", "year", "passout"]):
                value = grad_year
                source = "AI Memory" if value else "Not Found"
                confidence = "High" if value else "Low"

            # Domain / Role / Interest / Choice matching
            elif any(k in label or k in field_name for k in ["domain", "working domain", "preferred role", "position", "field"]):
                value = preferred_role or (skills_list[0] if skills_list else "")
                if options:
                    matched_opt = ExtensionService._find_best_option_match(value or "AI / ML", skills_list, options)
                    if matched_opt:
                        value = matched_opt
                source = "AI Memory" if value else "Not Found"
                confidence = "Medium" if value else "Low"

            # Skills matching
            elif any(k in label or k in field_name for k in ["skill", "technolog", "stack"]):
                value = skills_str
                source = "AI Memory" if value else "Not Found"
                confidence = "High" if value else "Low"

            # LinkedIn matching
            elif "linkedin" in label or "linkedin" in field_name:
                value = linkedin
                source = "AI Memory" if value else "Not Found"
                confidence = "High" if value else "Low"

            # GitHub matching
            elif "github" in label or "github" in field_name:
                value = github
                source = "AI Memory" if value else "Not Found"
                confidence = "High" if value else "Low"

            # Portfolio / Website matching
            elif any(k in label or k in field_name for k in ["portfolio", "website", "url", "link"]):
                value = portfolio
                source = "AI Memory" if value else "Not Found"
                confidence = "High" if value else "Low"

            # Resume upload keyword detection
            elif any(k in label or k in field_name for k in ["resume", "cv", "upload"]):
                value = "Master Resume.pdf"
                source = "Resume Memory"
                confidence = "High"
                is_resume_upload = True

            # Summary / Bio matching
            elif any(k in label or k in field_name for k in ["summary", "about", "bio", "introduction"]):
                value = summary
                source = "AI Memory" if value else "Not Found"
                confidence = "High" if value else "Low"

            # Open question AI answering
            elif field_type in ["textarea"] or any(k in label for k in ["why", "describe", "experience", "interest", "tell us"]):
                ans_data = orchestrator.generate_answer(
                    db, user_id=user_id, question=field.get("label") or label or field_name, job_description=job_description
                )
                value = ans_data.get("answer", "")
                source = "AI Q&A Agent"
                confidence = "Medium" if value else "Low"

            else:
                source = "Not Found"
                confidence = "Low"

            proposals.append(
                {
                    "field_id": field.get("id"),
                    "name": field.get("name"),
                    "label": field.get("label") or "Question",
                    "type": field_type,
                    "options": options,
                    "proposed_value": value,
                    "source": source,
                    "confidence": confidence,
                    "is_resume_upload": is_resume_upload,
                }
            )

        return proposals

    @staticmethod
    def _find_best_option_match(role: str, skills: List[str], options: List[str]) -> str:
        role_lower = role.lower()
        skills_lower = [s.lower() for s in skills]

        for opt in options:
            opt_lower = opt.lower()
            if any(k in opt_lower for k in role_lower.split()) or any(s in opt_lower for s in skills_lower):
                return opt
        return options[0] if options else ""


extension_service = ExtensionService()
