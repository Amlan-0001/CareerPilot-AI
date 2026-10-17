# Phase 0: Repository Analysis & Architecture Inspection

## Executive Summary
This document records the initial repository analysis and structural inspection for **CareerPilot AI** (Career OS).

## 1. Initial Repository State
* **Workspace Path**: `c:\Users\nmaml\OneDrive\Desktop\CareerOs`
* **Directory Structure**:
  * `/docs` directory containing 5 Markdown specification files:
    1. `MASTER_PLAN.md` (690 lines) - Product vision, workflow, MVP scope, non-MVP scope, tech stack, folder hierarchy, development order.
    2. `SYSTEM_ARCHITECTURE.md` (606 lines) - 3-tier architecture (Website/Brain, Extension/Hands, FastAPI/Backend), module communications, security design, error handling.
    3. `DATABASE_SCHEMA.md` (825 lines) - Relational PostgreSQL schema containing 7 tables (`users`, `ai_memory`, `resumes`, `skills`, `projects`, `experiences`, `applications`), UUID keys, and foreign key relations.
    4. `PROJECT_STRUCTURE.md` (513 lines) - Complete folder tree for `backend/`, `frontend/`, `extension/`, and `docs/`, detailing layer responsibilities (API, Services, AI, Database, Schemas, Utils).
    5. `API_SPEC.md` - Initially present but empty (0 bytes).
* **Missing Components**:
  * Source code for `backend/`, `frontend/`, and `extension/` has not been generated yet.
  * Root environment files (`.env`, `.env.example`), `.gitignore`, `docker-compose.yml`, `README.md`.
  * Detailed REST API Endpoint Specification (`API_SPEC.md`).

## 2. Technical Stack & Key Architectural Decisions
* **Backend**: Python 3.10+, FastAPI, Pydantic, SQLAlchemy ORM.
* **Database**: PostgreSQL (with SQLite fallback support for seamless local testing).
* **Authentication**: JWT (JSON Web Tokens) with `bcrypt` password hashing via `passlib`.
* **AI Layer**: Google Gemini API, LangChain / LangGraph conceptual framework, Agent-Oriented Architecture (AOA) with centralized `Agent Orchestrator` routing requests to specialized agents:
  * `Resume Parser Agent`
  * `JD Analyzer Agent`
  * `Resume Optimizer Agent`
  * `Question Answer Agent`
  * `Memory Agent`
* **Frontend**: React (Vite), Tailwind CSS, React Router.
* **Extension**: Chrome Extension Manifest V3 (DOM Form Detector, Job Description Extractor, Form Filler, Sidebar Overlay, Background Worker).

## 3. Discrepancies & Resolutions
1. **Empty `API_SPEC.md`**:
   * *Resolution*: We will populate `docs/API_SPEC.md` as part of Phase 1 (Documentation & Root Setup) by extracting the endpoints defined across `SYSTEM_ARCHITECTURE.md` and `PROJECT_STRUCTURE.md`.
2. **Project Naming Consistency**:
   * Repository path is `CareerOs`, while documentation specifies project name as `CareerPilot AI`. We maintain `CareerPilot AI` internally and preserve standard root file placements.

## 4. Execution Sequence Strategy
Following the mandatory **Backend-First** principle:
1. **Phase 1**: Documentation Completion & Root Setup (`API_SPEC.md`, `.gitignore`, `.env.example`, `requirements.txt`).
2. **Phase 2**: Backend Foundation (`app/core/`, `app/database/`, `app/main.py`, config, security, logging).
3. **Phase 3**: Database Models & Schemas (SQLAlchemy entities for 7 tables, Pydantic DTOs).
4. **Phase 4**: Authentication (`/api/v1/auth/register`, `/api/v1/auth/login`, password hashing, JWT dependencies).
5. **Phase 5**: AI Memory Service & APIs (CRUD for personal info, skills, projects, experiences).
6. **Phase 6**: Resume Pipeline & Parser Agent (PDF extraction, parsing agent, prompt template, versioning).
7. **Phase 7**: JD Analysis & Match Engine (`jd_analyzer.py`, prompt, scoring logic, match breakdown).
8. **Phase 8**: Resume Optimization Agent & Question Answer Agent (`resume_optimizer.py`, `question_answer.py`, `orchestrator.py`).
9. **Phase 9**: Backend Integration Testing Gate (pytest suite covering all endpoints, DB ops, AI mocks).
10. **Phase 10**: Frontend Application Development (React + Vite + Tailwind UI).
11. **Phase 11**: Chrome Extension Development (MV3 Manifest, Content scripts, Sidebar, Background scripts).
12. **Phase 12**: End-to-End Integration & Final Walkthrough.
