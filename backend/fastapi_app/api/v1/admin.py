"""
Admin API endpoints for managing insurance plans, coverages, and locations.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, UUID4, Field
from apps.insurance.models import InsurancePlan, PlanCoverage, InsuranceRegistration
from apps.locations.models import State, City, County, Region, District, School
from apps.users.models import User, Person
from core.dependencies import get_current_admin_user
from datetime import date

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
    district_name: str
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
        district_name=school.district.name_fa,
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
    schools = School.objects.select_related('district').all()
    
    return [
        SchoolResponse(
            id=str(school.id),
            district_id=str(school.district_id),
            district_name=school.district.name_fa,
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
        district_name=school.district.name_fa,
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


# Location Management - State
class CreateStateRequest(BaseModel):
    name_fa: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=1, max_length=10)


class UpdateStateRequest(BaseModel):
    name_fa: str | None = None
    code: str | None = None


class StateResponse(BaseModel):
    id: str
    name_fa: str
    code: str
    created_at: str
    
    class Config:
        from_attributes = True


@router.post("/states", response_model=StateResponse, status_code=status.HTTP_201_CREATED)
def create_state(
    data: CreateStateRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new state (Admin only)."""
    if State.objects.filter(code=data.code).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="استان با این کد قبلاً ثبت شده است"
        )
    
    state = State.objects.create(
        name_fa=data.name_fa,
        code=data.code
    )
    
    return StateResponse(
        id=str(state.id),
        name_fa=state.name_fa,
        code=state.code,
        created_at=state.created_at.isoformat()
    )


@router.put("/states/{state_id}", response_model=StateResponse)
def update_state(
    state_id: UUID4,
    data: UpdateStateRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Update a state (Admin only)."""
    try:
        state = State.objects.get(id=state_id)
    except State.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="استان یافت نشد"
        )
    
    if data.name_fa:
        state.name_fa = data.name_fa
    if data.code:
        if State.objects.filter(code=data.code).exclude(id=state_id).exists():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="استان با این کد قبلاً ثبت شده است"
            )
        state.code = data.code
    
    state.save()
    
    return StateResponse(
        id=str(state.id),
        name_fa=state.name_fa,
        code=state.code,
        created_at=state.created_at.isoformat()
    )


@router.get("/states", response_model=List[StateResponse])
def get_all_states_admin(current_user: User = Depends(get_current_admin_user)):
    """Get all states (Admin only)."""
    states = State.objects.all().order_by('name_fa')
    
    return [
        StateResponse(
            id=str(state.id),
            name_fa=state.name_fa,
            code=state.code,
            created_at=state.created_at.isoformat()
        )
        for state in states
    ]


@router.delete("/states/{state_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_state(
    state_id: UUID4,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a state (Admin only)."""
    try:
        state = State.objects.get(id=state_id)
        state.delete()
    except State.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="استان یافت نشد"
        )


# Location Management - City
class CreateCityRequest(BaseModel):
    state_id: UUID4
    name_fa: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=1, max_length=10)


class UpdateCityRequest(BaseModel):
    name_fa: str | None = None
    code: str | None = None


class CityResponse(BaseModel):
    id: str
    state_id: str
    state_name: str
    name_fa: str
    code: str
    created_at: str
    
    class Config:
        from_attributes = True


@router.post("/cities", response_model=CityResponse, status_code=status.HTTP_201_CREATED)
def create_city(
    data: CreateCityRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new city (Admin only)."""
    try:
        state = State.objects.get(id=data.state_id)
    except State.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="استان یافت نشد"
        )
    
    if City.objects.filter(code=data.code).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شهر با این کد قبلاً ثبت شده است"
        )
    
    city = City.objects.create(
        state=state,
        name_fa=data.name_fa,
        code=data.code
    )
    
    return CityResponse(
        id=str(city.id),
        state_id=str(city.state_id),
        state_name=city.state.name_fa,
        name_fa=city.name_fa,
        code=city.code,
        created_at=city.created_at.isoformat()
    )


@router.put("/cities/{city_id}", response_model=CityResponse)
def update_city(
    city_id: UUID4,
    data: UpdateCityRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Update a city (Admin only)."""
    try:
        city = City.objects.get(id=city_id)
    except City.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="شهر یافت نشد"
        )
    
    if data.name_fa:
        city.name_fa = data.name_fa
    if data.code:
        if City.objects.filter(code=data.code).exclude(id=city_id).exists():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="شهر با این کد قبلاً ثبت شده است"
            )
        city.code = data.code
    
    city.save()
    
    return CityResponse(
        id=str(city.id),
        state_id=str(city.state_id),
        state_name=city.state.name_fa,
        name_fa=city.name_fa,
        code=city.code,
        created_at=city.created_at.isoformat()
    )


