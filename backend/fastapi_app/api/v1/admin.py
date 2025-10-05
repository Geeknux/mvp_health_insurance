"""
Admin API endpoints for managing insurance plans, coverages, and locations.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, UUID4, Field
from apps.insurance.models import InsurancePlan, PlanCoverage
from apps.locations.models import State, City, County, Region, District, School
from apps.users.models import User
from core.dependencies import get_current_admin_user

router = APIRouter()


class CreatePlanRequest(BaseModel):
    name_fa: str = Field(..., min_length=2, max_length=100)
    plan_type: str = Field(..., description="basic, standard, or premium")
    description_fa: str
    monthly_premium: float = Field(..., gt=0)


class UpdatePlanRequest(BaseModel):
    name_fa: str | None = None
    plan_type: str | None = None
    description_fa: str | None = None
    monthly_premium: float | None = None
    is_active: bool | None = None


class CreateCoverageRequest(BaseModel):
    plan_id: UUID4
    coverage_type: str = Field(..., description="outpatient, hospitalization, medication, etc.")
    title_fa: str = Field(..., min_length=2, max_length=100)
    description_fa: str
    coverage_amount: float = Field(..., gt=0)
    coverage_percentage: int = Field(..., ge=0, le=100)
    max_usage_count: int | None = None


class UpdateCoverageRequest(BaseModel):
    title_fa: str | None = None
    description_fa: str | None = None
    coverage_amount: float | None = None
    coverage_percentage: int | None = None
    max_usage_count: int | None = None
    is_active: bool | None = None


class PlanResponse(BaseModel):
    id: str
    name_fa: str
    plan_type: str
    description_fa: str
    monthly_premium: float
    is_active: bool
    created_at: str
    
    class Config:
        from_attributes = True


class CoverageResponse(BaseModel):
    id: str
    plan_id: str
    coverage_type: str
    title_fa: str
    description_fa: str
    coverage_amount: float
    coverage_percentage: int
    max_usage_count: int | None
    is_active: bool
    
    class Config:
        from_attributes = True


# Insurance Plan Management
@router.post("/plans", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(
    data: CreatePlanRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new insurance plan (Admin only)."""
    if InsurancePlan.objects.filter(name_fa=data.name_fa).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="طرح بیمه با این نام قبلاً ثبت شده است"
        )
    
    plan = InsurancePlan.objects.create(
        name_fa=data.name_fa,
        plan_type=data.plan_type,
        description_fa=data.description_fa,
        monthly_premium=data.monthly_premium
    )
    
    return PlanResponse(
        id=str(plan.id),
        name_fa=plan.name_fa,
        plan_type=plan.plan_type,
        description_fa=plan.description_fa,
        monthly_premium=float(plan.monthly_premium),
        is_active=plan.is_active,
        created_at=plan.created_at.isoformat()
    )


@router.get("/plans", response_model=List[PlanResponse])
def get_all_plans(current_user: User = Depends(get_current_admin_user)):
    """Get all insurance plans (Admin only)."""
    plans = InsurancePlan.objects.all()
    
    return [
        PlanResponse(
            id=str(plan.id),
            name_fa=plan.name_fa,
            plan_type=plan.plan_type,
            description_fa=plan.description_fa,
            monthly_premium=float(plan.monthly_premium),
            is_active=plan.is_active,
            created_at=plan.created_at.isoformat()
        )
        for plan in plans
    ]


