"""
Insurance API endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, UUID4
from apps.insurance.models import InsurancePlan, PlanCoverage, InsuranceRegistration
from apps.locations.models import School
from apps.users.models import User
from core.dependencies import get_current_active_user

router = APIRouter()


class CoverageResponse(BaseModel):
    id: str
    coverage_type: str
    title_fa: str
    description_fa: str
    coverage_amount: float
    coverage_percentage: int
    max_usage_count: int = None
    
    class Config:
        from_attributes = True


class PlanResponse(BaseModel):
    id: str
    name_fa: str
    plan_type: str
    description_fa: str
    monthly_premium: float
    is_active: bool
    coverages: List[CoverageResponse] = []
    
    class Config:
        from_attributes = True


class RegistrationRequest(BaseModel):
    plan_id: UUID4
    school_id: UUID4


class RegistrationResponse(BaseModel):
    id: str
    user_id: str
    plan_id: str
    school_id: str
    status: str
    registration_date: str
    start_date: str = None
    end_date: str = None
    
    class Config:
        from_attributes = True


@router.get("/plans", response_model=List[PlanResponse])
def get_insurance_plans():
    """Get all active insurance plans."""
    plans = InsurancePlan.objects.filter(is_active=True).prefetch_related('coverages')
    
    result = []
    for plan in plans:
        coverages = [
            CoverageResponse(
                id=str(cov.id),
                coverage_type=cov.coverage_type,
                title_fa=cov.title_fa,
                description_fa=cov.description_fa,
                coverage_amount=float(cov.coverage_amount),
                coverage_percentage=cov.coverage_percentage,
                max_usage_count=cov.max_usage_count
            )
            for cov in plan.coverages.filter(is_active=True)
        ]
        
        result.append(PlanResponse(
            id=str(plan.id),
            name_fa=plan.name_fa,
            plan_type=plan.plan_type,
            description_fa=plan.description_fa,
            monthly_premium=float(plan.monthly_premium),
            is_active=plan.is_active,
            coverages=coverages
        ))
    
    return result


@router.get("/plans/{plan_id}", response_model=PlanResponse)
def get_insurance_plan(plan_id: UUID4):
    """Get insurance plan details."""
    try:
        plan = InsurancePlan.objects.prefetch_related('coverages').get(id=plan_id, is_active=True)
    except InsurancePlan.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="طرح بیمه یافت نشد"
        )
    
    coverages = [
        CoverageResponse(
            id=str(cov.id),
            coverage_type=cov.coverage_type,
            title_fa=cov.title_fa,
            description_fa=cov.description_fa,
            coverage_amount=float(cov.coverage_amount),
            coverage_percentage=cov.coverage_percentage,
            max_usage_count=cov.max_usage_count
        )
        for cov in plan.coverages.filter(is_active=True)
    ]
    
    return PlanResponse(
        id=str(plan.id),
        name_fa=plan.name_fa,
        plan_type=plan.plan_type,
        description_fa=plan.description_fa,
        monthly_premium=float(plan.monthly_premium),
        is_active=plan.is_active,
        coverages=coverages
    )


@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_insurance(
    data: RegistrationRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Register for an insurance plan."""
    try:
        plan = InsurancePlan.objects.get(id=data.plan_id, is_active=True)
    except InsurancePlan.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="طرح بیمه یافت نشد"
        )
    
    try:
        school = School.objects.get(id=data.school_id)
    except School.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="مدرسه یافت نشد"
        )
    
    active_registration = InsuranceRegistration.objects.filter(
        user=current_user,
        status__in=['pending', 'approved', 'active']
    ).first()
    
    if active_registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شما قبلاً برای بیمه ثبت‌نام کرده‌اید"
        )
    
    registration = InsuranceRegistration.objects.create(
        user=current_user,
        plan=plan,
        school=school,
        status='pending'
    )
    
    return RegistrationResponse(
        id=str(registration.id),
        user_id=str(registration.user.id),
        plan_id=str(registration.plan.id),
        school_id=str(registration.school.id),
        status=registration.status,
        registration_date=registration.registration_date.isoformat(),
        start_date=registration.start_date.isoformat() if registration.start_date else None,
        end_date=registration.end_date.isoformat() if registration.end_date else None
    )


@router.get("/registrations", response_model=List[RegistrationResponse])
def get_user_registrations(current_user: User = Depends(get_current_active_user)):
    """Get user's insurance registrations."""
    registrations = InsuranceRegistration.objects.filter(user=current_user).select_related('plan', 'school')
    
    return [
        RegistrationResponse(
            id=str(reg.id),
            user_id=str(reg.user.id),
            plan_id=str(reg.plan.id),
            school_id=str(reg.school.id),
            status=reg.status,
            registration_date=reg.registration_date.isoformat(),
            start_date=reg.start_date.isoformat() if reg.start_date else None,
            end_date=reg.end_date.isoformat() if reg.end_date else None
        )
        for reg in registrations
    ]


@router.get("/registrations/{registration_id}", response_model=RegistrationResponse)
def get_registration_detail(
    registration_id: UUID4,
    current_user: User = Depends(get_current_active_user)
):
    """Get registration details."""
    try:
        registration = InsuranceRegistration.objects.select_related('plan', 'school').get(
            id=registration_id,
            user=current_user
        )
    except InsuranceRegistration.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ثبت‌نام یافت نشد"
        )
    
    return RegistrationResponse(
        id=str(registration.id),
        user_id=str(registration.user.id),
        plan_id=str(registration.plan.id),
        school_id=str(registration.school.id),
        status=registration.status,
        registration_date=registration.registration_date.isoformat(),
        start_date=registration.start_date.isoformat() if registration.start_date else None,
        end_date=registration.end_date.isoformat() if registration.end_date else None
    )