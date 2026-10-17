from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.auth_schema import UserRegister, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import auth_service
from app.core.security import create_access_token
from app.core.dependencies import get_current_user_id

router = APIRouter(tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    user = auth_service.register_user(db, user_in)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate user credentials and return JWT bearer token",
)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, user_in.email, user_in.password)
    access_token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile information",
)
def get_me(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = auth_service.get_user_by_id(db, current_user_id)
    return user
