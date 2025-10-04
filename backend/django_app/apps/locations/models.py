"""
Location models for the Health Insurance system.
Hierarchy: State → City → County → Region → District → School
"""
import uuid
from django.db import models
from django.utils import timezone


class State(models.Model):
    """State (Province) model - استان"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name_fa = models.CharField(max_length=100, unique=True, verbose_name='نام استان')
    code = models.CharField(max_length=10, unique=True, verbose_name='کد استان')
    order_index = models.IntegerField(default=0, verbose_name='ترتیب نمایش')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاریخ ایجاد')
    
    class Meta:
        db_table = 'states'
        verbose_name = 'استان'
        verbose_name_plural = 'استان‌ها'
        ordering = ['order_index', 'name_fa']
    
    def __str__(self):
        return self.name_fa


class City(models.Model):
    """City model - شهر"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    state = models.ForeignKey(
        State,
        on_delete=models.CASCADE,
        related_name='cities',
        verbose_name='استان'
    )
    name_fa = models.CharField(max_length=100, verbose_name='نام شهر')
    code = models.CharField(max_length=10, verbose_name='کد شهر')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاریخ ایجاد')
    
    class Meta:
        db_table = 'cities'
        verbose_name = 'شهر'
        verbose_name_plural = 'شهرها'
        ordering = ['name_fa']
        unique_together = [['state', 'code']]
    
    def __str__(self):
        return f"{self.name_fa} - {self.state.name_fa}"


class County(models.Model):
    """County model - شهرستان"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    city = models.ForeignKey(
        City,
        on_delete=models.CASCADE,
        related_name='counties',
        verbose_name='شهر'
    )
    name_fa = models.CharField(max_length=100, verbose_name='نام شهرستان')
    code = models.CharField(max_length=10, verbose_name='کد شهرستان')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاریخ ایجاد')
    
    class Meta:
        db_table = 'counties'
        verbose_name = 'شهرستان'
        verbose_name_plural = 'شهرستان‌ها'
        ordering = ['name_fa']
        unique_together = [['city', 'code']]
    
    def __str__(self):
        return f"{self.name_fa} - {self.city.name_fa}"


class Region(models.Model):
    """Region model - منطقه"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    county = models.ForeignKey(
        County,
        on_delete=models.CASCADE,
        related_name='regions',
        verbose_name='شهرستان'
    )
    name_fa = models.CharField(max_length=100, verbose_name='نام منطقه')
    code = models.CharField(max_length=10, verbose_name='کد منطقه')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاریخ ایجاد')
    
    class Meta:
        db_table = 'regions'
        verbose_name = 'منطقه'
        verbose_name_plural = 'مناطق'
        ordering = ['name_fa']
        unique_together = [['county', 'code']]
    
    def __str__(self):
        return f"{self.name_fa} - {self.county.name_fa}"


class District(models.Model):
    """District model - ناحیه"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    region = models.ForeignKey(
        Region,
        on_delete=models.CASCADE,
        related_name='districts',
        verbose_name='منطقه'
    )
    name_fa = models.CharField(max_length=100, verbose_name='نام ناحیه')
    code = models.CharField(max_length=10, verbose_name='کد ناحیه')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاریخ ایجاد')
    
    class Meta:
        db_table = 'districts'
        verbose_name = 'ناحیه'
        verbose_name_plural = 'نواحی'
        ordering = ['name_fa']
        unique_together = [['region', 'code']]
    
    def __str__(self):
        return f"{self.name_fa} - {self.region.name_fa}"


class School(models.Model):
    """School model - مدرسه"""
    
    SCHOOL_TYPE_CHOICES = [
        ('elementary', 'ابتدایی'),
        ('middle', 'متوسطه اول'),
        ('high', 'متوسطه دوم'),
        ('combined', 'ترکیبی'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    district = models.ForeignKey(
        District,
        on_delete=models.CASCADE,
        related_name='schools',
        verbose_name='ناحیه'
    )
    name_fa = models.CharField(max_length=200, verbose_name='نام مدرسه')
    code = models.CharField(max_length=20, unique=True, verbose_name='کد مدرسه')
    school_type = models.CharField(
        max_length=20,
        choices=SCHOOL_TYPE_CHOICES,
        default='elementary',
        verbose_name='نوع مدرسه'
    )
    address = models.TextField(blank=True, null=True, verbose_name='آدرس')
    phone = models.CharField(max_length=11, blank=True, null=True, verbose_name='تلفن')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاریخ ایجاد')
    
    class Meta:
        db_table = 'schools'
        verbose_name = 'مدرسه'
        verbose_name_plural = 'مدارس'
        ordering = ['name_fa']
    
    def __str__(self):
        return f"{self.name_fa} ({self.get_school_type_display()})"
    
    def get_full_location(self):
        """Return full location hierarchy."""
        return (
            f"{self.name_fa} - {self.district.name_fa} - "
            f"{self.district.region.name_fa} - {self.district.region.county.name_fa} - "
            f"{self.district.region.county.city.name_fa} - "
            f"{self.district.region.county.city.state.name_fa}"
        )