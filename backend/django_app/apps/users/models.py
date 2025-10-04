"""
User models for the Health Insurance system.
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom user manager for User model."""
    
    def create_user(self, national_id, email, password=None, **extra_fields):
        """Create and save a regular user."""
        if not national_id:
            raise ValueError('کد ملی الزامی است')
        if not email:
            raise ValueError('ایمیل الزامی است')
        
        email = self.normalize_email(email)
        user = self.model(national_id=national_id, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, national_id, email, password=None, **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(national_id, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model for the Health Insurance system."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    national_id = models.CharField(
        max_length=10,
        unique=True,
        verbose_name='کد ملی',
        help_text='کد ملی 10 رقمی'
    )
    first_name = models.CharField(max_length=100, verbose_name='نام')
    last_name = models.CharField(max_length=100, verbose_name='نام خانوادگی')
    email = models.EmailField(unique=True, verbose_name='ایمیل')
    phone = models.CharField(max_length=11, blank=True, null=True, verbose_name='تلفن همراه')
    
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    is_staff = models.BooleanField(default=False, verbose_name='کارمند')
    is_admin = models.BooleanField(default=False, verbose_name='مدیر')
    
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')
    
    objects = UserManager()
    
    USERNAME_FIELD = 'national_id'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'کاربر'
        verbose_name_plural = 'کاربران'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.national_id})"
    
    def get_full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}"
    
    def get_short_name(self):
        """Return the user's first name."""
        return self.first_name