from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.application_schema import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
)
from app.services.application_service import application_service

router = APIRouter(tags=["Applications"])


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a new job application entry",
)
def create_application(
    app_in: ApplicationCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return application_service.create_application(db, current_user_id, app_in)


@router.get(
    "",
    response_model=List[ApplicationResponse],
    summary="List all job applications submitted by authenticated user",
)
def list_applications(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return application_service.get_user_applications(db, current_user_id)


@router.get(
    "/{application_id}",
    response_model=ApplicationResponse,
    summary="Get details of a specific job application entry",
)
def get_application(
    application_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return application_service.get_application_by_id(db, current_user_id, application_id)


@router.put(
    "/{application_id}",
    response_model=ApplicationResponse,
    summary="Update application status, notes, or details",
)
def update_application(
    application_id: str,
    app_in: ApplicationUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return application_service.update_application(db, current_user_id, application_id, app_in)


@router.delete(
    "/{application_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a job application record",
)
def delete_application(
    application_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    application_service.delete_application(db, current_user_id, application_id)
    return None
