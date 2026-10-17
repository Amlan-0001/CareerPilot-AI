from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.utils.helpers import generate_uuid, get_current_timestamp


class AIMemory(Base):
    __tablename__ = "ai_memory"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    college = Column(String, nullable=True)
    degree = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    cgpa = Column(Float, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    preferred_role = Column(String, nullable=True)
    preferred_location = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_current_timestamp)
    updated_at = Column(
        DateTime, default=get_current_timestamp, onupdate=get_current_timestamp
    )

    # Relationships
    user = relationship("User", back_populates="ai_memory")

    @property
    def skills(self):
        return self.user.skills if self.user else []

    @property
    def projects(self):
        return self.user.projects if self.user else []

    @property
    def experiences(self):
        return self.user.experiences if self.user else []