@router.put("/plans/{plan_id}", response_model=PlanResponse)
def update_plan(
    plan_id: UUID4,
    data: UpdatePlanRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Update an insurance plan (Admin only)."""
    try:
        plan = InsurancePlan.objects.get(id=plan_id)
    except InsurancePlan.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="طرح بیمه یافت نشد"
        )
    
    if data.name_fa:
        plan.name_fa = data.name_fa
    if data.plan_type:
        plan.plan_type = data.plan_type
    if data.description_fa:
        plan.description_fa = data.description_fa
    if data.monthly_premium:
        plan.monthly_premium = data.monthly_premium
    if data.is_active is not None:
        plan.is_active = data.is_active
    
    plan.save()
    
    return PlanResponse(
        id=str(plan.id),
        name_fa=plan.name_fa,
        plan_type=plan.plan_type,
        description_fa=plan.description_fa,
        monthly_premium=float(plan.monthly_premium),
        is_active=plan.is_active,
        created_at=plan.created_at.isoformat()
    )


@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_id: UUID4,
    current_user: User = Depends(get_current_admin_user)
):
    """Deactivate an insurance plan (Admin only)."""
    try:
        plan = InsurancePlan.objects.get(id=plan_id)
        plan.is_active = False
        plan.save()
    except InsurancePlan.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="طرح بیمه یافت نشد"
        )


# Coverage Management
@router.post("/coverages", response_model=CoverageResponse, status_code=status.HTTP_201_CREATED)
def create_coverage(
    data: CreateCoverageRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new plan coverage (Admin only)."""
    try:
        plan = InsurancePlan.objects.get(id=data.plan_id)
    except InsurancePlan.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="طرح بیمه یافت نشد"
        )
    
    if PlanCoverage.objects.filter(plan=plan, coverage_type=data.coverage_type).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="این نوع پوشش برای این طرح قبلاً ثبت شده است"
        )
    
    coverage = PlanCoverage.objects.create(
        plan=plan,
        coverage_type=data.coverage_type,
        title_fa=data.title_fa,
        description_fa=data.description_fa,
        coverage_amount=data.coverage_amount,
        coverage_percentage=data.coverage_percentage,
        max_usage_count=data.max_usage_count
    )
    
    return CoverageResponse(
        id=str(coverage.id),
        plan_id=str(coverage.plan_id),
        coverage_type=coverage.coverage_type,
        title_fa=coverage.title_fa,
        description_fa=coverage.description_fa,
        coverage_amount=float(coverage.coverage_amount),
        coverage_percentage=coverage.coverage_percentage,
        max_usage_count=coverage.max_usage_count,
        is_active=coverage.is_active
    )


@router.get("/coverages", response_model=List[CoverageResponse])
def get_all_coverages(current_user: User = Depends(get_current_admin_user)):
    """Get all plan coverages (Admin only)."""
    coverages = PlanCoverage.objects.all().select_related('plan')
    
    return [
        CoverageResponse(
            id=str(cov.id),
            plan_id=str(cov.plan_id),
            coverage_type=cov.coverage_type,
            title_fa=cov.title_fa,
            description_fa=cov.description_fa,
            coverage_amount=float(cov.coverage_amount),
            coverage_percentage=cov.coverage_percentage,
            max_usage_count=cov.max_usage_count,
            is_active=cov.is_active
        )
        for cov in coverages
    ]


@router.put("/coverages/{coverage_id}", response_model=CoverageResponse)
def update_coverage(
    coverage_id: UUID4,
    data: UpdateCoverageRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Update a plan coverage (Admin only)."""
    try:
        coverage = PlanCoverage.objects.get(id=coverage_id)
    except PlanCoverage.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="پوشش بیمه یافت نشد"
        )
    
    if data.title_fa:
        coverage.title_fa = data.title_fa
    if data.description_fa:
        coverage.description_fa = data.description_fa
    if data.coverage_amount:
        coverage.coverage_amount = data.coverage_amount
    if data.coverage_percentage is not None:
        coverage.coverage_percentage = data.coverage_percentage
    if data.max_usage_count is not None:
        coverage.max_usage_count = data.max_usage_count
    if data.is_active is not None:
        coverage.is_active = data.is_active
    
    coverage.save()
    
    return CoverageResponse(
        id=str(coverage.id),
        plan_id=str(coverage.plan_id),
        coverage_type=coverage.coverage_type,
        title_fa=coverage.title_fa,
        description_fa=coverage.description_fa,
        coverage_amount=float(coverage.coverage_amount),
        coverage_percentage=coverage.coverage_percentage,
        max_usage_count=coverage.max_usage_count,
        is_active=coverage.is_active
    )


@router.delete("/coverages/{coverage_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_coverage(
    coverage_id: UUID4,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a plan coverage (Admin only)."""
    try:
        coverage = PlanCoverage.objects.get(id=coverage_id)
        coverage.delete()
    except PlanCoverage.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="پوشش بیمه یافت نشد"
        )


