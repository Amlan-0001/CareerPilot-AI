from datetime import datetime
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.utils.helpers import generate_uuid, get_current_timestamp


class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    company = Column(String, nullable=False)
    job_role = Column(String, nullable=False)
    platform = Column(String, nullable=False, default="Google Forms")  # Google Forms / Demo Form / Other
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=True)
    application_status = Column(String, nullable=False, default="Applied")  # Applied / Interview / Rejected / Offer
    match_score = Column(Float, nullable=True)
    submitted_at = Column(DateTime, default=get_current_timestamp)
    notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="applications")
    resume = relationship("Resume", back_populates="applications")
