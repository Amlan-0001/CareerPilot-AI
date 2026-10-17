# CareerPilot AI — Backend Service

FastAPI-powered backend implementing Agent-Oriented Architecture (AOA) for CareerPilot AI.

## Structure
```
backend/
├── app/
│   ├── api/          # HTTP Endpoint Routers
│   ├── ai/           # Agent Orchestrator, LLM Clients, Prompts, Agents
│   ├── services/     # Business logic & DB interaction services
│   ├── models/       # SQLAlchemy DB Models
│   ├── schemas/      # Pydantic Schemas / DTOs
│   ├── database/     # DB Session & Base configuration
│   ├── core/         # Config, Security, Constants, Dependencies, Logging
│   ├── utils/        # File & PDF helper tools
│   ├── uploads/      # Resume file storage
│   ├── tests/        # Pytest backend test suite
│   └── main.py       # FastAPI application entry point
├── requirements.txt
└── README.md
```

## Running backend locally
```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
