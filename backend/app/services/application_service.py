from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.application import Application
from app.schemas.application_schema import ApplicationCreate, ApplicationUpdate


class ApplicationService:
    @staticmethod
    def create_application(
        db: Session, user_id: str, app_in: ApplicationCreate
    ) -> Application:
        db_app = Application(
            user_id=user_id,
            company=app_in.company,
            job_role=app_in.job_role,
            platform=app_in.platform,
            resume_id=app_in.resume_id,
            application_status=app_in.application_status or "Applied",
            match_score=app_in.match_score,
            notes=app_in.notes,
        )
        db.add(db_app)
        db.commit()
        db.refresh(db_app)
        return db_app

    @staticmethod
    def get_user_applications(db: Session, user_id: str) -> List[Application]:
        return (
            db.query(Application)
            .filter(Application.user_id == user_id)
            .order_by(Application.created_at.desc())
            .all()
        )

    @staticmethod
    def get_application_by_id(
        db: Session, user_id: str, app_id: str
    ) -> Application:
        app_record = (
            db.query(Application)
            .filter(Application.id == app_id, Application.user_id == user_id)
            .first()
        )
        if not app_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application record not found",
            )
        return app_record

    @staticmethod
    def update_application(
        db: Session, user_id: str, app_id: str, app_in: ApplicationUpdate
    ) -> Application:
        app_record = ApplicationService.get_application_by_id(db, user_id, app_id)
        update_data = app_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(app_record, field, value)

        db.commit()
        db.refresh(app_record)
        return app_record

    @staticmethod
    def delete_application(db: Session, user_id: str, app_id: str) -> bool:
        app_record = ApplicationService.get_application_by_id(db, user_id, app_id)
        db.delete(app_record)
        db.commit()
        return True


application_service = ApplicationService()
