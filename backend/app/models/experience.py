from datetime import datetime
from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.utils.helpers import generate_uuid, get_current_timestamp


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    start_date = Column(String, nullable=False)  # ISO Date YYYY-MM-DD
    end_date = Column(String, nullable=True)    # ISO Date YYYY-MM-DD or Present
    created_at = Column(DateTime, default=get_current_timestamp)

    # Relationships
    user = relationship("User", back_populates="experiences")