# School Management
class CreateSchoolRequest(BaseModel):
    district_id: UUID4
    name_fa: str = Field(..., min_length=2, max_length=200)
    code: str = Field(..., min_length=1, max_length=20)
    school_type: str = Field(..., description="elementary, middle, high, or combined")
    address: str | None = None
    phone: str | None = Field(None, min_length=11, max_length=11)


class UpdateSchoolRequest(BaseModel):
    name_fa: str | None = None
    code: str | None = None
    school_type: str | None = None
    address: str | None = None
    phone: str | None = None


class SchoolResponse(BaseModel):
    id: str
    district_id: str
    name_fa: str
    code: str
    school_type: str
    address: str | None
    phone: str | None
    created_at: str
    
    class Config:
        from_attributes = True


@router.post("/schools", response_model=SchoolResponse, status_code=status.HTTP_201_CREATED)
def create_school(
    data: CreateSchoolRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new school (Admin only)."""
    try:
        district = District.objects.get(id=data.district_id)
    except District.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ناحیه یافت نشد"
        )
    
    if School.objects.filter(code=data.code).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="مدرسه با این کد قبلاً ثبت شده است"
        )
    
    school = School.objects.create(
        district=district,
        name_fa=data.name_fa,
        code=data.code,
        school_type=data.school_type,
        address=data.address,
        phone=data.phone
    )
    
    return SchoolResponse(
        id=str(school.id),
        district_id=str(school.district_id),
        name_fa=school.name_fa,
        code=school.code,
        school_type=school.school_type,
        address=school.address,
        phone=school.phone,
        created_at=school.created_at.isoformat()
    )


@router.get("/schools", response_model=List[SchoolResponse])
def get_all_schools(current_user: User = Depends(get_current_admin_user)):
    """Get all schools (Admin only)."""
    schools = School.objects.all()
    
    return [
        SchoolResponse(
            id=str(school.id),
            district_id=str(school.district_id),
            name_fa=school.name_fa,
            code=school.code,
            school_type=school.school_type,
            address=school.address,
            phone=school.phone,
            created_at=school.created_at.isoformat()
        )
        for school in schools
    ]


@router.put("/schools/{school_id}", response_model=SchoolResponse)
def update_school(
    school_id: UUID4,
    data: UpdateSchoolRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Update a school (Admin only)."""
    try:
        school = School.objects.get(id=school_id)
    except School.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="مدرسه یافت نشد"
        )
    
    if data.name_fa:
        school.name_fa = data.name_fa
    if data.code:
        # Check if code is unique
        if School.objects.filter(code=data.code).exclude(id=school_id).exists():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="مدرسه با این کد قبلاً ثبت شده است"
            )
        school.code = data.code
    if data.school_type:
        school.school_type = data.school_type
    if data.address is not None:
        school.address = data.address
    if data.phone is not None:
        school.phone = data.phone
    
    school.save()
    
    return SchoolResponse(
        id=str(school.id),
        district_id=str(school.district_id),
        name_fa=school.name_fa,
        code=school.code,
        school_type=school.school_type,
        address=school.address,
        phone=school.phone,
        created_at=school.created_at.isoformat()
    )


@router.delete("/schools/{school_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_school(
    school_id: UUID4,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a school (Admin only)."""
    try:
        school = School.objects.get(id=school_id)
        school.delete()
    except School.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="مدرسه یافت نشد"
        )