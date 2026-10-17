from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.ai_memory import AIMemory
from app.schemas.auth_schema import UserRegister, UserLogin
from app.core.security import get_password_hash, verify_password


class AuthService:
    @staticmethod
    def register_user(db: Session, user_data: UserRegister) -> User:
        # Check if email is already registered
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        # Hash password and create User record
        hashed_pw = get_password_hash(user_data.password)
        db_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            password_hash=hashed_pw,
        )
        db.add(db_user)
        db.flush()  # Generate db_user.id

        # Automatically create initial AI Memory record for user
        ai_memory = AIMemory(user_id=db_user.id)
        db.add(ai_memory)

        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )
        return user


auth_service = AuthService()
