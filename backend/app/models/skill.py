from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.utils.helpers import generate_uuid, get_current_timestamp


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    skill_type = Column(String, nullable=False)  # Programming, Framework, Tool, Soft Skill
    proficiency = Column(Integer, nullable=False, default=3)  # 1 to 5
    created_at = Column(DateTime, default=get_current_timestamp)

    # Relationships
    user = relationship("User", back_populates="skills")
