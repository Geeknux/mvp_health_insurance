"""
Authentication API endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from django.contrib.auth.hashers import check_password
from apps.users.models import User
from core.security import create_access_token, create_refresh_token, decode_token
from core.dependencies import get_current_active_user

router = APIRouter()


class RegisterRequest(BaseModel):
    national_id: str = Field(..., min_length=10, max_length=10, description="کد ملی")
    email: EmailStr | None = Field(default=None, description="ایمیل")
    first_name: str = Field(..., min_length=2, max_length=100, description="نام")
    last_name: str = Field(..., min_length=2, max_length=100, description="نام خانوادگی")
    phone: str | None = Field(default=None, min_length=11, max_length=11, description="تلفن همراه")
    password: str = Field(..., min_length=8, description="رمز عبور")


class LoginRequest(BaseModel):
    national_id: str = Field(..., description="کد ملی")
    password: str = Field(..., description="رمز عبور")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    national_id: str
    email: str | None = None
    first_name: str
    last_name: str
    phone: str | None = None
    is_admin: bool
    
    class Config:
        from_attributes = True


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest):
    """Register a new user."""
    if User.objects.filter(national_id=data.national_id).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="کاربر با این کد ملی قبلاً ثبت‌نام کرده است"
        )
    
    if data.email and User.objects.filter(email=data.email).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="کاربر با این ایمیل قبلاً ثبت‌نام کرده است"
        )
    
    user = User.objects.create_user(
        national_id=data.national_id,
        email=data.email,
        password=data.password,
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone
    )
    
    access_token = create_access_token(data={"sub": user.national_id})
    refresh_token = create_refresh_token(data={"sub": user.national_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):
    """Login user."""
    try:
        user = User.objects.get(national_id=data.national_id)
    except User.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="کد ملی یا رمز عبور اشتباه است"
        )
    
    if not check_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="کد ملی یا رمز عبور اشتباه است"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="حساب کاربری غیرفعال است"
        )
    
    access_token = create_access_token(data={"sub": user.national_id})
    refresh_token = create_refresh_token(data={"sub": user.national_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(refresh_token: str):
    """Refresh access token."""
    payload = decode_token(refresh_token)
    
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="توکن نامعتبر است"
        )
    
    national_id = payload.get("sub")
    if not national_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="توکن نامعتبر است"
        )
    
    access_token = create_access_token(data={"sub": national_id})
    new_refresh_token = create_refresh_token(data={"sub": national_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return UserResponse(
        id=str(current_user.id),
        national_id=current_user.national_id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        phone=current_user.phone,
        is_admin=current_user.is_admin
    )