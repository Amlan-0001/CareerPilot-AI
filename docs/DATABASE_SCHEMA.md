# DATABASE_SCHEMA.md

# CareerPilot AI - Database Schema

**Version:** MVP v1.0

---

# 1. Introduction

This document defines the database structure for CareerPilot AI.

The MVP uses PostgreSQL as the primary relational database.

The schema is designed to:

- Keep the MVP simple
- Support future expansion
- Avoid unnecessary complexity
- Maintain proper normalization
- Separate user data from AI-generated data

---

# 2. Database Overview

The MVP consists of the following tables:

1. users
2. ai_memory
3. resumes
4. projects
5. experiences
6. skills
7. applications

Future versions will introduce additional tables when required.

---

# 3. Entity Relationship Diagram (Conceptual)

User
│
├────────────── AI Memory
│
├────────────── Resume Versions
│
├────────────── Projects
│
├────────────── Skills
│
├────────────── Experiences
│
└────────────── Applications

---

# 4. Table: users

Purpose

Stores authentication and basic profile information.

Columns

id

UUID

Primary Key

---

full_name

TEXT

---

email

TEXT

Unique

---

password_hash

TEXT

---

profile_photo

TEXT

Nullable

---

created_at

TIMESTAMP

---

updated_at

TIMESTAMP

---

Relationships

One User

↓

One AI Memory

↓

Many Resumes

↓

Many Applications

↓

Many Skills

↓

Many Projects

↓

Many Experiences

---

# 5. Table: ai_memory

Purpose

Stores permanent career profile information.

Columns

id

UUID

Primary Key

---

user_id

Foreign Key

---

phone

TEXT

---

address

TEXT

---

college

TEXT

---

degree

TEXT

---

branch

TEXT

---

cgpa

FLOAT

---

graduation_year

INTEGER

---

linkedin_url

TEXT

---

github_url

TEXT

---

portfolio_url

TEXT

---

summary

TEXT

---

preferred_role

TEXT

---

preferred_location

TEXT

---

created_at

TIMESTAMP

---

updated_at

TIMESTAMP

---

Relationships

One User

↓

One AI Memory

---

# 6. Table: resumes

Purpose

Stores every resume version.

Columns

id

UUID

Primary Key

---

user_id

Foreign Key

---

resume_name

TEXT

Example

Default Resume

Google Resume

Microsoft Resume

---

resume_pdf

TEXT

Cloud URL

---

resume_source

TEXT

HTML / Markdown / JSON

Future

LaTeX

---

job_description

TEXT

Nullable

---

ats_score

FLOAT

Nullable

---

notes

TEXT

---

created_at

TIMESTAMP

---

Relationships

One User

↓

Many Resume Versions

---

# 7. Table: skills

Purpose

Stores technical and soft skills.

Columns

id

UUID

---

user_id

Foreign Key

---

skill_name

TEXT

Example

Python

FastAPI

React

---

skill_type

TEXT

Example

Programming

Framework

Tool

Soft Skill

---

proficiency

INTEGER

1-5

---

created_at

TIMESTAMP

---

# 8. Table: projects

Purpose

Stores user projects.

Columns

id

UUID

---

user_id

Foreign Key

---

title

TEXT

---

description

TEXT

---

technologies

TEXT

Comma separated for MVP

---

github_url

TEXT

---

live_url

TEXT

---

created_at

TIMESTAMP

---

# 9. Table: experiences

Purpose

Stores internships and work experience.

Columns

id

UUID

---

user_id

Foreign Key

---

company

TEXT

---

role

TEXT

---

description

TEXT

---

start_date

DATE

---

end_date

DATE

Nullable

---

created_at

TIMESTAMP

---

# 10. Table: applications

Purpose

Stores every application submitted.

Columns

id

UUID

---

user_id

Foreign Key

---

company

TEXT

---

job_role

TEXT

---

platform

TEXT

Google Forms

Demo Form

Future

LinkedIn

Workday

---

resume_id

Foreign Key

---

application_status

TEXT

Example

Applied

Interview

Rejected

Offer

---

submitted_at

TIMESTAMP

---

notes

TEXT

---

# 11. Relationships

users

1 → 1

ai_memory

users

1 → N

resumes

users

1 → N

skills

users

1 → N

projects

users

1 → N

experiences

users

1 → N

applications

applications

N → 1

resumes

---

# 12. Database Design Principles

The MVP follows these principles:

- One user owns all data.
- AI Memory is stored separately from authentication.
- Resume versions are never overwritten.
- Projects are independent records.
- Skills are independent records.
- Experiences are independent records.
- Applications are historical records.

---

# 13. Future Tables (Not in MVP)

The following tables will be added after MVP.

resume_feedback

Stores AI suggestions.

---

interviews

Stores interview schedules.

---

notifications

Stores reminders.

---

cover_letters

Stores generated cover letters.

---

career_analytics

Stores AI-generated statistics.

---

recruiters

Enterprise module.

---

companies

Company database.

---

vector_memory

Stores embeddings for RAG.

---

activity_logs

Tracks user actions.

---

ai_decision_logs

Stores every AI suggestion.

---

# 14. Primary Keys

Every table uses

UUID

instead of integer IDs.

Reason

- Globally unique
- Better security
- Easier API design

---

# 15. Naming Convention

Tables

snake_case

Columns

snake_case

Primary Key

id

Foreign Keys

table_name_id

Examples

user_id

resume_id

application_id

---

# 16. Database Rules

Never delete resumes.

Always create new resume versions.

Never store plain-text passwords.

Always hash passwords using bcrypt.

Never store browser passwords.

Never overwrite AI Memory automatically.

User approval is always required.

---

# 17. MVP Database Scope

The MVP database is intentionally lightweight.

Only the minimum data required for:

- Authentication
- AI Memory
- Resume Management
- Resume Generation
- Chrome Extension
- Application History

is stored.

Advanced analytics, recruiter features, interview tracking, and vector databases are intentionally deferred to future versions.