@router.get("/cities", response_model=List[CityResponse])
def get_all_cities_admin(current_user: User = Depends(get_current_admin_user)):
    """Get all cities (Admin only)."""
    cities = City.objects.select_related('state').all().order_by('name_fa')
    
    return [
        CityResponse(
            id=str(city.id),
            state_id=str(city.state_id),
            state_name=city.state.name_fa,
            name_fa=city.name_fa,
            code=city.code,
            created_at=city.created_at.isoformat()
        )
        for city in cities
    ]


@router.delete("/cities/{city_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_city(
    city_id: UUID4,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a city (Admin only)."""
    try:
        city = City.objects.get(id=city_id)
        city.delete()
    except City.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="شهر یافت نشد"
        )


# Location Management - County
class CreateCountyRequest(BaseModel):
    city_id: UUID4
    name_fa: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=1, max_length=10)


class UpdateCountyRequest(BaseModel):
    name_fa: str | None = None
    code: str | None = None


class CountyResponse(BaseModel):
    id: str
    city_id: str
    city_name: str
    name_fa: str
    code: str
    created_at: str
    
    class Config:
        from_attributes = True


@router.post("/counties", response_model=CountyResponse, status_code=status.HTTP_201_CREATED)
def create_county(
    data: CreateCountyRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new county (Admin only)."""
    try:
        city = City.objects.get(id=data.city_id)
    except City.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="شهر یافت نشد"
        )
    
    if County.objects.filter(code=data.code).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شهرستان با این کد قبلاً ثبت شده است"
        )
    
    county = County.objects.create(
        city=city,
        name_fa=data.name_fa,
        code=data.code
    )
    
    return CountyResponse(
        id=str(county.id),
        city_id=str(county.city_id),
        city_name=county.city.name_fa,
        name_fa=county.name_fa,
        code=county.code,
        created_at=county.created_at.isoformat()
    )


@router.put("/counties/{county_id}", response_model=CountyResponse)
def update_county(
    county_id: UUID4,
    data: UpdateCountyRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Update a county (Admin only)."""
    try:
        county = County.objects.get(id=county_id)
    except County.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="شهرستان یافت نشد"
        )
    
    if data.name_fa:
        county.name_fa = data.name_fa
    if data.code:
        if County.objects.filter(code=data.code).exclude(id=county_id).exists():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="شهرستان با این کد قبلاً ثبت شده است"
            )
        county.code = data.code
    
    county.save()
    
    return CountyResponse(
        id=str(county.id),
        city_id=str(county.city_id),
        city_name=county.city.name_fa,
        name_fa=county.name_fa,
        code=county.code,
        created_at=county.created_at.isoformat()
    )


@router.get("/counties", response_model=List[CountyResponse])
def get_all_counties_admin(current_user: User = Depends(get_current_admin_user)):
    """Get all counties (Admin only)."""
    counties = County.objects.select_related('city').all().order_by('name_fa')
    
    return [
        CountyResponse(
            id=str(county.id),
            city_id=str(county.city_id),
            city_name=county.city.name_fa,
            name_fa=county.name_fa,
            code=county.code,
            created_at=county.created_at.isoformat()
        )
        for county in counties
    ]


@router.delete("/counties/{county_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_county(
    county_id: UUID4,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a county (Admin only)."""
    try:
        county = County.objects.get(id=county_id)
        county.delete()
    except County.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="شهرستان یافت نشد"
        )


# Location Management - Region
class CreateRegionRequest(BaseModel):
    county_id: UUID4
    name_fa: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=1, max_length=10)


class UpdateRegionRequest(BaseModel):
    name_fa: str | None = None
    code: str | None = None


class RegionResponse(BaseModel):
    id: str
    county_id: str
    county_name: str
    name_fa: str
    code: str
    created_at: str
    
    class Config:
        from_attributes = True


