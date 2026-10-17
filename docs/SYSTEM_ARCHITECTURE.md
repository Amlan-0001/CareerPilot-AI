# SYSTEM_ARCHITECTURE.md

# CareerPilot AI - System Architecture

**Version:** MVP v1.0

---

# 1. Introduction

CareerPilot AI is an AI-powered Career Operating System designed to simplify the job application process.

The system follows a modular architecture consisting of three primary layers:

1. Frontend Web Application
2. Backend AI Services
3. Chrome Extension

The Website acts as the **Brain**, while the Chrome Extension acts as the **Hands**.

The Backend performs all AI reasoning, data storage, and business logic.

---

# 2. High-Level Architecture

                    +----------------------+
                    |      User            |
                    +----------+-----------+
                               |
                               |
             +-----------------v-----------------+
             |      React Frontend (Website)     |
             +-----------------+-----------------+
                               |
                         HTTPS REST APIs
                               |
             +-----------------v-----------------+
             |       FastAPI Backend             |
             +-----------------+-----------------+
                               |
      +------------+-----------+------------+------------+
      |            |                        |            |
      |            |                        |            |
+-----v-----+ +----v-----+          +-------v------+ +---v------+
| PostgreSQL| | AI Agent |          | Resume Engine| | FileStore|
+-----------+ +----------+          +--------------+ +----------+
                               |
                               |
                        Gemini / LLM APIs


Chrome Extension

        |
        |
Reads Browser
        |
Calls Backend APIs
        |
Displays Suggestions
        |
Fills Forms

---

# 3. System Components

The application is divided into the following independent modules.

## 3.1 Frontend

Technology

- React
- Vite
- Tailwind CSS

Responsibilities

- User Authentication
- Dashboard
- AI Memory Management
- Resume Upload
- Resume Generation
- Resume Version Management
- Application History
- Calling Backend APIs

The frontend contains no business logic.

---

## 3.2 Backend

Technology

- FastAPI
- Python

Responsibilities

- Business Logic
- AI Memory
- Resume Processing
- Authentication
- API Management
- Job Description Analysis
- Resume Optimization
- Database Communication

The backend acts as the central controller.

---

## 3.3 Database

Technology

- PostgreSQL

Responsibilities

Store

- Users
- AI Memory
- Skills
- Projects
- Experience
- Resume Versions
- Applications
- User Settings

---

## 3.4 AI Layer

Responsibilities

- Resume Parsing
- Job Description Analysis
- Resume Matching
- Resume Optimization
- HR Answer Generation

The AI Layer never directly communicates with the frontend.

All requests pass through the backend.

---

## 3.5 Chrome Extension

Responsibilities

- Read webpage
- Extract Job Description
- Detect form fields
- Show AI Sidebar
- Fill supported fields
- Upload resume
- Pause on CAPTCHA

The extension contains NO AI logic.

It only communicates with Backend APIs.

---

# 4. Module Communication

Frontend

↓

Backend API

↓

AI Services

↓

Database

Chrome Extension

↓

Backend API

↓

AI Services

↓

Database

Neither the frontend nor the extension directly access the database.

---

# 5. Data Flow

## User Registration

User

↓

Frontend

↓

Backend

↓

Database

↓

Success Response

---

## Resume Upload

User

↓

Frontend

↓

Backend

↓

Resume Storage

↓

Resume Parser

↓

AI Memory

↓

Database

---

## Job Description Analysis

User

↓

Chrome Extension

↓

Backend

↓

AI Agent

↓

JD Analysis

↓

Response

↓

Extension Sidebar

---

## Resume Optimization

Job Description

+

AI Memory

↓

Resume Optimizer

↓

Suggestions

↓

User Approval

↓

Resume Generator

↓

PDF

↓

Database

---

## Guided Form Filling

User Opens Form

↓

Extension Reads Form

↓

Backend Request

↓

Retrieve AI Memory

↓

Generate Answers

↓

Return Response

↓

User Approval

↓

Extension Fills Form

---

# 6. Authentication Flow

User Login

↓

Frontend

↓

Backend

↓

JWT Generated

↓

JWT Stored

↓

Future API Calls

↓

Authorization Header

Chrome Extension also uses the same JWT token after user login.

---

# 7. Resume Workflow

Upload Resume

↓

Resume Parser

↓

Extract Information

↓

Create AI Memory

↓

User Verification

↓

Save Memory

↓

Resume Version Created

---

# 8. Application Workflow

Open Job Page

↓

Extension Extracts JD

↓

Backend Analysis

↓

Resume Match

↓

Generate Resume

↓

User Approval

↓

Fill Form

↓

User Approval

↓

Submit

↓

Save History

---

# 9. AI Workflow

Input

↓

Retrieve AI Memory

↓

Retrieve Resume

↓

Retrieve JD

↓

Build Prompt

↓

Call Gemini API

↓

Validate Output

↓

Return JSON

↓

Frontend / Extension

---

# 10. Security Architecture

Passwords

- Never stored in plain text
- Hashed using bcrypt

Authentication

- JWT

Communication

- HTTPS

Extension

- Stores JWT only
- Never stores personal information permanently

Database

- Accessible only through Backend APIs

---

# 11. Error Handling

If AI fails

↓

Return Error

↓

Allow Retry

If JD Parsing Fails

↓

Ask User to Paste JD

If Resume Parsing Fails

↓

Manual Editing

If Form Detection Fails

↓

Manual Selection Mode

---

# 12. MVP Limitations

The MVP intentionally supports:

- Google Forms
- Demo HTML Form

The following are outside MVP scope:

- LinkedIn
- Workday
- Greenhouse
- Lever
- Ashby

These platforms will be added in future versions.

---

# 13. Future Architecture

Future versions may include

- Vector Database
- Redis Cache
- Background Workers
- Multi-Agent Architecture
- Event Queue
- Notification Service
- Recruiter Dashboard
- Analytics Engine

These components are intentionally excluded from the MVP to keep the architecture simple and maintainable.

---

# 14. Architecture Principles

The project follows these principles:

- Modular Design
- Separation of Concerns
- API-First Development
- Human-in-the-Loop AI
- Privacy by Design
- Backend-Centric Intelligence
- Reusable Components
- Clean Folder Structure
- Scalable Architecture
- Easy Future Expansion