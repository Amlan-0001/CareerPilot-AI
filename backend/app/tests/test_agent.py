import io
import pytest
from unittest.mock import patch
from app.ai.llm.llm_service import llm_service
from app.core.config import settings


def test_jd_analyzer_agent_endpoint(client):
    # 1. Register & login test user
    email = "agentuser@example.com"
    password = "AgentPassword123!"
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Agent User", "email": email, "password": password},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Add skills to user AI memory
    client.post(
        "/api/v1/memory/skills",
        headers=headers,
        json={"skill_name": "Python", "skill_type": "Programming", "proficiency": 5},
    )

    # Mock llm_service.generate_json
    mock_response = {
        "match_score": 88.5,
        "key_skills": ["Python", "FastAPI", "PostgreSQL"],
        "missing_skills": ["Docker"],
        "summary": "Strong technical alignment with backend requirements.",
        "recommendations": ["Highlight FastAPI API experience in summary."],
    }

    with patch.object(llm_service, "generate_json", return_value=mock_response):
        analyze_res = client.post(
            "/api/v1/agent/analyze-jd",
            headers=headers,
            json={
                "job_description": "We are looking for a Senior Backend Engineer proficient in Python and FastAPI.",
                "job_title": "Backend Engineer",
                "company_name": "Tech Corp",
            },
        )

        assert analyze_res.status_code == 200
        analysis = analyze_res.json()
        assert analysis["match_score"] == 88.5
        assert "Python" in analysis["key_skills"]
        assert len(analysis["recommendations"]) > 0


def test_unconfigured_groq_key_returns_http_503(client):
    # Register & login test user
    email = "unconfigured@example.com"
    password = "Password123!"
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Unconfigured User", "email": email, "password": password},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Force GROQ_API_KEY to None
    with patch.object(settings, "GROQ_API_KEY", None), patch.object(llm_service, "client", None):
        res = client.post(
            "/api/v1/agent/analyze-jd",
            headers=headers,
            json={"job_description": "Test job description"},
        )
        assert res.status_code == 503
        assert "Groq LLM Service Unavailable" in res.json()["detail"]


def test_resume_parser_agent_endpoint(client):
    # 1. Register & login test user
    email = "parseruser@example.com"
    password = "ParserPassword123!"
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Parser User", "email": email, "password": password},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload PDF resume
    pdf_content = (
        b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj "
        b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj "
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
        b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000102 00000 n\n"
        b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n"
    )
    files = {"file": ("parser_resume.pdf", io.BytesIO(pdf_content), "application/pdf")}
    upload_res = client.post(
        "/api/v1/resumes/upload",
        headers=headers,
        files=files,
        data={"resume_name": "Parser Resume"},
    )
    assert upload_res.status_code == 201
    resume_id = upload_res.json()["id"]

    # Mock llm_service.generate_json
    mock_parser_response = {
        "full_name": "Parsed Candidate",
        "phone": "+1555000111",
        "college": "MIT",
        "degree": "B.S. CS",
        "summary": "Full Stack AI Developer",
        "skills": [{"skill_name": "Python", "skill_type": "Programming", "proficiency": 5}],
        "projects": [],
        "experiences": [],
    }

    with patch.object(llm_service, "generate_json", return_value=mock_parser_response):
        parse_res = client.post(
            "/api/v1/agent/parse-resume",
            headers=headers,
            json={"resume_id": resume_id},
        )
        assert parse_res.status_code == 200
        parse_data = parse_res.json()
        assert parse_data["status"] == "success"
        assert parse_data["memory_updated"] is True