@router.post("/regions", response_model=RegionResponse, status_code=status.HTTP_201_CREATED)
def create_region(
    data: CreateRegionRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new region (Admin only)."""
    try:
        county = County.objects.get(id=data.county_id)
    except County.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="شهرستان یافت نشد"
        )
    
    if Region.objects.filter(code=data.code).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="بخش با این کد قبلاً ثبت شده است"
        )
    
    region = Region.objects.create(
        county=county,
        name_fa=data.name_fa,
        code=data.code
    )
    
    return RegionResponse(
        id=str(region.id),
        county_id=str(region.county_id),
        county_name=region.county.name_fa,
        name_fa=region.name_fa,
        code=region.code,
        created_at=region.created_at.isoformat()
    )


@router.put("/regions/{region_id}", response_model=RegionResponse)
def update_region(
    region_id: UUID4,
    data: UpdateRegionRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Update a region (Admin only)."""
    try:
        region = Region.objects.get(id=region_id)
    except Region.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="بخش یافت نشد"
        )
    
    if data.name_fa:
        region.name_fa = data.name_fa
    if data.code:
        if Region.objects.filter(code=data.code).exclude(id=region_id).exists():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="بخش با این کد قبلاً ثبت شده است"
            )
        region.code = data.code
    
    region.save()
    
    return RegionResponse(
        id=str(region.id),
        county_id=str(region.county_id),
        county_name=region.county.name_fa,
        name_fa=region.name_fa,
        code=region.code,
        created_at=region.created_at.isoformat()
    )


@router.get("/regions", response_model=List[RegionResponse])
def get_all_regions_admin(current_user: User = Depends(get_current_admin_user)):
    """Get all regions (Admin only)."""
    regions = Region.objects.select_related('county').all().order_by('name_fa')
    
    return [
        RegionResponse(
            id=str(region.id),
            county_id=str(region.county_id),
            county_name=region.county.name_fa,
            name_fa=region.name_fa,
            code=region.code,
            created_at=region.created_at.isoformat()
        )
        for region in regions
    ]


@router.delete("/regions/{region_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_region(
    region_id: UUID4,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a region (Admin only)."""
    try:
        region = Region.objects.get(id=region_id)
        region.delete()
    except Region.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="بخش یافت نشد"
        )


# Location Management - District
class CreateDistrictRequest(BaseModel):
    region_id: UUID4
    name_fa: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=1, max_length=10)


class UpdateDistrictRequest(BaseModel):
    name_fa: str | None = None
    code: str | None = None


class DistrictResponse(BaseModel):
    id: str
    region_id: str
    region_name: str
    name_fa: str
    code: str
    created_at: str
    
    class Config:
        from_attributes = True


@router.post("/districts", response_model=DistrictResponse, status_code=status.HTTP_201_CREATED)
def create_district(
    data: CreateDistrictRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new district (Admin only)."""
    try:
        region = Region.objects.get(id=data.region_id)
    except Region.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="بخش یافت نشد"
        )
    
    if District.objects.filter(code=data.code).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ناحیه با این کد قبلاً ثبت شده است"
        )
    
    district = District.objects.create(
        region=region,
        name_fa=data.name_fa,
        code=data.code
    )
    
    return DistrictResponse(
        id=str(district.id),
        region_id=str(district.region_id),
        region_name=district.region.name_fa,
        name_fa=district.name_fa,
        code=district.code,
        created_at=district.created_at.isoformat()
    )


@router.put("/districts/{district_id}", response_model=DistrictResponse)
def update_district(
    district_id: UUID4,
    data: UpdateDistrictRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Update a district (Admin only)."""
    try:
        district = District.objects.get(id=district_id)
    except District.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ناحیه یافت نشد"
        )
    
    if data.name_fa:
        district.name_fa = data.name_fa
    if data.code:
        if District.objects.filter(code=data.code).exclude(id=district_id).exists():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ناحیه با این کد قبلاً ثبت شده است"
            )
        district.code = data.code
    
    district.save()
    
    return DistrictResponse(
        id=str(district.id),
        region_id=str(district.region_id),
        region_name=district.region.name_fa,
        name_fa=district.name_fa,
        code=district.code,
        created_at=district.created_at.isoformat()
    )


@router.get("/districts", response_model=List[DistrictResponse])
def get_all_districts_admin(current_user: User = Depends(get_current_admin_user)):
    """Get all districts (Admin only)."""
    districts = District.objects.select_related('region').all().order_by('name_fa')
    
    return [
        DistrictResponse(
            id=str(district.id),
            region_id=str(district.region_id),
            region_name=district.region.name_fa,
            name_fa=district.name_fa,
            code=district.code,
            created_at=district.created_at.isoformat()
        )
        for district in districts
    ]


@router.delete("/districts/{district_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_district(
    district_id: UUID4,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a district (Admin only)."""
    try:
        district = District.objects.get(id=district_id)
        district.delete()
    except District.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ناحیه یافت نشد"
        )


