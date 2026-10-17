# CareerPilot AI — AI-Powered Career Operating System

CareerPilot AI is an AI-powered Career Operating System designed to streamline and automate job application workflows for students and professionals.

## 🚀 Core Features

- **AI Memory**: Permanent storage of personal data, skills, projects, and work experience.
- **Resume Intelligence**: PDF parser and AI optimizer creating targeted resume versions without overwriting existing data.
- **Job Description Analysis**: Match scoring, missing skill detection, and keyword extraction.
- **Chrome Extension Assistant**: Form field detection, guided answer filling, and human-in-the-loop application submission.
- **Application History**: Centralized tracking for all job applications submitted across platforms.

## 📁 Repository Structure

- `backend/`: FastAPI backend service, Agent-Oriented Architecture (AOA), SQLAlchemy ORM, Gemini LLM integrations.
- `frontend/`: React + Vite + Tailwind CSS dashboard web application.
- `extension/`: Chrome Extension (Manifest V3) for browser automation and form assistance.
- `docs/`: Comprehensive architecture specifications, database schema, API specification, and step-by-step implementation logs.

## 📖 Documentation

- [Master Plan](docs/MASTER_PLAN.md)
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Project Structure](docs/PROJECT_STRUCTURE.md)
- [API Specification](docs/API_SPEC.md)
- [Implementation Logs](docs/implementation/)

## 🛠️ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Chrome Browser

### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload
```

FastAPI interactive documentation will be available at `http://localhost:8000/docs`.

---
**Author**: N. M. Amlan  
**License**: MIT
