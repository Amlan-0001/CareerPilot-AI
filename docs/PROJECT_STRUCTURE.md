# PROJECT_STRUCTURE.md

# CareerPilot AI - Project Structure

**Version:** MVP v1.0

---

# 1. Overview

This document defines the complete folder structure of the CareerPilot AI MVP.

The architecture follows a modular, scalable, and maintainable design while keeping the MVP simple enough to develop rapidly.

The project is divided into four major parts:

- Frontend (React)
- Backend (FastAPI)
- Chrome Extension
- Documentation

The backend follows an **Agent-Oriented Architecture (AOA)** where every AI capability is implemented as an independent agent coordinated by an Agent Orchestrator.

---

# 2. Complete Project Structure

```text
CareerPilot/
│
├── backend/
├── frontend/
├── extension/
├── docs/
│
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── LICENSE
└── README.md
```

---

# 3. Backend Structure

```text
backend/
│
├── app/
│   │
│   ├── api/
│   │   ├── auth.py
│   │   ├── memory.py
│   │   ├── resume.py
│   │   ├── application.py
│   │   ├── extension.py
│   │   ├── agent.py
│   │   └── health.py
│   │
│   ├── ai/
│   │   │
│   │   ├── orchestrator/
│   │   │   └── orchestrator.py
│   │   │
│   │   ├── agents/
│   │   │   ├── resume_parser.py
│   │   │   ├── jd_analyzer.py
│   │   │   ├── resume_optimizer.py
│   │   │   ├── question_answer.py
│   │   │   └── memory_agent.py
│   │   │
│   │   ├── llm/
│   │   │   ├── gemini_client.py
│   │   │   ├── prompt_builder.py
│   │   │   └── response_parser.py
│   │   │
│   │   ├── prompts/
│   │   │   ├── resume_parser.txt
│   │   │   ├── jd_analysis.txt
│   │   │   ├── resume_optimizer.txt
│   │   │   └── question_answer.txt
│   │   │
│   │   ├── memory/
│   │   │   └── memory_manager.py
│   │   │
│   │   └── tools/
│   │       ├── pdf_tool.py
│   │       ├── resume_tool.py
│   │       └── parser_tool.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── memory_service.py
│   │   ├── resume_service.py
│   │   ├── application_service.py
│   │   ├── extension_service.py
│   │   └── storage_service.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── ai_memory.py
│   │   ├── resume.py
│   │   ├── project.py
│   │   ├── skill.py
│   │   ├── experience.py
│   │   └── application.py
│   │
│   ├── schemas/
│   │   ├── auth_schema.py
│   │   ├── memory_schema.py
│   │   ├── resume_schema.py
│   │   ├── application_schema.py
│   │   ├── extension_schema.py
│   │   └── agent_schema.py
│   │
│   ├── database/
│   │   ├── database.py
│   │   ├── base.py
│   │   └── migrations/
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── constants.py
│   │   ├── logging.py
│   │   └── dependencies.py
│   │
│   ├── utils/
│   │   ├── file_utils.py
│   │   ├── pdf_utils.py
│   │   ├── validators.py
│   │   ├── helpers.py
│   │   └── common.py
│   │
│   ├── uploads/
│   │
│   ├── tests/
│   │
│   └── main.py
│
├── requirements.txt
└── README.md
```

---

# 4. Frontend Structure

```text
frontend/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── memory/
│   │   ├── resume/
│   │   ├── history/
│   │   └── ui/
│   │
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Memory.jsx
│   │   ├── Resume.jsx
│   │   ├── History.jsx
│   │   ├── Settings.jsx
│   │   └── NotFound.jsx
│   │
│   ├── services/
│   │   ├── auth_api.js
│   │   ├── memory_api.js
│   │   ├── resume_api.js
│   │   ├── application_api.js
│   │   └── agent_api.js
│   │
│   ├── hooks/
│   │
│   ├── contexts/
│   │
│   ├── router/
│   │
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── vite.config.js
```

---

# 5. Chrome Extension Structure

