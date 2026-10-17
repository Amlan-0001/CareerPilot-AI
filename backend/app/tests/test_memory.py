import pytest


def test_ai_memory_crud_flow(client):
    # 1. Register & login test user
    email = "memoryuser@example.com"
    password = "MemoryPassword123!"
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Memory User", "email": email, "password": password},
    )
    assert reg_res.status_code == 201

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get initial AI memory profile
    mem_get_res = client.get("/api/v1/memory", headers=headers)
    assert mem_get_res.status_code == 200
    mem_data = mem_get_res.json()
    assert "id" in mem_data
    assert mem_data["skills"] == []

    # 3. Update core AI memory fields
    update_res = client.put(
        "/api/v1/memory",
        headers=headers,
        json={
            "phone": "+1987654321",
            "college": "MIT",
            "degree": "B.S. Computer Science",
            "summary": "Full Stack AI Developer",
            "preferred_role": "Backend Engineer",
        },
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["phone"] == "+1987654321"
    assert updated_data["college"] == "MIT"
    assert updated_data["preferred_role"] == "Backend Engineer"

    # 4. Add skill
    skill_res = client.post(
        "/api/v1/memory/skills",
        headers=headers,
        json={
            "skill_name": "Python",
            "skill_type": "Programming",
            "proficiency": 5,
        },
    )
    assert skill_res.status_code == 201
    skill_data = skill_res.json()
    skill_id = skill_data["id"]
    assert skill_data["skill_name"] == "Python"

    # 5. Add project
    proj_res = client.post(
        "/api/v1/memory/projects",
        headers=headers,
        json={
            "title": "CareerPilot AI",
            "description": "AI Career OS",
            "technologies": "FastAPI, React, Gemini",
        },
    )
    assert proj_res.status_code == 201
    proj_data = proj_res.json()
    proj_id = proj_data["id"]
    assert proj_data["title"] == "CareerPilot AI"

    # 6. Add experience
    exp_res = client.post(
        "/api/v1/memory/experiences",
        headers=headers,
        json={
            "company": "Tech Innovators",
            "role": "AI Engineer Intern",
            "description": "Building LLM agents",
            "start_date": "2025-01-01",
        },
    )
    assert exp_res.status_code == 201
    exp_data = exp_res.json()
    exp_id = exp_data["id"]

    # 7. Verify full memory listing
    full_mem_res = client.get("/api/v1/memory", headers=headers)
    assert full_mem_res.status_code == 200
    full_data = full_mem_res.json()
    assert len(full_data["skills"]) == 1
    assert len(full_data["projects"]) == 1
    assert len(full_data["experiences"]) == 1

    # 8. Delete skill, project, and experience
    assert client.delete(f"/api/v1/memory/skills/{skill_id}", headers=headers).status_code == 204
    assert client.delete(f"/api/v1/memory/projects/{proj_id}", headers=headers).status_code == 204
    assert client.delete(f"/api/v1/memory/experiences/{exp_id}", headers=headers).status_code == 204

    # 9. Verify deletion cleanup
    final_mem_res = client.get("/api/v1/memory", headers=headers)
    final_data = final_mem_res.json()
    assert len(final_data["skills"]) == 0
    assert len(final_data["projects"]) == 0
    assert len(final_data["experiences"]) == 0
