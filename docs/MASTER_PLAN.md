# MASTER_PLAN.md

# CareerPilot AI

### AI-Powered Career Operating System (MVP)

---

# Project Information

**Project Name:** CareerPilot AI

**Author:** N. M. Amlan

**Project Type:** AI Full-Stack SaaS (MVP)

**Primary Goal:**
Build a deployable MVP that demonstrates an end-to-end AI-assisted job application workflow. The MVP is intended as a portfolio project for placements while serving as the technical foundation for a future startup.

---

# Vision

CareerPilot AI is an AI-powered Career Operating System that helps students and professionals reduce repetitive work involved in job applications.

The system combines:

* AI Memory
* Resume Intelligence
* Job Description Analysis
* Resume Optimization
* Browser Assistance
* Human-in-the-Loop AI

into one unified platform.

The MVP focuses only on validating the core workflow.

---

# MVP Philosophy

This is **NOT** a production-ready startup.

This is **NOT** an enterprise-grade platform.

This is a working MVP that demonstrates:

* AI Integration
* Full Stack Development
* Browser Extension Development
* Backend Engineering
* Product Design
* Human-in-the-Loop AI

Every implementation decision should prioritize:

1. Simplicity
2. Demonstrability
3. Readability
4. Deployment
5. Interview Value

---

# Core Workflow

```
User Registration
        │
        ▼
Create AI Memory
        │
        ▼
Upload Resume
        │
        ▼
Resume Parsing
        │
        ▼
AI Memory Generated
        │
        ▼
User Pastes Job Description
        │
        ▼
JD Analysis
        │
        ▼
Resume Match Analysis
        │
        ▼
Generate Optimized Resume
        │
        ▼
Save Resume Version
        │
        ▼
Open Job Application
        │
        ▼
Chrome Extension
        │
        ▼
Read Form
        │
        ▼
Fill Form
        │
        ▼
Human Approval
        │
        ▼
Submit
        │
        ▼
Save Application History
```

---

# Website Responsibilities

The website acts as the Brain.

Responsibilities:

* Authentication
* AI Memory
* Resume Storage
* Resume Generator
* Resume Versions
* Application History
* Backend APIs

The website performs all AI reasoning.

---

# Chrome Extension Responsibilities

The extension acts as the Hands.

Responsibilities:

* Read webpage
* Extract Job Description
* Detect form fields
* Display AI suggestions
* Fill fields
* Upload resume
* Request approval

The extension contains NO AI.

All AI calls go through backend APIs.

---

# MVP Features

## Authentication

* Register
* Login
* JWT Authentication

---

## Dashboard

Contains

* User Profile
* Resume
* AI Memory
* Resume Versions
* Application History

---

## AI Memory

Stores

Personal

* Name
* Email
* Phone

Education

* College
* Degree
* CGPA

Skills

Projects

Experience

Resume

---

## Resume Parser

Input

Resume PDF

Output

Structured JSON

User verifies extracted data.

---

## Job Description Analyzer

Input

Job Description

Output

* Skills
* Responsibilities
* Keywords
* Resume Match
* Missing Skills
* Suggestions

---

## Resume Optimizer

Input

Resume

*

Job Description

Output

Optimized Resume

Every change requires user approval.

---

## Resume Versioning

Never overwrite.

Always create

* Version 1
* Version 2
* Version 3

Store metadata:

* Date
* JD
* Notes

---

## Chrome Extension

Supports

* Google Forms
* Demo HTML Job Form

Capabilities

* Read page
* Fill fields
* Upload resume
* Human approval

---

## Application History

Store

* Company
* Role
* Resume Used
* Date
* Status

---

# Features NOT Included

* LinkedIn Integration
* Workday Integration
* Greenhouse Support
* Recruiter Dashboard
* Subscription System
* Payments
* Cover Letter Generator
* Interview Coach
* Career Recommendation Engine
* Multi-Agent System
* Enterprise Security
* Mobile App

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* React Router

---

## Backend

* FastAPI
* Python

---

## Database

* PostgreSQL

---

## ORM

* SQLAlchemy

---

## Authentication

* JWT

---

## AI

* Gemini API
* LangChain
* LangGraph

---

## Browser

* Chrome Extension
* Chrome Extension APIs

---

## Resume

Prototype:

* HTML Template
* PDF Generation

Future:

* LaTeX

---

## Deployment

Frontend

Vercel

Backend

Render

Database

Neon PostgreSQL

---

# Folder Structure

```
CareerPilot/

frontend/
backend/
extension/
database/
docs/

README.md
MASTER_PLAN.md
```

---

# Backend Structure

```
backend/

api/
models/
schemas/
services/
agents/
database/
utils/
config/
main.py
```

---

# Frontend Structure

```
frontend/

components/
pages/
hooks/
contexts/
services/
assets/
```

---

# Extension Structure

```
extension/

popup/
content/
background/
utils/
manifest.json
```

---

# Database Tables

User

Resume

ResumeVersion

AIMemory

Project

Skill

Experience

ApplicationHistory

---

# API Modules

Authentication

User

Resume

Memory

JD Analysis

Resume Generation

Application History

---

# AI Modules

Resume Parser

JD Analyzer

Resume Optimizer

Question Generator

Memory Retriever

---

# Development Order

Phase 1

Backend Foundation

---

Phase 2

Authentication

---

Phase 3

AI Memory

---

Phase 4

Resume Upload

---

Phase 5

Resume Parser

---

Phase 6

Dashboard

---

Phase 7

JD Analysis

---

Phase 8

Resume Optimization

---

Phase 9

Resume Generation

---

Phase 10

Chrome Extension

---

Phase 11

Form Detection

---

Phase 12

Guided Form Filling

---

Phase 13

Application History

---

Phase 14

Deployment

---

# Coding Principles

* Keep functions small.
* Follow modular architecture.
* Separate frontend and backend responsibilities.
* Write reusable components.
* Avoid duplicate code.
* Prefer readability over cleverness.
* Keep APIs RESTful.
* Maintain consistent naming conventions.

---

# AI Development Rules

* Never hardcode prompts inside business logic.
* Store prompts separately.
* Every AI output must be reviewable.
* Never fabricate user information.
* If information is unavailable, ask the user.
* Keep prompts modular and reusable.

---

# Git Workflow

```
main

develop

feature/auth

feature/memory

feature/resume

feature/extension

feature/history
```

---

# Success Criteria

The MVP is considered complete if a user can:

✅ Register an account

✅ Upload a resume

✅ Generate AI Memory

✅ Paste a Job Description

✅ Receive resume analysis

✅ Generate an optimized resume

✅ Save resume versions

✅ Open a demo application form

✅ Use the Chrome extension to assist in filling the form

✅ Review AI-generated content

✅ Submit the form

✅ View application history

---

# Future Vision

After the MVP is stable, CareerPilot AI can evolve into a complete Career Operating System with:

* Multi-platform support
* Interview Preparation
* Cover Letter Generator
* Career Analytics
* AI Career Coach
* Recruiter Dashboard
* University Partnerships
* Enterprise Edition

The MVP should always prioritize demonstrating a complete, working workflow over implementing every possible feature.
