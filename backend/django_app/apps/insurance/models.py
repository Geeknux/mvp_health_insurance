"""
Insurance models for the Health Insurance system.
"""
import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings


class InsurancePlan(models.Model):
    """Insurance Plan model - طرح بیمه"""
    
    PLAN_TYPE_CHOICES = [
        ('basic', 'پایه'),
        ('standard', 'استاندارد'),
        ('premium', 'ویژه'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name_fa = models.CharField(max_length=100, unique=True, verbose_name='نام طرح')
    plan_type = models.CharField(
        max_length=20,
        choices=PLAN_TYPE_CHOICES,
        default='basic',
        verbose_name='نوع طرح'
    )
    description_fa = models.TextField(verbose_name='توضیحات')
    monthly_premium = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        verbose_name='حق بیمه ماهانه (ریال)'
    )
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')
    
    class Meta:
        db_table = 'insurance_plans'
        verbose_name = 'طرح بیمه'
        verbose_name_plural = 'طرح‌های بیمه'
        ordering = ['plan_type', 'name_fa']
    
    def __str__(self):
        return f"{self.name_fa} ({self.get_plan_type_display()})"


class PlanCoverage(models.Model):
    """Plan Coverage model - پوشش بیمه"""
    
    COVERAGE_TYPE_CHOICES = [
        ('outpatient', 'درمان سرپایی'),
        ('hospitalization', 'بستری'),
        ('medication', 'دارو'),
        ('laboratory', 'آزمایش'),
        ('imaging', 'تصویربرداری'),
        ('dental', 'دندانپزشکی'),
        ('ophthalmology', 'چشم‌پزشکی'),
        ('physiotherapy', 'فیزیوتراپی'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan = models.ForeignKey(
        InsurancePlan,
        on_delete=models.CASCADE,
        related_name='coverages',
        verbose_name='طرح بیمه'
    )
    coverage_type = models.CharField(
        max_length=20,
        choices=COVERAGE_TYPE_CHOICES,
        verbose_name='نوع پوشش'
    )
    title_fa = models.CharField(max_length=100, verbose_name='عنوان')
    description_fa = models.TextField(verbose_name='توضیحات')
    coverage_amount = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        verbose_name='سقف پوشش (ریال)',
        help_text='حداکثر مبلغ قابل پرداخت'
    )
    coverage_percentage = models.IntegerField(
        verbose_name='درصد پوشش',
        help_text='درصد پوشش هزینه (0-100)'
    )
    max_usage_count = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='تعداد استفاده مجاز',
        help_text='حداکثر تعداد دفعات استفاده در سال (خالی = نامحدود)'
    )
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاریخ ایجاد')
    
    class Meta:
        db_table = 'plan_coverages'
        verbose_name = 'پوشش بیمه'
        verbose_name_plural = 'پوشش‌های بیمه'
        ordering = ['plan', 'coverage_type']
        unique_together = [['plan', 'coverage_type']]
    
    def __str__(self):
        return f"{self.plan.name_fa} - {self.get_coverage_type_display()}"


class InsuranceRegistration(models.Model):
    """Insurance Registration model - ثبت‌نام بیمه"""
    
    STATUS_CHOICES = [
        ('pending', 'در انتظار بررسی'),
        ('approved', 'تایید شده'),
        ('rejected', 'رد شده'),
        ('active', 'فعال'),
        ('expired', 'منقضی شده'),
        ('cancelled', 'لغو شده'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='insurance_registrations',
        verbose_name='کاربر'
    )
    plan = models.ForeignKey(
        InsurancePlan,
        on_delete=models.PROTECT,
        related_name='registrations',
        verbose_name='طرح بیمه'
    )
    school = models.ForeignKey(
        'locations.School',
        on_delete=models.PROTECT,
        related_name='insurance_registrations',
        verbose_name='مدرسه'
    )
    persons = models.ManyToManyField(
        'users.Person',
        blank=True,
        related_name='insurance_registrations',
        verbose_name='افراد تحت پوشش'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='وضعیت'
    )
    registration_date = models.DateTimeField(
        default=timezone.now,
        verbose_name='تاریخ ثبت‌نام'
    )
    start_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='تاریخ شروع'
    )
    end_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='تاریخ پایان'
    )
    additional_info = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='اطلاعات تکمیلی'
    )
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')
    
    class Meta:
        db_table = 'insurance_registrations'
        verbose_name = 'ثبت‌نام بیمه'
        verbose_name_plural = 'ثبت‌نام‌های بیمه'
        ordering = ['-registration_date']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.plan.name_fa} ({self.get_status_display()})"