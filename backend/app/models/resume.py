from datetime import datetime
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.utils.helpers import generate_uuid, get_current_timestamp


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    resume_name = Column(String, nullable=False)
    resume_pdf = Column(String, nullable=False)  # Path / URL to PDF file
    resume_source = Column(String, nullable=False, default="HTML")  # HTML / Markdown / JSON / PDF Upload
    job_description = Column(Text, nullable=True)
    ats_score = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_current_timestamp)

    # Relationships
    user = relationship("User", back_populates="resumes")
    applications = relationship("Application", back_populates="resume")
