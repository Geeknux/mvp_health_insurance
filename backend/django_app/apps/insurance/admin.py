"""
Admin configuration for Insurance models.
"""
from django.contrib import admin
from .models import InsurancePlan, PlanCoverage, InsuranceRegistration


class PlanCoverageInline(admin.TabularInline):
    """Inline admin for PlanCoverage."""
    model = PlanCoverage
    extra = 1
    fields = ['coverage_type', 'title_fa', 'coverage_amount', 'coverage_percentage', 'max_usage_count', 'is_active']


@admin.register(InsurancePlan)
class InsurancePlanAdmin(admin.ModelAdmin):
    """Admin interface for InsurancePlan model."""
    
    list_display = ['name_fa', 'plan_type', 'monthly_premium', 'is_active', 'created_at']
    list_filter = ['plan_type', 'is_active', 'created_at']
    search_fields = ['name_fa', 'description_fa']
    ordering = ['plan_type', 'name_fa']
    list_editable = ['is_active']
    inlines = [PlanCoverageInline]
    
    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('name_fa', 'plan_type', 'description_fa')
        }),
        ('اطلاعات مالی', {
            'fields': ('monthly_premium',)
        }),
        ('وضعیت', {
            'fields': ('is_active',)
        }),
        ('تاریخ‌ها', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PlanCoverage)
class PlanCoverageAdmin(admin.ModelAdmin):
    """Admin interface for PlanCoverage model."""
    
    list_display = ['plan', 'coverage_type', 'title_fa', 'coverage_amount', 'coverage_percentage', 'is_active']
    list_filter = ['plan', 'coverage_type', 'is_active']
    search_fields = ['title_fa', 'description_fa', 'plan__name_fa']
    ordering = ['plan', 'coverage_type']
    list_editable = ['is_active']
    
    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('plan', 'coverage_type', 'title_fa', 'description_fa')
        }),
        ('جزئیات پوشش', {
            'fields': ('coverage_amount', 'coverage_percentage', 'max_usage_count')
        }),
        ('وضعیت', {
            'fields': ('is_active',)
        }),
        ('تاریخ', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at']


@admin.register(InsuranceRegistration)
class InsuranceRegistrationAdmin(admin.ModelAdmin):
    """Admin interface for InsuranceRegistration model."""
    
    list_display = ['user', 'plan', 'school', 'status', 'registration_date', 'start_date', 'end_date']
    list_filter = ['status', 'plan', 'registration_date', 'start_date']
    search_fields = [
        'user__national_id',
        'user__first_name',
        'user__last_name',
        'user__email',
        'school__name_fa',
        'plan__name_fa'
    ]
    ordering = ['-registration_date']
    list_editable = ['status']
    date_hierarchy = 'registration_date'
    
    fieldsets = (
        ('اطلاعات کاربر', {
            'fields': ('user',)
        }),
        ('اطلاعات بیمه', {
            'fields': ('plan', 'school')
        }),
        ('وضعیت و تاریخ‌ها', {
            'fields': ('status', 'registration_date', 'start_date', 'end_date')
        }),
        ('اطلاعات تکمیلی', {
            'fields': ('additional_info',),
            'classes': ('collapse',)
        }),
        ('تاریخ‌های سیستم', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'registration_date']
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        return qs.select_related('user', 'plan', 'school')