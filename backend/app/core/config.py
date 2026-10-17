from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerPilot AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DEBUG: bool = False

    # Database Settings
    DATABASE_URL: str = "sqlite:///./careerpilot.db"

    # Centralized LLM Provider (Groq)
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "groq/compound-mini"

    # File Storage
    UPLOAD_DIR: str = "app/uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "chrome-extension://*",
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
