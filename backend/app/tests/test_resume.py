import io
import pytest


def test_resume_pipeline_upload_list_delete(client):
    # 1. Register & login test user
    email = "resumeuser@example.com"
    password = "ResumePassword123!"
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Resume User", "email": email, "password": password},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Minimal valid PDF file
    pdf_content = (
        b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj "
        b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj "
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
        b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000102 00000 n\n"
        b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n"
    )

    # 2. Upload PDF resume
    files = {"file": ("test_resume.pdf", io.BytesIO(pdf_content), "application/pdf")}
    data = {"resume_name": "Test Master Resume"}
    upload_res = client.post(
        "/api/v1/resumes/upload",
        headers=headers,
        files=files,
        data=data,
    )
    assert upload_res.status_code == 201
    resume_data = upload_res.json()
    assert resume_data["resume_name"] == "Test Master Resume"
    resume_id = resume_data["id"]

    # 3. List user resumes
    list_res = client.get("/api/v1/resumes", headers=headers)
    assert list_res.status_code == 200
    resumes_list = list_res.json()
    assert len(resumes_list) == 1
    assert resumes_list[0]["id"] == resume_id

    # 4. Get specific resume
    get_res = client.get(f"/api/v1/resumes/{resume_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == resume_id

    # 5. Delete resume
    del_res = client.delete(f"/api/v1/resumes/{resume_id}", headers=headers)
    assert del_res.status_code == 204

    # 6. Verify list is empty after deletion
    final_list = client.get("/api/v1/resumes", headers=headers).json()
    assert len(final_list) == 0
