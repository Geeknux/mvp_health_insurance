"""
Admin configuration for Location models.
"""
from django.contrib import admin
from .models import State, City, County, Region, District, School


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    """Admin interface for State model."""
    
    list_display = ['name_fa', 'code', 'order_index', 'created_at']
    search_fields = ['name_fa', 'code']
    ordering = ['order_index', 'name_fa']
    list_editable = ['order_index']


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    """Admin interface for City model."""
    
    list_display = ['name_fa', 'state', 'code', 'created_at']
    list_filter = ['state']
    search_fields = ['name_fa', 'code']
    ordering = ['state__name_fa', 'name_fa']
    autocomplete_fields = ['state']


@admin.register(County)
class CountyAdmin(admin.ModelAdmin):
    """Admin interface for County model."""
    
    list_display = ['name_fa', 'city', 'code', 'created_at']
    list_filter = ['city__state']
    search_fields = ['name_fa', 'code', 'city__name_fa']
    ordering = ['city__name_fa', 'name_fa']
    autocomplete_fields = ['city']


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    """Admin interface for Region model."""
    
    list_display = ['name_fa', 'county', 'code', 'created_at']
    list_filter = ['county__city__state']
    search_fields = ['name_fa', 'code', 'county__name_fa']
    ordering = ['county__name_fa', 'name_fa']
    autocomplete_fields = ['county']


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    """Admin interface for District model."""
    
    list_display = ['name_fa', 'region', 'code', 'created_at']
    list_filter = ['region__county__city__state']
    search_fields = ['name_fa', 'code', 'region__name_fa']
    ordering = ['region__name_fa', 'name_fa']
    autocomplete_fields = ['region']


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    """Admin interface for School model."""
    
    list_display = ['name_fa', 'code', 'school_type', 'district', 'phone', 'created_at']
    list_filter = ['school_type', 'district__region__county__city__state']
    search_fields = ['name_fa', 'code', 'address', 'phone']
    ordering = ['name_fa']
    autocomplete_fields = ['district']
    
    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('name_fa', 'code', 'school_type', 'district')
        }),
        ('اطلاعات تماس', {
            'fields': ('address', 'phone')
        }),
        ('تاریخ', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at']