# Generated migration for Document model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid
import apps.users.documents


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_alter_person_relation'),
        ('insurance', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('document_type', models.CharField(choices=[('national_id', 'کارت ملی'), ('birth_certificate', 'شناسنامه'), ('marriage_certificate', 'سند ازدواج'), ('employment_letter', 'حکم کارگزینی'), ('insurance_request', 'فرم درخواست بیمه'), ('medical_records', 'مدارک پزشکی'), ('other', 'سایر')], max_length=50, verbose_name='نوع مدرک')),
                ('title', models.CharField(max_length=200, verbose_name='عنوان مدرک')),
                ('description', models.TextField(blank=True, null=True, verbose_name='توضیحات')),
                ('file', models.FileField(upload_to=apps.users.documents.user_document_path, verbose_name='فایل')),
                ('file_name', models.CharField(max_length=255, verbose_name='نام فایل اصلی')),
                ('file_size', models.BigIntegerField(verbose_name='حجم فایل (بایت)')),
                ('mime_type', models.CharField(blank=True, max_length=100, null=True, verbose_name='نوع فایل')),
                ('is_verified', models.BooleanField(default=False, verbose_name='تایید شده')),
                ('verified_at', models.DateTimeField(blank=True, null=True, verbose_name='تاریخ تایید')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='تاریخ آپلود')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')),
                ('person', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='documents', to='users.person', verbose_name='شخص مرتبط')),
                ('registration', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='documents', to='insurance.insuranceregistration', verbose_name='ثبت\u200cنام مرتبط')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to=settings.AUTH_USER_MODEL, verbose_name='کاربر')),
                ('verified_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='verified_documents', to=settings.AUTH_USER_MODEL, verbose_name='تایید کننده')),
            ],
            options={
                'verbose_name': 'مدرک',
                'verbose_name_plural': 'مدارک',
                'db_table': 'user_documents',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='document',
            index=models.Index(fields=['user', 'document_type'], name='user_docume_user_id_b8a9f5_idx'),
        ),
        migrations.AddIndex(
            model_name='document',
            index=models.Index(fields=['registration'], name='user_docume_registr_c7e8d4_idx'),
        ),
        migrations.AddIndex(
            model_name='document',
            index=models.Index(fields=['is_verified'], name='user_docume_is_veri_a3f2e1_idx'),
        ),
    ]
