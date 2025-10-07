"""
Statistics API endpoints for dashboard analytics.
"""
from typing import Dict, List, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
from django.db.models import Count, Q, Avg
from apps.users.models import User, Person
from apps.insurance.models import InsurancePlan, InsuranceRegistration
from apps.locations.models import School, State
from core.dependencies import get_current_user, get_current_admin_user

router = APIRouter()


# Response Models
class OverviewStats(BaseModel):
    total_users: int
    total_admins: int
    total_regular_users: int
    total_persons: int
    total_registrations: int
    total_schools: int
    total_plans: int
    active_registrations: int
    pending_registrations: int


class RegistrationStats(BaseModel):
    total: int
    pending: int
    approved: int
    rejected: int
    active: int
    expired: int
    by_plan: List[Dict[str, Any]]
    by_month: List[Dict[str, Any]]
    recent_registrations: int  # Last 30 days


class PersonStats(BaseModel):
    total: int
    by_relation: Dict[str, int]
    average_per_user: float
    age_distribution: Dict[str, int]


class SchoolStats(BaseModel):
    total: int
    by_type: Dict[str, int]
    by_state: List[Dict[str, Any]]
    top_schools: List[Dict[str, Any]]  # Schools with most registrations


class PlanStats(BaseModel):
    total: int
    active: int
    inactive: int
    by_type: Dict[str, int]
    popularity: List[Dict[str, Any]]  # Plans by registration count
    average_premium: float


class UserStats(BaseModel):
    total: int
    admins: int
    regular: int
    with_registrations: int
    without_registrations: int
    recent_signups: int  # Last 30 days


class DashboardStats(BaseModel):
    overview: OverviewStats
    registrations: RegistrationStats
    persons: PersonStats
    schools: SchoolStats
    plans: PlanStats
    users: UserStats


# Admin Statistics Endpoints
@router.get("/admin/overview", response_model=OverviewStats)
def get_admin_overview_stats(current_user: User = Depends(get_current_admin_user)):
    """Get overview statistics for admin dashboard."""
    total_users = User.objects.count()
    total_admins = User.objects.filter(is_admin=True).count()
    
    return OverviewStats(
        total_users=total_users,
        total_admins=total_admins,
        total_regular_users=total_users - total_admins,
        total_persons=Person.objects.count(),
        total_registrations=InsuranceRegistration.objects.count(),
        total_schools=School.objects.count(),
        total_plans=InsurancePlan.objects.count(),
        active_registrations=InsuranceRegistration.objects.filter(status='active').count(),
        pending_registrations=InsuranceRegistration.objects.filter(status='pending').count()
    )


