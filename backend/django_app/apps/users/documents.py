"""
Document models for user file uploads.
"""
import os
import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings


def user_document_path(instance, filename):
    """Generate file path for user documents."""
    # Get file extension
    ext = filename.split('.')[-1]
    # Generate unique filename
    filename = f"{uuid.uuid4()}.{ext}"
    # Return path: documents/user_id/filename
    return os.path.join('documents', str(instance.user.id), filename)


class Document(models.Model):
    """
    Document model for storing user uploaded files.
    Supports various document types like national ID, birth certificate, etc.
    """
    
    DOCUMENT_TYPE_CHOICES = [
        ('national_id', 'کارت ملی'),
        ('birth_certificate', 'شناسنامه'),
        ('marriage_certificate', 'سند ازدواج'),
        ('employment_letter', 'حکم کارگزینی'),
        ('insurance_request', 'فرم درخواست بیمه'),
        ('medical_records', 'مدارک پزشکی'),
        ('other', 'سایر'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name='کاربر'
    )
    document_type = models.CharField(
        max_length=50,
        choices=DOCUMENT_TYPE_CHOICES,
        verbose_name='نوع مدرک'
    )
    title = models.CharField(
        max_length=200,
        verbose_name='عنوان مدرک'
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='توضیحات'
    )
    file = models.FileField(
        upload_to=user_document_path,
        verbose_name='فایل'
    )
    file_name = models.CharField(
        max_length=255,
        verbose_name='نام فایل اصلی'
    )
    file_size = models.BigIntegerField(
        verbose_name='حجم فایل (بایت)'
    )
    mime_type = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='نوع فایل'
    )
    
    # Optional: Link to specific registration
    registration = models.ForeignKey(
        'insurance.InsuranceRegistration',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents',
        verbose_name='ثبت‌نام مرتبط'
    )
    
    # Optional: Link to specific person
    person = models.ForeignKey(
        'users.Person',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents',
        verbose_name='شخص مرتبط'
    )
    
    is_verified = models.BooleanField(
        default=False,
        verbose_name='تایید شده'
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_documents',
        verbose_name='تایید کننده'
    )
    verified_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='تاریخ تایید'
    )
    
    created_at = models.DateTimeField(
        default=timezone.now,
        verbose_name='تاریخ آپلود'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='تاریخ بروزرسانی'
    )
    
    class Meta:
        db_table = 'user_documents'
        verbose_name = 'مدرک'
        verbose_name_plural = 'مدارک'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'document_type']),
            models.Index(fields=['registration']),
            models.Index(fields=['is_verified']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.get_full_name()}"
    
    def get_file_extension(self):
        """Return the file extension."""
        return os.path.splitext(self.file_name)[1].lower()
    
    def get_file_size_mb(self):
        """Return file size in MB."""
        return round(self.file_size / (1024 * 1024), 2)
    
    def delete(self, *args, **kwargs):
        """Override delete to remove file from storage."""
        # Delete the file from storage
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)
