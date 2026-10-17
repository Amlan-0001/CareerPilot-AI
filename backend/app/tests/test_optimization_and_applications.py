import io
import pytest
from unittest.mock import patch
from app.ai.llm.llm_service import llm_service


def test_resume_optimization_qa_and_applications_flow(client):
    # 1. Register & login test user
    email = "optuser@example.com"
    password = "OptPassword123!"
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Opt User", "email": email, "password": password},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload master PDF resume
    pdf_content = (
        b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj "
        b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj "
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
        b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000102 00000 n\n"
        b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n"
    )
    files = {"file": ("master.pdf", io.BytesIO(pdf_content), "application/pdf")}
    upload_res = client.post(
        "/api/v1/resumes/upload",
        headers=headers,
        files=files,
        data={"resume_name": "Master Resume"},
    )
    base_resume_id = upload_res.json()["id"]

    # 3. Test Resume Optimizer Agent endpoint
    mock_opt_response = {
        "tailored_summary": "Tailored Python Engineer summary.",
        "tailored_bullet_points": ["Engineered microservices using Python and FastAPI."],
        "ats_score": 94.0,
    }

    with patch.object(llm_service, "generate_json", return_value=mock_opt_response):
        opt_res = client.post(
            "/api/v1/agent/optimize-resume",
            headers=headers,
            json={
                "resume_id": base_resume_id,
                "job_description": "Senior Python Backend Engineer specializing in microservices.",
                "target_role": "Senior Backend Engineer",
                "target_company": "AI Innovations",
            },
        )
        assert opt_res.status_code == 200
        opt_data = opt_res.json()
        assert "new_resume_id" in opt_data
        assert opt_data["ats_score"] == 94.0
        new_resume_id = opt_data["new_resume_id"]

    # Verify listing resumes shows 2 versions
    list_res = client.get("/api/v1/resumes", headers=headers)
    assert len(list_res.json()) == 2

    # 4. Test Question Answer Agent endpoint
    mock_qa_response = {
        "answer": "My extensive background in Python microservices makes me an ideal fit.",
        "confidence_score": 0.95,
    }

    with patch.object(llm_service, "generate_json", return_value=mock_qa_response):
        qa_res = client.post(
            "/api/v1/agent/generate-answer",
            headers=headers,
            json={
                "question": "Why are you a good fit for this role?",
                "job_description": "Senior Python Backend Engineer",
            },
        )
        assert qa_res.status_code == 200
        qa_data = qa_res.json()
        assert "answer" in qa_data

    # 5. Test Application Tracking CRUD
    app_create_res = client.post(
        "/api/v1/applications",
        headers=headers,
        json={
            "company": "AI Innovations",
            "job_role": "Senior Backend Engineer",
            "platform": "LinkedIn",
            "resume_id": new_resume_id,
            "application_status": "Applied",
            "match_score": 92.5,
            "notes": "Applied via LinkedIn Easy Apply",
        },
    )
    assert app_create_res.status_code == 201
    app_record = app_create_res.json()
    app_id = app_record["id"]

    # 6. Test Extension Autofill endpoint
    with patch.object(llm_service, "generate_json", return_value=mock_qa_response):
        ext_fill_res = client.post(
            "/api/v1/extension/fill-form",
            headers=headers,
            json={
                "fields": [
                    {"id": "input_1", "name": "phone", "label": "Phone Number", "type": "text"},
                    {"id": "input_2", "name": "why_fit", "label": "Why do you want to join us?", "type": "textarea"},
                ],
                "job_description": "Senior Python Backend Engineer",
            },
        )
        assert ext_fill_res.status_code == 200
        fields_resp = ext_fill_res.json()["fields"]
        assert len(fields_resp) == 2
