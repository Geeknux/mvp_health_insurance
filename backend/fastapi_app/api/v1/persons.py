"""
API endpoints for Person management.
"""
from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from pydantic.types import UUID4

from apps.users.models import User, Person
from core.dependencies import get_current_user

router = APIRouter()


# Pydantic Models
class CreatePersonRequest(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    national_code: str = Field(..., min_length=10, max_length=10, pattern=r'^\d{10}$')
    birth_date: date
    relation: str = Field(..., pattern=r'^(spouse|child|parent|sibling|other)$')


class UpdatePersonRequest(BaseModel):
    first_name: str | None = Field(None, min_length=2, max_length=100)
    last_name: str | None = Field(None, min_length=2, max_length=100)
    national_code: str | None = Field(None, min_length=10, max_length=10, pattern=r'^\d{10}$')
    birth_date: date | None = None
    relation: str | None = Field(None, pattern=r'^(spouse|child|parent|sibling|other)$')


class PersonResponse(BaseModel):
    id: str
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


# Endpoints
@router.get("/", response_model=List[PersonResponse])
def get_user_persons(current_user: User = Depends(get_current_user)):
    """Get all persons for the current user."""
    persons = Person.objects.filter(user=current_user).order_by('-created_at')
    
    return [
        PersonResponse(
            id=str(person.id),
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


@router.post("/", response_model=PersonResponse, status_code=status.HTTP_201_CREATED)
def create_person(
    data: CreatePersonRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new person under the current user's care."""
    # Check if person with this national code already exists for this user
    if Person.objects.filter(user=current_user, national_code=data.national_code).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شخص با این کد ملی قبلاً ثبت شده است"
        )
    
    person = Person.objects.create(
        user=current_user,
        first_name=data.first_name,
        last_name=data.last_name,
        national_code=data.national_code,
        birth_date=data.birth_date,
        relation=data.relation
    )
    
    return PersonResponse(
        id=str(person.id),
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


@router.get("/{person_id}", response_model=PersonResponse)
def get_person(
    person_id: UUID4,
    current_user: User = Depends(get_current_user)
):
    """Get a specific person by ID."""
    try:
        person = Person.objects.get(id=person_id, user=current_user)
    except Person.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="شخص یافت نشد"
        )
    
    return PersonResponse(
        id=str(person.id),
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


@router.put("/{person_id}", response_model=PersonResponse)
def update_person(
    person_id: UUID4,
    data: UpdatePersonRequest,
    current_user: User = Depends(get_current_user)
):
    """Update a person's information."""
    try:
        person = Person.objects.get(id=person_id, user=current_user)
    except Person.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="شخص یافت نشد"
        )
    
    # Check for duplicate national code if updating
    if data.national_code and data.national_code != person.national_code:
        if Person.objects.filter(user=current_user, national_code=data.national_code).exists():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="شخص با این کد ملی قبلاً ثبت شده است"
            )
    
    # Update fields
    if data.first_name:
        person.first_name = data.first_name
    if data.last_name:
        person.last_name = data.last_name
    if data.national_code:
        person.national_code = data.national_code
    if data.birth_date:
        person.birth_date = data.birth_date
    if data.relation:
        person.relation = data.relation
    
    person.save()
    
    return PersonResponse(
        id=str(person.id),
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


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_person(
    person_id: UUID4,
    current_user: User = Depends(get_current_user)
):
    """Delete a person."""
    try:
        person = Person.objects.get(id=person_id, user=current_user)
        person.delete()
    except Person.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="شخص یافت نشد"
        )
