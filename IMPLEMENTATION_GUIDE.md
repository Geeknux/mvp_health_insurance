# Health Insurance MVP - Implementation Guide

This document provides the complete implementation details for the remaining components of the Health Insurance Management System.

## Current Status

✅ **Completed:**
- Project structure and Docker configuration
- Django models (User, Location hierarchy, Insurance models)
- FastAPI core configuration (settings, security, dependencies)
- Main FastAPI application setup

🔄 **Remaining:**
- API endpoints implementation
- Frontend Next.js application
- Data seeding scripts
- Documentation

---

## API Endpoints Implementation

### 1. Authentication Endpoints (`backend/fastapi_app/api/v1/auth.py`)

```python
"""
Authentication API endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from apps.users.models import User
from core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token

router = APIRouter()


class RegisterRequest(BaseModel):
    national_id: str = Field(..., min_length=10, max_length=10, description="کد ملی")
    email: EmailStr = Field(..., description="ایمیل")
    first_name: str = Field(..., min_length=2, max_length=100, description="نام")
    last_name: str = Field(..., min_length=2, max_length=100, description="نام خانوادگی")
    phone: str = Field(None, min_length=11, max_length=11, description="تلفن همراه")
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
    email: str
    first_name: str
    last_name: str
    phone: str = None
    is_admin: bool
    
    class Config:
        from_attributes = True


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest):
    """Register a new user."""
    # Check if user already exists
    if User.objects.filter(national_id=data.national_id).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="کاربر با این کد ملی قبلاً ثبت‌نام کرده است"
        )
    
    if User.objects.filter(email=data.email).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="کاربر با این ایمیل قبلاً ثبت‌نام کرده است"
        )
    
    # Create user
    user = User.objects.create_user(
        national_id=data.national_id,
        email=data.email,
        password=data.password,
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone
    )
    
    # Generate tokens
    access_token = create_access_token(data={"sub": user.national_id})
    refresh_token = create_refresh_token(data={"sub": user.national_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    """Login user."""
    try:
        user = User.objects.get(national_id=data.national_id)
    except User.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="کد ملی یا رمز عبور اشتباه است"
        )
    
    if not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="کد ملی یا رمز عبور اشتباه است"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="حساب کاربری غیرفعال است"
        )
    
    # Generate tokens
    access_token = create_access_token(data={"sub": user.national_id})
    refresh_token = create_refresh_token(data={"sub": user.national_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
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
    
    # Generate new tokens
    access_token = create_access_token(data={"sub": national_id})
    new_refresh_token = create_refresh_token(data={"sub": national_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
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
```

### 2. Users Endpoints (`backend/fastapi_app/api/v1/users.py`)

```python
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
async def get_profile(current_user: User = Depends(get_current_active_user)):
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
async def update_profile(
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
        # Check if email is already taken
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
```

### 3. Insurance Endpoints (`backend/fastapi_app/api/v1/insurance.py`)

```python
"""
Insurance API endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, UUID4
from datetime import date
from apps.insurance.models import InsurancePlan, PlanCoverage, InsuranceRegistration
from apps.locations.models import School
from apps.users.models import User
from core.dependencies import get_current_active_user, get_current_admin_user

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
async def get_insurance_plans():
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
async def get_insurance_plan(plan_id: UUID4):
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
async def register_insurance(
    data: RegistrationRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Register for an insurance plan."""
    # Verify plan exists
    try:
        plan = InsurancePlan.objects.get(id=data.plan_id, is_active=True)
    except InsurancePlan.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="طرح بیمه یافت نشد"
        )
    
    # Verify school exists
    try:
        school = School.objects.get(id=data.school_id)
    except School.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="مدرسه یافت نشد"
        )
    
    # Check if user already has an active registration
    active_registration = InsuranceRegistration.objects.filter(
        user=current_user,
        status__in=['pending', 'approved', 'active']
    ).first()
    
    if active_registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شما قبلاً برای بیمه ثبت‌نام کرده‌اید"
        )
    
    # Create registration
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
async def get_user_registrations(current_user: User = Depends(get_current_active_user)):
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
async def get_registration_detail(
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
```

### 4. Locations Endpoints (`backend/fastapi_app/api/v1/locations.py`)

