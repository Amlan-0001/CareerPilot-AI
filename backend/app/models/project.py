from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.utils.helpers import generate_uuid, get_current_timestamp


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    technologies = Column(Text, nullable=False)  # Comma separated technologies
    github_url = Column(String, nullable=True)
    live_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_current_timestamp)

    # Relationships
    user = relationship("User", back_populates="projects")
