from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, logger
import app.models  # Ensure all SQLAlchemy models are registered
from app.database.database import engine, Base
from app.utils.common import ensure_dir_exists
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.memory import router as memory_router
from app.api.resume import router as resume_router
from app.api.agent import router as agent_router
from app.api.application import router as application_router
from app.api.extension import router as extension_router

setup_logging()
logger.info(f"Starting {settings.PROJECT_NAME} backend service...")

# Ensure upload directory exists
ensure_dir_exists(settings.UPLOAD_DIR)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="CareerPilot AI Backend API Service",
    version="1.0.0",
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth")
app.include_router(memory_router, prefix=f"{settings.API_V1_STR}/memory")
app.include_router(resume_router, prefix=f"{settings.API_V1_STR}/resumes")
app.include_router(agent_router, prefix=f"{settings.API_V1_STR}/agent")
app.include_router(application_router, prefix=f"{settings.API_V1_STR}/applications")
app.include_router(extension_router, prefix=f"{settings.API_V1_STR}/extension")


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
    }
