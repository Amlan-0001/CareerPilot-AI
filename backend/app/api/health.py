from datetime import datetime
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": getattr(settings, "ENVIRONMENT", "development"),
        "timestamp": datetime.utcnow().isoformat(),
    }
