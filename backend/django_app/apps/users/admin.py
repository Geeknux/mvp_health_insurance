"""
Admin configuration for User model.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Person


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model."""
    
    list_display = ['national_id', 'email', 'first_name', 'last_name', 'is_admin', 'is_active', 'created_at']
    list_filter = ['is_admin', 'is_active', 'is_staff', 'created_at']
    search_fields = ['national_id', 'email', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']
    
    fieldsets = (
        ('اطلاعات احراز هویت', {
            'fields': ('national_id', 'email', 'password')
        }),
        ('اطلاعات شخصی', {
            'fields': ('first_name', 'last_name', 'phone')
        }),
        ('دسترسی‌ها', {
            'fields': ('is_active', 'is_staff', 'is_admin', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('تاریخ‌ها', {
            'fields': ('created_at', 'updated_at', 'last_login')
        }),
    )
    
    add_fieldsets = (
        ('ایجاد کاربر جدید', {
            'classes': ('wide',),
            'fields': ('national_id', 'email', 'first_name', 'last_name', 'password1', 'password2', 'is_admin'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login']


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    """Admin interface for Person model."""
    
    list_display = ['national_code', 'first_name', 'last_name', 'relation', 'birth_date', 'user', 'created_at']
    list_filter = ['relation', 'created_at']
    search_fields = ['national_code', 'first_name', 'last_name', 'user__national_id', 'user__email']
    ordering = ['-created_at']
    
    fieldsets = (
        ('اطلاعات شخصی', {
            'fields': ('first_name', 'last_name', 'national_code', 'birth_date')
        }),
        ('ارتباط با بیمه‌گذار', {
            'fields': ('user', 'relation')
        }),
        ('تاریخ‌ها', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        return qs.select_related('user')