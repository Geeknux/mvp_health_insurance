"""
User models for the Health Insurance system.
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom user manager for User model."""
    
    def create_user(self, national_id, email=None, password=None, **extra_fields):
        """Create and save a regular user."""
        if not national_id:
            raise ValueError('کد ملی الزامی است')
        
        if email:
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
    email = models.EmailField(unique=True, blank=True, null=True, verbose_name='ایمیل')
    phone = models.CharField(max_length=11, blank=True, null=True, verbose_name='تلفن همراه')
    
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    is_staff = models.BooleanField(default=False, verbose_name='کارمند')
    is_admin = models.BooleanField(default=False, verbose_name='مدیر')
    
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')
    
    objects = UserManager()
    
    USERNAME_FIELD = 'national_id'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
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


class Person(models.Model):
    """
    Person model for people under the care of insurance buyers.
    Represents dependents or beneficiaries of the insurance policy.
    """
    
    RELATION_CHOICES = [
        ('spouse', 'همسر'),
        ('child', 'فرزند'),
        ('parent', 'والدین'),
        ('sibling', 'خواهر/برادر'),
        ('other', 'سایر'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='persons',
        verbose_name='کاربر'
    )
    first_name = models.CharField(max_length=100, verbose_name='نام')
    last_name = models.CharField(max_length=100, verbose_name='نام خانوادگی')
    national_code = models.CharField(
        max_length=10,
        verbose_name='کد ملی',
        help_text='کد ملی 10 رقمی'
    )
    birth_date = models.DateField(verbose_name='تاریخ تولد')
    relation = models.CharField(
        max_length=20,
        choices=RELATION_CHOICES,
        verbose_name='نسبت با بیمه‌گذار'
    )
    
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')
    
    class Meta:
        db_table = 'persons'
        verbose_name = 'شخص'
        verbose_name_plural = 'اشخاص'
        ordering = ['-created_at']
        unique_together = [['user', 'national_code']]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.national_code})"
    
    def get_full_name(self):
        """Return the person's full name."""
        return f"{self.first_name} {self.last_name}"
    
    def get_age(self):
        """Calculate and return the person's age."""
        from datetime import date
        today = date.today()
        age = today.year - self.birth_date.year
        if today.month < self.birth_date.month or (today.month == self.birth_date.month and today.day < self.birth_date.day):
            age -= 1
        return age
    
    def get_relation_display_fa(self):
        """Return the Persian display name for the relation."""
        relation_dict = dict(self.RELATION_CHOICES)
        return relation_dict.get(self.relation, self.relation)


# Import Document model
from .documents import Document