from typing import Dict, Any
from fastapi import HTTPException, status
from app.ai.llm.llm_service import llm_service
from app.ai.llm.prompt_builder import prompt_builder


class JDAnalyzerAgent:
    def analyze(
        self,
        job_description: str,
        ai_memory_data: Dict[str, Any],
        job_title: str = "",
        company_name: str = "",
    ) -> Dict[str, Any]:
        if not job_description or not job_description.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job description text is empty.",
            )

        skills_str = ", ".join(
            [s.get("skill_name", "") for s in ai_memory_data.get("skills", [])]
        ) or "None listed"
        projects_str = "; ".join(
            [f"{p.get('title', '')}: {p.get('technologies', '')}" for p in ai_memory_data.get("projects", [])]
        ) or "None listed"
        exp_str = "; ".join(
            [f"{e.get('role', '')} at {e.get('company', '')}" for e in ai_memory_data.get("experiences", [])]
        ) if ai_memory_data.get("experiences") else "None listed"
        summary_str = ai_memory_data.get("summary") or "Software developer profile."

        prompt = prompt_builder.load_prompt(
            "jd_analysis.txt",
            job_title=job_title or "Position",
            company_name=company_name or "Company",
            job_description=job_description,
            candidate_summary=summary_str,
            candidate_skills=skills_str,
            candidate_projects=projects_str,
            candidate_experiences=exp_str,
        )

        result = llm_service.generate_json(prompt)
        return result


jd_analyzer_agent = JDAnalyzerAgent()
