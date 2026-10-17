# Phase 2: Database Models & Schemas Implementation

## Implementation Details

### Overview
In Phase 2, we implemented all 7 database entities specified in `DATABASE_SCHEMA.md` using SQLAlchemy ORM, updated the central model registry in `app/database/base.py`, and created Pydantic schema validation DTOs in `app/schemas/`.

### 1. Database Entities Implemented (`backend/app/models/`)
- `User` (`users` table): Primary user authentication table. Contains `id` (UUID), `full_name`, `email` (unique index), `password_hash`, `profile_photo`, `created_at`, `updated_at`. Defines `cascade="all, delete-orphan"` relationships for all related entities.
- `AIMemory` (`ai_memory` table): Permanent user profile memory. Contains `user_id` (foreign key to `users.id`, 1-to-1 unique), contact details (`phone`, `address`), education (`college`, `degree`, `branch`, `cgpa`, `graduation_year`), social links (`linkedin_url`, `github_url`, `portfolio_url`), professional summary, and job preferences.
- `Resume` (`resumes` table): Versioned resume storage. Contains `user_id`, `resume_name`, `resume_pdf` file path, `resume_source` (HTML/Markdown/JSON/PDF), `job_description`, `ats_score`, and notes. Resumes are never overwritten.
- `Skill` (`skills` table): User skills listing. Contains `user_id`, `skill_name`, `skill_type` (Programming, Framework, Tool, Soft Skill), and `proficiency` (1-5 rating).
- `Project` (`projects` table): Portfolio projects. Contains `user_id`, `title`, `description`, `technologies`, `github_url`, and `live_url`.
- `Experience` (`experiences` table): Work and internship experience records. Contains `user_id`, `company`, `role`, `description`, `start_date`, and `end_date`.
- `Application` (`applications` table): Job application history records. Contains `user_id`, `company`, `job_role`, `platform`, `resume_id` (foreign key to `resumes.id`), `application_status` (Applied, Interview, Rejected, Offer), `submitted_at`, and `notes`.

### 2. Validation Schemas Implemented (`backend/app/schemas/`)
- `auth_schema.py`: `UserRegister`, `UserLogin`, `UserResponse`, `TokenResponse`.
- `memory_schema.py`: `AIMemoryCreate`, `AIMemoryUpdate`, `AIMemoryResponse`, `SkillCreate`, `SkillResponse`, `ProjectCreate`, `ProjectResponse`, `ExperienceCreate`, `ExperienceResponse`.
- `resume_schema.py`: `ResumeCreate`, `ResumeResponse`.
- `application_schema.py`: `ApplicationCreate`, `ApplicationUpdate`, `ApplicationResponse`.
- `agent_schema.py`: Request/response DTOs for `ParseResume`, `AnalyzeJD`, `OptimizeResume`, and `GenerateAnswer`.
- `extension_schema.py`: DTOs for Chrome extension page extraction and form filling.

### Verification Results
- Executed `Base.metadata.create_all(bind=engine)` via SQLAlchemy. All 7 tables were initialized without schema error or relation mismatch.
