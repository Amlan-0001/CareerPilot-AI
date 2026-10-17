from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def run_auto_migrations():
    """Lightweight SQLite schema migration helper to automatically add missing columns."""
    if not settings.DATABASE_URL.startswith("sqlite"):
        return

    try:
        with engine.connect() as conn:
            # Check applications table columns
            res = conn.execute(text("PRAGMA table_info(applications);")).fetchall()
            cols = [r[1] for r in res]
            if "match_score" not in cols:
                conn.execute(text("ALTER TABLE applications ADD COLUMN match_score FLOAT;"))
                conn.commit()
    except Exception:
        pass


run_auto_migrations()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