# Admin Statistics
class AdminStatsResponse(BaseModel):
    total_users: int
    total_plans: int
    active_plans: int
    total_coverages: int
    total_registrations: int
    pending_registrations: int
    approved_registrations: int
    active_registrations: int
    rejected_registrations: int
    total_schools: int
    total_states: int
    total_cities: int
    registrations_by_plan: List[dict]
    registrations_by_status: List[dict]
    recent_registrations: List[dict]


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_statistics(current_user: User = Depends(get_current_admin_user)):
    """Get admin dashboard statistics (Admin only)."""
    
    # Basic counts
    total_users = User.objects.count()
    total_plans = InsurancePlan.objects.count()
    active_plans = InsurancePlan.objects.filter(is_active=True).count()
    total_coverages = PlanCoverage.objects.count()
    total_registrations = InsuranceRegistration.objects.count()
    
    # Registration status counts
    pending_registrations = InsuranceRegistration.objects.filter(status='pending').count()
    approved_registrations = InsuranceRegistration.objects.filter(status='approved').count()
    active_registrations = InsuranceRegistration.objects.filter(status='active').count()
    rejected_registrations = InsuranceRegistration.objects.filter(status='rejected').count()
    
    # Location counts
    total_schools = School.objects.count()
    total_states = State.objects.count()
    total_cities = City.objects.count()
    
    # Registrations by plan
    registrations_by_plan = []
    for plan in InsurancePlan.objects.all():
        count = InsuranceRegistration.objects.filter(plan=plan).count()
        registrations_by_plan.append({
            'plan_name': plan.name_fa,
            'plan_type': plan.plan_type,
            'count': count
        })
    
    # Registrations by status
    registrations_by_status = [
        {'status': 'pending', 'label': 'در انتظار تایید', 'count': pending_registrations},
        {'status': 'approved', 'label': 'تایید شده', 'count': approved_registrations},
        {'status': 'active', 'label': 'فعال', 'count': active_registrations},
        {'status': 'rejected', 'label': 'رد شده', 'count': rejected_registrations},
    ]
    
    # Recent registrations
    recent_regs = InsuranceRegistration.objects.select_related('user', 'plan', 'school').order_by('-registration_date')[:5]
    recent_registrations = [
        {
            'id': str(reg.id),
            'user_name': f"{reg.user.first_name} {reg.user.last_name}",
            'plan_name': reg.plan.name_fa,
            'school_name': reg.school.name_fa,
            'status': reg.status,
            'registration_date': reg.registration_date.isoformat()
        }
        for reg in recent_regs
    ]
    
    return AdminStatsResponse(
        total_users=total_users,
        total_plans=total_plans,
        active_plans=active_plans,
        total_coverages=total_coverages,
        total_registrations=total_registrations,
        pending_registrations=pending_registrations,
        approved_registrations=approved_registrations,
        active_registrations=active_registrations,
        rejected_registrations=rejected_registrations,
        total_schools=total_schools,
        total_states=total_states,
        total_cities=total_cities,
        registrations_by_plan=registrations_by_plan,
        registrations_by_status=registrations_by_status,
        recent_registrations=recent_registrations
    )


# Registration Management
class RegistrationDetailResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_email: str
    user_national_id: str
    plan_id: str
    plan_name: str
    plan_type: str
    monthly_premium: float
    school_id: str
    school_name: str
    school_code: str
    status: str
    registration_date: str
    start_date: str | None
    end_date: str | None