@router.get("/admin/registrations", response_model=RegistrationStats)
def get_admin_registration_stats(current_user: User = Depends(get_current_admin_user)):
    """Get detailed registration statistics."""
    total = InsuranceRegistration.objects.count()
    
    # Count by status
    status_counts = {
        'pending': InsuranceRegistration.objects.filter(status='pending').count(),
        'approved': InsuranceRegistration.objects.filter(status='approved').count(),
        'rejected': InsuranceRegistration.objects.filter(status='rejected').count(),
        'active': InsuranceRegistration.objects.filter(status='active').count(),
        'expired': InsuranceRegistration.objects.filter(status='expired').count(),
    }
    
    # Registrations by plan
    by_plan = []
    plans = InsurancePlan.objects.all()
    for plan in plans:
        count = InsuranceRegistration.objects.filter(plan=plan).count()
        by_plan.append({
            'plan_id': str(plan.id),
            'plan_name': plan.name_fa,
            'count': count
        })
    
    # Registrations by month (last 6 months)
    by_month = []
    today = datetime.now()
    for i in range(6):
        month_start = (today - timedelta(days=30 * i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        count = InsuranceRegistration.objects.filter(
            registration_date__gte=month_start,
            registration_date__lte=month_end
        ).count()
        
        by_month.append({
            'month': month_start.strftime('%Y-%m'),
            'month_name': month_start.strftime('%B %Y'),
            'count': count
        })
    
    by_month.reverse()  # Oldest to newest
    
    # Recent registrations (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent = InsuranceRegistration.objects.filter(registration_date__gte=thirty_days_ago).count()
    
    return RegistrationStats(
        total=total,
        pending=status_counts['pending'],
        approved=status_counts['approved'],
        rejected=status_counts['rejected'],
        active=status_counts['active'],
        expired=status_counts['expired'],
        by_plan=by_plan,
        by_month=by_month,
        recent_registrations=recent
    )


@router.get("/admin/persons", response_model=PersonStats)
def get_admin_person_stats(current_user: User = Depends(get_current_admin_user)):
    """Get person/dependent statistics."""
    total = Person.objects.count()
    
    # Count by relation
    relations = ['spouse', 'child', 'parent', 'sibling', 'other']
    by_relation = {}
    for relation in relations:
        by_relation[relation] = Person.objects.filter(relation=relation).count()
    
    # Average persons per user
    users_with_persons = User.objects.filter(persons__isnull=False).distinct().count()
    average_per_user = total / users_with_persons if users_with_persons > 0 else 0
    
    # Age distribution
    today = datetime.now().date()
    age_distribution = {
        '0-10': 0,
        '11-20': 0,
        '21-30': 0,
        '31-40': 0,
        '41-50': 0,
        '51+': 0
    }
    
    persons = Person.objects.all()
    for person in persons:
        age = (today - person.birth_date).days // 365
        if age <= 10:
            age_distribution['0-10'] += 1
        elif age <= 20:
            age_distribution['11-20'] += 1
        elif age <= 30:
            age_distribution['21-30'] += 1
        elif age <= 40:
            age_distribution['31-40'] += 1
        elif age <= 50:
            age_distribution['41-50'] += 1
        else:
            age_distribution['51+'] += 1
    
    return PersonStats(
        total=total,
        by_relation=by_relation,
        average_per_user=round(average_per_user, 2),
        age_distribution=age_distribution
    )


@router.get("/admin/schools", response_model=SchoolStats)
def get_admin_school_stats(current_user: User = Depends(get_current_admin_user)):
    """Get school statistics."""
    total = School.objects.count()
    
    # Count by type
    school_types = ['elementary', 'middle', 'high']
    by_type = {}
    for school_type in school_types:
        by_type[school_type] = School.objects.filter(school_type=school_type).count()
    
    # Count by state
    by_state = []
    states = State.objects.all()[:10]  # Top 10 states
    for state in states:
        count = School.objects.filter(
            district__region__county__city__state=state
        ).count()
        if count > 0:
            by_state.append({
                'state_id': str(state.id),
                'state_name': state.name_fa,
                'count': count
            })
    
    # Top schools by registrations
    top_schools = []
    schools = School.objects.annotate(
        registration_count=Count('registrations')
    ).order_by('-registration_count')[:10]
    
    for school in schools:
        top_schools.append({
            'school_id': str(school.id),
            'school_name': school.name_fa,
            'school_type': school.school_type,
            'registration_count': school.registration_count
        })
    
    return SchoolStats(
        total=total,
        by_type=by_type,
        by_state=by_state,
        top_schools=top_schools
    )


@router.get("/admin/plans", response_model=PlanStats)
def get_admin_plan_stats(current_user: User = Depends(get_current_admin_user)):
    """Get insurance plan statistics."""
    total = InsurancePlan.objects.count()
    active = InsurancePlan.objects.filter(is_active=True).count()
    
    # Count by type
    plan_types = ['basic', 'standard', 'premium']
    by_type = {}
    for plan_type in plan_types:
        by_type[plan_type] = InsurancePlan.objects.filter(plan_type=plan_type).count()
    
    # Plan popularity (by registration count)
    popularity = []
    plans = InsurancePlan.objects.annotate(
        registration_count=Count('registrations')
    ).order_by('-registration_count')
    
    for plan in plans:
        popularity.append({
            'plan_id': str(plan.id),
            'plan_name': plan.name_fa,
            'plan_type': plan.plan_type,
            'registration_count': plan.registration_count,
            'monthly_premium': float(plan.monthly_premium)
        })
    
    # Average premium
    avg_premium = InsurancePlan.objects.aggregate(Avg('monthly_premium'))['monthly_premium__avg'] or 0
    
    return PlanStats(
        total=total,
        active=active,
        inactive=total - active,
        by_type=by_type,
        popularity=popularity,
        average_premium=round(float(avg_premium), 2)
    )


@router.get("/admin/users", response_model=UserStats)
def get_admin_user_stats(current_user: User = Depends(get_current_admin_user)):
    """Get user statistics."""
    total = User.objects.count()
    admins = User.objects.filter(is_admin=True).count()
    
    # Users with/without registrations
    with_registrations = User.objects.filter(registrations__isnull=False).distinct().count()
    
    # Recent signups (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent = User.objects.filter(created_at__gte=thirty_days_ago).count()
    
    return UserStats(
        total=total,
        admins=admins,
        regular=total - admins,
        with_registrations=with_registrations,
        without_registrations=total - with_registrations,
        recent_signups=recent
    )


@router.get("/admin/dashboard", response_model=DashboardStats)
def get_admin_dashboard_stats(current_user: User = Depends(get_current_admin_user)):
    """Get complete dashboard statistics (all stats in one call)."""
    return DashboardStats(
        overview=get_admin_overview_stats(current_user),
        registrations=get_admin_registration_stats(current_user),
        persons=get_admin_person_stats(current_user),
        schools=get_admin_school_stats(current_user),
        plans=get_admin_plan_stats(current_user),
        users=get_admin_user_stats(current_user)
    )


# User Statistics Endpoints
@router.get("/user/overview")
def get_user_overview_stats(current_user: User = Depends(get_current_user)):
    """Get overview statistics for regular user dashboard."""
    user_registrations = InsuranceRegistration.objects.filter(user=current_user)
    user_persons = Person.objects.filter(user=current_user)
    
    return {
        'total_registrations': user_registrations.count(),
        'active_registrations': user_registrations.filter(status='active').count(),
        'pending_registrations': user_registrations.filter(status='pending').count(),
        'total_persons': user_persons.count(),
        'available_plans': InsurancePlan.objects.filter(is_active=True).count(),
        'user_info': {
            'name': f"{current_user.first_name} {current_user.last_name}",
            'email': current_user.email,
            'national_id': current_user.national_id
        }
    }


@router.get("/user/registrations")
def get_user_registration_stats(current_user: User = Depends(get_current_user)):
    """Get user's registration statistics."""
    registrations = InsuranceRegistration.objects.filter(user=current_user)
    
    # Count by status
    by_status = {
        'pending': registrations.filter(status='pending').count(),
        'approved': registrations.filter(status='approved').count(),
        'rejected': registrations.filter(status='rejected').count(),
        'active': registrations.filter(status='active').count(),
        'expired': registrations.filter(status='expired').count(),
    }
    
    # By plan
    by_plan = []
    for reg in registrations:
        by_plan.append({
            'registration_id': str(reg.id),
            'plan_name': reg.plan.name_fa,
            'status': reg.status,
            'start_date': reg.start_date.isoformat() if reg.start_date else None,
            'end_date': reg.end_date.isoformat() if reg.end_date else None
        })
    
    return {
        'total': registrations.count(),
        'by_status': by_status,
        'by_plan': by_plan
    }


@router.get("/user/persons")
def get_user_person_stats(current_user: User = Depends(get_current_user)):
    """Get user's person/dependent statistics."""
    persons = Person.objects.filter(user=current_user)
    
    # Count by relation
    by_relation = {}
    for relation in ['spouse', 'child', 'parent', 'sibling', 'other']:
        by_relation[relation] = persons.filter(relation=relation).count()
    
    # Age distribution
    today = datetime.now().date()
    age_groups = {
        'children': 0,  # 0-18
        'adults': 0,    # 19-60
        'seniors': 0    # 61+
    }
    
    for person in persons:
        age = (today - person.birth_date).days // 365
        if age <= 18:
            age_groups['children'] += 1
        elif age <= 60:
            age_groups['adults'] += 1
        else:
            age_groups['seniors'] += 1
    
    return {
        'total': persons.count(),
        'by_relation': by_relation,
        'age_groups': age_groups
    }
