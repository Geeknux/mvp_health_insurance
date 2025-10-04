"""
Admin configuration for User model.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


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