class UpdateRegistrationStatusRequest(BaseModel):
    status: str = Field(..., description="pending, approved, active, rejected, cancelled")
    start_date: str | None = None
    end_date: str | None = None


@router.get("/registrations", response_model=List[dict])
def get_all_registrations(current_user: User = Depends(get_current_admin_user)):
    """Get all registrations (Admin only)."""
    registrations = InsuranceRegistration.objects.select_related('user', 'plan', 'school').order_by('-registration_date')
    
    return [
        {
            'id': str(reg.id),
            'user_name': f"{reg.user.first_name} {reg.user.last_name}",
            'plan_name': reg.plan.name_fa,
            'school_name': reg.school.name_fa,
            'status': reg.status,
            'registration_date': reg.registration_date.isoformat()
        }
        for reg in registrations
    ]


@router.get("/registrations/{registration_id}", response_model=RegistrationDetailResponse)
def get_registration_detail(
    registration_id: UUID4,
    current_user: User = Depends(get_current_admin_user)
):
    """Get registration details (Admin only)."""
    try:
        reg = InsuranceRegistration.objects.select_related('user', 'plan', 'school').get(id=registration_id)
    except InsuranceRegistration.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ثبت‌نام یافت نشد"
        )
    
    return RegistrationDetailResponse(
        id=str(reg.id),
        user_id=str(reg.user.id),
        user_name=f"{reg.user.first_name} {reg.user.last_name}",
        user_email=reg.user.email,
        user_national_id=reg.user.national_id,
        plan_id=str(reg.plan.id),
        plan_name=reg.plan.name_fa,
        plan_type=reg.plan.plan_type,
        monthly_premium=float(reg.plan.monthly_premium),
        school_id=str(reg.school.id),
        school_name=reg.school.name_fa,
        school_code=reg.school.code,
        status=reg.status,
        registration_date=reg.registration_date.isoformat(),
        start_date=reg.start_date.isoformat() if reg.start_date else None,
        end_date=reg.end_date.isoformat() if reg.end_date else None
    )


@router.put("/registrations/{registration_id}/status")
def update_registration_status(
    registration_id: UUID4,
    data: UpdateRegistrationStatusRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Update registration status (Admin only)."""
    try:
        reg = InsuranceRegistration.objects.get(id=registration_id)
    except InsuranceRegistration.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ثبت‌نام یافت نشد"
        )
    
    # Validate status
    valid_statuses = ['pending', 'approved', 'active', 'rejected', 'cancelled', 'expired']
    if data.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"وضعیت نامعتبر است. وضعیت‌های معتبر: {', '.join(valid_statuses)}"
        )
    
    reg.status = data.status
    
    # Update dates if provided
    if data.start_date:
        from datetime import datetime
        reg.start_date = datetime.fromisoformat(data.start_date.replace('Z', '+00:00'))
    
    if data.end_date:
        from datetime import datetime
        reg.end_date = datetime.fromisoformat(data.end_date.replace('Z', '+00:00'))
    
    reg.save()
    
    return {
        "message": "وضعیت ثبت‌نام با موفقیت به‌روزرسانی شد",
        "status": reg.status
    }


# Person Management Endpoints
class PersonAdminResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_national_id: str
    first_name: str
    last_name: str
    national_code: str
    birth_date: str
    relation: str
    relation_display: str
    age: int
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True


@router.get("/persons", response_model=List[PersonAdminResponse])
def get_all_persons_admin(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user)
):
    """Get all persons (Admin only)."""
    persons = Person.objects.select_related('user').all().order_by('-created_at')[skip:skip + limit]
    
    return [
        PersonAdminResponse(
            id=str(person.id),
            user_id=str(person.user.id),
            user_name=f"{person.user.first_name} {person.user.last_name}",
            user_national_id=person.user.national_id,
            first_name=person.first_name,
            last_name=person.last_name,
            national_code=person.national_code,
            birth_date=person.birth_date.isoformat(),
            relation=person.relation,
            relation_display=person.get_relation_display_fa(),
            age=person.get_age(),
            created_at=person.created_at.isoformat(),
            updated_at=person.updated_at.isoformat()
        )
        for person in persons
    ]


@router.get("/persons/{person_id}", response_model=PersonAdminResponse)
def get_person_admin(
    person_id: UUID4,
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific person by ID (Admin only)."""
    try:
        person = Person.objects.select_related('user').get(id=person_id)
    except Person.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="شخص یافت نشد"
        )
    
    return PersonAdminResponse(
        id=str(person.id),
        user_id=str(person.user.id),
        user_name=f"{person.user.first_name} {person.user.last_name}",
        user_national_id=person.user.national_id,
        first_name=person.first_name,
        last_name=person.last_name,
        national_code=person.national_code,
        birth_date=person.birth_date.isoformat(),
        relation=person.relation,
        relation_display=person.get_relation_display_fa(),
        age=person.get_age(),
        created_at=person.created_at.isoformat(),
        updated_at=person.updated_at.isoformat()
    )


