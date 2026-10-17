# Phase 5: Resume Pipeline & Resume Parser Agent Implementation

## Implementation Details

### Overview
In Phase 5, we implemented the complete PDF resume upload pipeline, text extraction tools, prompt management infrastructure, Google Gemini LLM client layer with offline heuristics fallback, Resume Parser Agent, versioned resume storage, and REST API routes under `/api/v1/resumes`.

### 1. LLM & Prompt Architecture (`backend/app/ai/`)
- `app/ai/prompts/resume_parser.txt`: Structured prompt template defining strict JSON schema output for resume text extraction.
- `app/ai/llm/prompt_builder.py`: `PromptBuilder` class that dynamically reads prompt template text files from `app/ai/prompts/` and substitutes runtime parameters.
- `app/ai/llm/response_parser.py`: `clean_and_parse_json` utility that handles markdown code block syntax (````json ... ````) and cleans LLM outputs into Python dictionaries.
- `app/ai/llm/gemini_client.py`: Centralized `GeminiClient` wrapper using `google.generativeai`. Handles API errors and operates in fallback mode if `GEMINI_API_KEY` is not present.
- `app/ai/agents/resume_parser.py`: `ResumeParserAgent` class. Invokes Gemini LLM (or regex rule heuristics fallback) to extract contact details, skills, experiences, projects, and summary from raw resume text.

### 2. PDF Extraction & Tooling (`backend/app/utils/pdf_utils.py` & `backend/app/ai/tools/pdf_tool.py`)
- `extract_text_from_pdf_file` / `extract_text_from_pdf_bytes`: Uses `pypdf.PdfReader` to extract raw text content from uploaded PDF files.
- `PDFTool`: Exposes `parse_pdf` helper for AI agents.

### 3. Service & API Layer (`backend/app/services/resume_service.py` & `backend/app/api/resume.py`)
- `POST /api/v1/resumes/upload`: Accepts multipart form file upload, validates `.pdf` extension, saves to `app/uploads/resumes/`, creates a new `Resume` DB record (versioning guaranteed, existing resumes are never overwritten).
- `GET /api/v1/resumes`: Lists all resume versions belonging to the authenticated user ordered by `created_at` descending.
- `GET /api/v1/resumes/{resume_id}`: Retrieves specific resume version details.
- `DELETE /api/v1/resumes/{resume_id}`: Deletes resume record and deletes physical PDF file from disk.
- `parse_resume_and_update_memory`: Invokes `ResumeParserAgent` to parse stored PDF text and automatically populates user's `AIMemory`, `Skill`, `Project`, and `Experience` database tables.

### 4. Automated Test Verification (`app/tests/test_resume.py`)
Tested end-to-end resume pipeline using FastAPI `TestClient`:
1. Registration & JWT login of test user (PASSED).
2. Multipart PDF resume upload (`Test Master Resume`) (PASSED - HTTP 201 Created).
3. User resumes listing (PASSED - HTTP 200 OK).
4. Specific resume detail retrieval (PASSED - HTTP 200 OK).
5. Resume deletion and physical cleanup (PASSED - HTTP 204 No Content).
6. Post-deletion list cleanup verification (PASSED - 0 resumes remaining).

### Verification Summary
- Run command: `.\venv\Scripts\python.exe -m pytest app/tests/ -v`
- Result: `3 passed in 1.15s` (100% pass rate across auth, memory, and resume suites).