```text
extension/
│
├── manifest.json
│
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
│
├── content/
│   ├── content.js
│   ├── sidebar.js
│   ├── form_detector.js
│   ├── form_filler.js
│   ├── job_extractor.js
│   └── dom_utils.js
│
├── background/
│   └── background.js
│
├── services/
│   └── api.js
│
├── assets/
│
└── icons/
```

---

# 6. Documentation Structure

```text
docs/
│
├── MASTER_PLAN.md
├── SYSTEM_ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── PROJECT_STRUCTURE.md
├── AGENT_ARCHITECTURE.md
├── API_SPEC.md
├── PROMPTS.md
├── DEPLOYMENT.md
└── README_IMAGES/
```

---

# 7. Backend Layer Responsibilities

## API Layer

Location

```text
app/api/
```

Responsibilities

- Receive HTTP requests
- Validate input
- Call services
- Return JSON responses

Contains **no business logic**.

---

## Service Layer

Location

```text
app/services/
```

Responsibilities

- Business logic
- Database interaction
- Validation
- File handling
- Authentication

Services never communicate directly with LLMs.

---

## AI Layer

Location

```text
app/ai/
```

Responsibilities

- AI orchestration
- Prompt management
- LLM communication
- Agent execution
- AI tools
- AI memory retrieval

All AI-related functionality lives here.

---

## Database Layer

Location

```text
app/models/
```

Responsibilities

- SQLAlchemy models
- Database entities
- Relationships

---

## Schema Layer

Location

```text
app/schemas/
```

Responsibilities

- Request validation
- Response validation
- Pydantic models

---

## Utility Layer

Location

```text
app/utils/
```

Responsibilities

- Helper functions
- PDF utilities
- File parsing
- Common reusable functions

---

# 8. AI Layer Architecture

The AI package is divided into five modules.

## Agent Orchestrator

Coordinates all AI agents.

Responsible for deciding which agent executes a request.

---

## Agents

Independent AI components.

Current MVP Agents

- Resume Parser Agent
- JD Analyzer Agent
- Resume Optimizer Agent
- Question Answer Agent
- Memory Agent

Future agents can be added without changing existing architecture.

---

## LLM Layer

Responsible for:

- Gemini API communication
- Prompt execution
- Response parsing

No other module should directly call Gemini APIs.

---

## Prompt Layer

Stores every AI prompt as a separate text file.

Benefits

- Easy prompt tuning
- Version control
- Better maintainability

---

## AI Tools

Reusable helper modules used by agents.

Examples

- PDF extraction
- Resume formatting
- Skill extraction

---

# 9. Frontend Responsibilities

The frontend is responsible for:

- Authentication
- Dashboard
- AI Memory Management
- Resume Upload
- Resume Generation
- Resume History
- API Communication

The frontend contains **no AI logic**.

---

# 10. Chrome Extension Responsibilities

The extension acts as the browser interaction layer.

Responsibilities

- Read webpage
- Extract Job Description
- Detect supported forms
- Display AI sidebar
- Fill form fields
- Upload resume
- Request user approval

The extension never communicates directly with the database or Gemini.

---

# 11. Development Principles

CareerPilot follows these engineering principles:

- Modular Architecture
- Agent-Oriented Design
- API-First Development
- Separation of Concerns
- Reusable Components
- Clean Code
- Low Coupling
- High Cohesion
- Future Scalability

---

# 12. Coding Standards

- One responsibility per file.
- One responsibility per class.
- One responsibility per function.
- Never hardcode API keys.
- Never hardcode prompts.
- Never write SQL inside routers.
- Never call LLMs from API routes.
- All AI requests must pass through the Agent Orchestrator.
- Keep frontend and backend completely independent.

---

# 13. Future Expansion

This architecture is designed to support future additions without major restructuring.

Planned future modules include:

- Interview Coach Agent
- Cover Letter Agent
- Career Advisor Agent
- Mock Interview Agent
- Salary Negotiation Agent
- Recruiter Dashboard
- University Dashboard
- Analytics Engine
- Vector Database (RAG)
- Redis Cache
- Background Workers
- Notification Service
- Multi-Agent Collaboration

The MVP intentionally excludes these features while keeping the architecture ready for future expansion.