@router.delete("/persons/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_person_admin(
    person_id: UUID4,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a person (Admin only)."""
    try:
        person = Person.objects.get(id=person_id)
        person.delete()
    except Person.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="شخص یافت نشد"
        )


@router.get("/users/{user_id}/persons", response_model=List[PersonAdminResponse])
def get_user_persons_admin(
    user_id: UUID4,
    current_user: User = Depends(get_current_admin_user)
):
    """Get all persons for a specific user (Admin only)."""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربر یافت نشد"
        )
    
    persons = Person.objects.filter(user=user).order_by('-created_at')
    
    return [
        PersonAdminResponse(
            id=str(person.id),
            user_id=str(person.user.id),
            user_name=f"{person.user.first_name} {person.user.last_name}",
            user_national_id=person.user.national_id,
            first_name=person.first_name,
            last_name=person.last_name,
            national_code=person.national_code,
            birth_date=person.birth_date.isoformat(),
            relation=person.relation,
            relation_display=person.get_relation_display_fa(),
            age=person.get_age(),
            created_at=person.created_at.isoformat(),
            updated_at=person.updated_at.isoformat()
        )
        for person in persons
    ]


# User Password Management Models
class UpdateUserPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=6, max_length=100)


class ResetUserPasswordRequest(BaseModel):
    default_password: str = Field(default="user123", min_length=6, max_length=100)


class UserPasswordResponse(BaseModel):
    user_id: str
    national_id: str
    full_name: str
    message: str


# User Password Management Endpoints
@router.put("/users/{user_id}/password", response_model=UserPasswordResponse)
def update_user_password(
    user_id: UUID4,
    data: UpdateUserPasswordRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Update a user's password (Admin only)."""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربر یافت نشد"
        )
    
    # Set new password
    user.set_password(data.new_password)
    user.save()
    
    return UserPasswordResponse(
        user_id=str(user.id),
        national_id=user.national_id,
        full_name=f"{user.first_name} {user.last_name}",
        message="رمز عبور با موفقیت تغییر یافت"
    )


@router.post("/users/{user_id}/reset-password", response_model=UserPasswordResponse)
def reset_user_password(
    user_id: UUID4,
    data: ResetUserPasswordRequest = ResetUserPasswordRequest(),
    current_user: User = Depends(get_current_admin_user)
):
    """Reset a user's password to default (Admin only)."""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربر یافت نشد"
        )
    
    # Reset to default password
    user.set_password(data.default_password)
    user.save()
    
    return UserPasswordResponse(
        user_id=str(user.id),
        national_id=user.national_id,
        full_name=f"{user.first_name} {user.last_name}",
        message=f"رمز عبور به حالت پیش‌فرض بازنشانی شد: {data.default_password}"
    )


@router.get("/users", response_model=List[dict])
def get_all_users(
    current_user: User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100
):
    """Get all users (Admin only)."""
    users = User.objects.all().order_by('-created_at')[skip:skip + limit]
    
    return [
        {
            'id': str(user.id),
            'national_id': user.national_id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'is_admin': user.is_admin,
            'is_active': user.is_active,
            'created_at': user.created_at.isoformat(),
        }
        for user in users
    ]


@router.get("/users/{user_id}", response_model=dict)
def get_user_by_id(
    user_id: UUID4,
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific user by ID (Admin only)."""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربر یافت نشد"
        )
    
    return {
        'id': str(user.id),
        'national_id': user.national_id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone': user.phone,
        'is_admin': user.is_admin,
        'is_active': user.is_active,
        'created_at': user.created_at.isoformat(),
        'updated_at': user.updated_at.isoformat(),
    }