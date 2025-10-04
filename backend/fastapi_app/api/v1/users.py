"""
Users API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from apps.users.models import User
from core.dependencies import get_current_active_user

router = APIRouter()


class UserProfileUpdate(BaseModel):
    first_name: str = None
    last_name: str = None
    phone: str = None
    email: EmailStr = None


class UserProfileResponse(BaseModel):
    id: str
    national_id: str
    email: str
    first_name: str
    last_name: str
    phone: str = None
    is_admin: bool
    created_at: str
    
    class Config:
        from_attributes = True


@router.get("/profile", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_active_user)):
    """Get user profile."""
    return UserProfileResponse(
        id=str(current_user.id),
        national_id=current_user.national_id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        phone=current_user.phone,
        is_admin=current_user.is_admin,
        created_at=current_user.created_at.isoformat()
    )


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update user profile."""
    if data.first_name:
        current_user.first_name = data.first_name
    if data.last_name:
        current_user.last_name = data.last_name
    if data.phone:
        current_user.phone = data.phone
    if data.email:
        if User.objects.filter(email=data.email).exclude(id=current_user.id).exists():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="این ایمیل قبلاً استفاده شده است"
            )
        current_user.email = data.email
    
    current_user.save()
    
    return UserProfileResponse(
        id=str(current_user.id),
        national_id=current_user.national_id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        phone=current_user.phone,
        is_admin=current_user.is_admin,
        created_at=current_user.created_at.isoformat()
    )