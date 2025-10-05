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
    address: Optional[str] = None
    phone: Optional[str] = None
    
    class Config:
        from_attributes = True


@router.get("/states", response_model=List[StateResponse])
def get_states():
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
def get_cities(state_id: UUID4 = Query(..., description="State ID")):
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
def get_counties(city_id: UUID4 = Query(..., description="City ID")):
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
def get_regions(county_id: UUID4 = Query(..., description="County ID")):
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
def get_districts(region_id: UUID4 = Query(..., description="Region ID")):
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
def get_schools(district_id: UUID4 = Query(..., description="District ID")):
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