```python
"""
Locations API endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel, UUID4
from apps.locations.models import State, City, County, Region, District, School

router = APIRouter()


class StateResponse(BaseModel):
    id: str
    name_fa: str
    code: str
    
    class Config:
        from_attributes = True


class CityResponse(BaseModel):
    id: str
    state_id: str
    name_fa: str
    code: str
    
    class Config:
        from_attributes = True


class CountyResponse(BaseModel):
    id: str
    city_id: str
    name_fa: str
    code: str
    
    class Config:
        from_attributes = True


class RegionResponse(BaseModel):
    id: str
    county_id: str
    name_fa: str
    code: str
    
    class Config:
        from_attributes = True


class DistrictResponse(BaseModel):
    id: str
    region_id: str
    name_fa: str
    code: str
    
    class Config:
        from_attributes = True


class SchoolResponse(BaseModel):
    id: str
    district_id: str
    name_fa: str
    code: str
    school_type: str
    address: str = None
    phone: str = None
    
    class Config:
        from_attributes = True


@router.get("/states", response_model=List[StateResponse])
async def get_states():
    """Get all states."""
    states = State.objects.all()
    return [
        StateResponse(
            id=str(state.id),
            name_fa=state.name_fa,
            code=state.code
        )
        for state in states
    ]


@router.get("/cities", response_model=List[CityResponse])
async def get_cities(state_id: UUID4 = Query(..., description="State ID")):
    """Get cities by state."""
    cities = City.objects.filter(state_id=state_id)
    return [
        CityResponse(
            id=str(city.id),
            state_id=str(city.state_id),
            name_fa=city.name_fa,
            code=city.code
        )
        for city in cities
    ]


@router.get("/counties", response_model=List[CountyResponse])
async def get_counties(city_id: UUID4 = Query(..., description="City ID")):
    """Get counties by city."""
    counties = County.objects.filter(city_id=city_id)
    return [
        CountyResponse(
            id=str(county.id),
            city_id=str(county.city_id),
            name_fa=county.name_fa,
            code=county.code
        )
        for county in counties
    ]


@router.get("/regions", response_model=List[RegionResponse])
async def get_regions(county_id: UUID4 = Query(..., description="County ID")):
    """Get regions by county."""
    regions = Region.objects.filter(county_id=county_id)
    return [
        RegionResponse(
            id=str(region.id),
            county_id=str(region.county_id),
            name_fa=region.name_fa,
            code=region.code
        )
        for region in regions
    ]


@router.get("/districts", response_model=List[DistrictResponse])
async def get_districts(region_id: UUID4 = Query(..., description="Region ID")):
    """Get districts by region."""
    districts = District.objects.filter(region_id=region_id)
    return [
        DistrictResponse(
            id=str(district.id),
            region_id=str(district.region_id),
            name_fa=district.name_fa,
            code=district.code
        )
        for district in districts
    ]


@router.get("/schools", response_model=List[SchoolResponse])
async def get_schools(district_id: UUID4 = Query(..., description="District ID")):
    """Get schools by district."""
    schools = School.objects.filter(district_id=district_id)
    return [
        SchoolResponse(
            id=str(school.id),
            district_id=str(school.district_id),
            name_fa=school.name_fa,
            code=school.code,
            school_type=school.school_type,
            address=school.address,
            phone=school.phone
        )
        for school in schools
    ]
```

---

## Frontend Next.js Application

### Project Structure

```
frontend/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── insurance/
│   │   │   ├── plans/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── plans/
│   │       ├── registrations/
│   │       └── locations/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Select.tsx
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── LocationSelector.tsx
│   │   └── layouts/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── types/
│       ├── user.ts
│       ├── insurance.ts
│       └── location.ts
└── public/
    └── fonts/
```

### Key Configuration Files

#### `package.json`
```json
{
  "name": "health-insurance-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "tailwindcss": "^3.3.0",
    "clsx": "^2.0.0",
    "date-fns-jalali": "^2.30.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

#### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['fa'],
    defaultLocale: 'fa',
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig
```

#### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazir', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
}
```

#### `Dockerfile` for Frontend
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

---

## Data Seeding Script

Create `backend/django_app/seed_data.py`:

```python
"""
Data seeding script for initial data.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.locations.models import State, City, County, Region, District, School
from apps.insurance.models import InsurancePlan, PlanCoverage


def seed_admin_user():
    """Create admin user."""
    if not User.objects.filter(national_id='0000000000').exists():
        User.objects.create_superuser(
            national_id='0000000000',
            email='admin@example.com',
            password='admin123',
            first_name='مدیر',
            last_name='سیستم'
        )
        print("✅ Admin user created")


def seed_states():
    """Seed Iranian provinces."""
    states_data = [
        ('تهران', '01', 1),
        ('اصفهان', '02', 2),
        ('فارس', '03', 3),
        ('خراسان رضوی', '04', 4),
        ('آذربایجان شرقی', '05', 5),
    ]
    
    for name, code, order in states_data:
        State.objects.get_or_create(
            code=code,
            defaults={'name_fa': name, 'order_index': order}
        )
    print("✅ States seeded")


def seed_insurance_plans():
    """Seed insurance plans with coverages."""
    plans_data = [
        {
            'name_fa': 'بیمه پایه',
            'plan_type': 'basic',
            'description_fa': 'بیمه تکمیلی پایه برای کارکنان آموزش و پرورش',
            'monthly_premium': 500000,
            'coverages': [
                ('outpatient', 'درمان سرپایی', 'پوشش هزینه‌های ویزیت و درمان سرپایی', 5000000, 70, 10),
                ('hospitalization', 'بستری', 'پوشش هزینه‌های بستری در بیمارستان', 50000000, 90, None),
                ('medication', 'دارو', 'پوشش هزینه‌های دارویی', 3000000, 80, None),
            ]
        },
        {
            'name_fa': 'بیمه استاندارد',
            'plan_type': 'standard',
            'description_fa': 'بیمه تکمیلی استاندارد با پوشش بیشتر',
            'monthly_premium': 800000,
            'coverages': [
                ('outpatient', 'درمان سرپایی', 'پوشش هزینه‌های ویزیت و درمان سرپایی', 8000000, 80, 15),
                ('hospitalization', 'بستری', 'پوشش هزینه‌های بستری در بیمارستان', 80000000, 95, None),
                ('medication', 'دارو', 'پوشش هزینه‌های دارویی', 5000000, 85, None),
                ('dental', 'دندانپزشکی', 'پوشش هزینه‌های دندانپزشکی', 3000000, 70, 5),
            ]
        },
        {
            'name_fa': 'بیمه ویژه',
            'plan_type': 'premium',
            'description_fa': 'بیمه تکمیلی ویژه با بالاترین پوشش',
            'monthly_premium': 1200000,
            'coverages': [
                ('outpatient', 'درمان سرپایی', 'پوشش هزینه‌های ویزیت و درمان سرپایی', 12000000, 90, 20),
                ('hospitalization', 'بستری', 'پوشش هزینه‌های بستری در بیمارستان', 100000000, 100, None),
                ('medication', 'دارو', 'پوشش هزینه‌های دارویی', 8000000, 90, None),
                ('dental', 'دندانپزشکی', 'پوشش هزینه‌های دندانپزشکی', 5000000, 80, 10),
                ('ophthalmology', 'چشم‌پزشکی', 'پوشش هزینه‌های چشم‌پزشکی', 4000000, 75, 5),
            ]
        },
    ]
    
    for plan_data in plans_data:
        coverages_data = plan_data.pop('coverages')
        plan, created = InsurancePlan.objects.get_or_create(
            name_fa=plan_data['name_fa'],
            defaults=plan_data
        )
        
        if created:
            for cov_type, title, desc, amount, percentage, max_usage in coverages_data:
                PlanCoverage.objects.create(
                    plan=plan,
                    coverage_type=cov_type,
                    title_fa=title,
                    description_fa=desc,
                    coverage_amount=amount,
                    coverage_percentage=percentage,
                    max_usage_count=max_usage
                )
    
    print("✅ Insurance plans seeded")


if __name__ == '__main__':
    print("🌱 Starting data seeding...")
    seed_admin_user()
    seed_states()
    seed_insurance_plans()
    print("✅ Data seeding completed!")
```

---

## Running the Application

### 1. Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd health-insurance-mvp

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Build and Start Services

```bash
# Build and start all services
docker-compose up --build

# In a new terminal, run migrations
docker-compose exec backend python django_app/manage.py migrate

# Create superuser
docker-compose exec backend python django_app/manage.py createsuperuser

# Seed initial data
docker-compose exec backend python django_app/seed_data.py
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Django Admin**: http://localhost:8000/admin

---

## Next Steps

1. Complete the API endpoint files as shown above
2. Implement the Next.js frontend components
3. Add comprehensive error handling
4. Implement logging
5. Add unit and integration tests
6. Set up CI/CD pipeline
7. Configure production environment
8. Add monitoring and analytics

---

## Support

For questions or issues, please contact the development team.