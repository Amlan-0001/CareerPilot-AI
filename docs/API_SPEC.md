# API_SPEC.md

# CareerPilot AI - REST API Specifications

**Version:** MVP v1.0  
**Base URL:** `http://localhost:8000/api/v1`

---

## 1. Authentication Endpoints (`/auth`)

### `POST /auth/register`
* **Description**: Registers a new user account.
* **Request Body**:
  ```json
  {
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
    "full_name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-08-22T11:42:00Z"
  }
  ```

### `POST /auth/login`
* **Description**: Authenticates user credentials and returns JWT bearer token.
* **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer",
    "user": {
      "id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
      "email": "john@example.com",
      "full_name": "John Doe"
    }
  }
  ```

### `GET /auth/me`
* **Description**: Returns authenticated user profile.
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
    "full_name": "John Doe",
    "email": "john@example.com",
    "profile_photo": null,
    "created_at": "2026-08-22T11:42:00Z"
  }
  ```

---

## 2. AI Memory Endpoints (`/memory`)

### `GET /memory`
* **Description**: Fetches complete user AI memory profile including skills, projects, and experiences.
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "user_id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
    "phone": "+1234567890",
    "address": "San Francisco, CA",
    "college": "Stanford University",
    "degree": "B.S. Computer Science",
    "branch": "Computer Science",
    "cgpa": 3.8,
    "graduation_year": 2025,
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "github_url": "https://github.com/johndoe",
    "portfolio_url": "https://johndoe.dev",
    "summary": "Enthusiastic full stack and AI engineer...",
    "preferred_role": "Software Engineer",
    "preferred_location": "Remote / San Francisco",
    "skills": [],
    "projects": [],
    "experiences": []
  }
  ```

### `POST /memory` / `PUT /memory`
* **Description**: Creates or updates user core AI memory profile.
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "phone": "+1234567890",
    "address": "San Francisco, CA",
    "college": "Stanford University",
    "degree": "B.S. Computer Science",
    "branch": "Computer Science",
    "cgpa": 3.8,
    "graduation_year": 2025,
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "github_url": "https://github.com/johndoe",
    "portfolio_url": "https://johndoe.dev",
    "summary": "Enthusiastic full stack software engineer...",
    "preferred_role": "Software Engineer",
    "preferred_location": "San Francisco, CA"
  }
  ```

### `POST /memory/skills`
* **Description**: Adds a skill to user memory.
* **Request Body**:
  ```json
  {
    "skill_name": "Python",
    "skill_type": "Programming",
    "proficiency": 5
  }
  ```

### `DELETE /memory/skills/{skill_id}`
* **Description**: Deletes a skill record.

### `POST /memory/projects`
* **Description**: Adds a project record.
* **Request Body**:
  ```json
  {
    "title": "CareerPilot AI",
    "description": "AI-Powered Career Operating System",
    "technologies": "FastAPI, React, Gemini, PostgreSQL",
    "github_url": "https://github.com/johndoe/careerpilot",
    "live_url": "https://careerpilot.dev"
  }
  ```

### `DELETE /memory/projects/{project_id}`
* **Description**: Deletes a project record.

### `POST /memory/experiences`
* **Description**: Adds an experience record.
* **Request Body**:
  ```json
  {
    "company": "Tech Corp",
    "role": "Software Engineering Intern",
    "description": "Developed backend microservices using Python and FastAPI",
    "start_date": "2025-06-01",
    "end_date": "2025-08-31"
  }
  ```

### `DELETE /memory/experiences/{experience_id}`
* **Description**: Deletes an experience record.

---

## 3. Resume Endpoints (`/resumes`)

### `POST /resumes/upload`
* **Description**: Uploads a PDF resume file.
* **Form Data**: `file` (multipart/form-data), `resume_name` (string)
* **Response (201 Created)**:
  ```json
  {
    "id": "e89b2c3a-1234-4567-89ab-cdef01234567",
    "resume_name": "Default Resume",
    "resume_pdf": "/uploads/resumes/e89b2c3a.pdf",
    "resume_source": "PDF Upload",
    "created_at": "2026-08-22T11:42:00Z"
  }
  ```

### `GET /resumes`
* **Description**: Lists all resume versions belonging to the user.

### `GET /resumes/{resume_id}`
* **Description**: Fetches details of a specific resume version.

### `DELETE /resumes/{resume_id}`
* **Description**: Deletes a resume version.

---

## 4. AI Agent & Orchestrator Endpoints (`/agent`)

### `POST /agent/parse-resume`
* **Description**: Invokes Resume Parser Agent to parse a PDF resume into structured JSON and update AI Memory.
* **Request Body**:
  ```json
  {
    "resume_id": "e89b2c3a-1234-4567-89ab-cdef01234567"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "parsed_data": {
      "name": "John Doe",
      "email": "john@example.com",
      "skills": ["Python", "FastAPI", "React"],
      "education": "Stanford University",
      "experience": [...]
    }
  }
  ```

### `POST /agent/analyze-jd`
* **Description**: Invokes JD Analyzer Agent to analyze job description against user AI memory.
* **Request Body**:
  ```json
  {
    "job_description": "We are looking for a Python Backend Developer proficient in FastAPI and PostgreSQL...",
    "job_title": "Backend Engineer",
    "company_name": "Tech Corp"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "match_score": 85.0,
    "key_skills": ["Python", "FastAPI", "PostgreSQL"],
    "missing_skills": ["Docker", "Redis"],
    "summary": "Strong match for backend technical requirements.",
    "recommendations": ["Highlight FastAPI project experience in resume."]
  }
  ```

### `POST /agent/optimize-resume`
* **Description**: Invokes Resume Optimizer Agent to produce a tailored resume version based on JD match.
* **Request Body**:
  ```json
  {
    "resume_id": "e89b2c3a-1234-4567-89ab-cdef01234567",
    "job_description": "Requirements: Python, FastAPI...",
    "target_role": "Backend Engineer",
    "target_company": "Tech Corp"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "new_resume_id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    "resume_name": "Tailored - Tech Corp Backend Engineer",
    "ats_score": 90.0,
    "optimized_content": {...}
  }
  ```

### `POST /agent/generate-answer`
* **Description**: Generates AI answers for specific application form questions based on AI memory.
* **Request Body**:
  ```json
  {
    "question": "Why do you want to work at Tech Corp?",
    "job_description": "...",
    "field_context": "textarea"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "suggested_answer": "I am passionate about backend engineering and scalable system architecture..."
  }
  ```

---

## 5. Application History Endpoints (`/applications`)

### `GET /applications`
* **Description**: Retrieves list of job applications submitted by the user.

### `POST /applications`
* **Description**: Records a new application submission.
* **Request Body**:
  ```json
  {
    "company": "Tech Corp",
    "job_role": "Backend Engineer",
    "platform": "Google Forms",
    "resume_id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    "application_status": "Applied",
    "notes": "Submitted via Chrome Extension"
  }
  ```

### `PUT /applications/{application_id}`
* **Description**: Updates application status (e.g. Applied -> Interview -> Offer).

---

## 6. Extension Bridge Endpoints (`/extension`)

### `POST /extension/extract-jd`
* **Description**: Accepts webpage text extracted by Chrome extension and returns structured JD analysis.

### `POST /extension/fill-form`
* **Description**: Accepts form fields detected by Chrome extension and returns field-by-field answers matching AI Memory.

---

## 7. System Endpoints (`/health`)

### `GET /health`
* **Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2026-08-22T11:42:00Z"
  }
  ```
