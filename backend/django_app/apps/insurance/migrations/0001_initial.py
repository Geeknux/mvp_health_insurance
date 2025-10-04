# Generated migration

import uuid
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('locations', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='InsurancePlan',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name_fa', models.CharField(max_length=100, unique=True, verbose_name='نام طرح')),
                ('plan_type', models.CharField(choices=[('basic', 'پایه'), ('standard', 'استاندارد'), ('premium', 'ویژه')], default='basic', max_length=20, verbose_name='نوع طرح')),
                ('description_fa', models.TextField(verbose_name='توضیحات')),
                ('monthly_premium', models.DecimalField(decimal_places=0, max_digits=10, verbose_name='حق بیمه ماهانه (ریال)')),
                ('is_active', models.BooleanField(default=True, verbose_name='فعال')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='تاریخ ایجاد')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')),
            ],
            options={
                'verbose_name': 'طرح بیمه',
                'verbose_name_plural': 'طرح\u200cهای بیمه',
                'db_table': 'insurance_plans',
                'ordering': ['plan_type', 'name_fa'],
            },
        ),
        migrations.CreateModel(
            name='PlanCoverage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('coverage_type', models.CharField(choices=[('outpatient', 'درمان سرپایی'), ('hospitalization', 'بستری'), ('medication', 'دارو'), ('laboratory', 'آزمایش'), ('imaging', 'تصویربرداری'), ('dental', 'دندانپزشکی'), ('ophthalmology', 'چشم\u200cپزشکی'), ('physiotherapy', 'فیزیوتراپی')], max_length=20, verbose_name='نوع پوشش')),
                ('title_fa', models.CharField(max_length=100, verbose_name='عنوان')),
                ('description_fa', models.TextField(verbose_name='توضیحات')),
                ('coverage_amount', models.DecimalField(decimal_places=0, help_text='حداکثر مبلغ قابل پرداخت', max_digits=12, verbose_name='سقف پوشش (ریال)')),
                ('coverage_percentage', models.IntegerField(help_text='درصد پوشش هزینه (0-100)', verbose_name='درصد پوشش')),
                ('max_usage_count', models.IntegerField(blank=True, help_text='حداکثر تعداد دفعات استفاده در سال (خالی = نامحدود)', null=True, verbose_name='تعداد استفاده مجاز')),
                ('is_active', models.BooleanField(default=True, verbose_name='فعال')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='تاریخ ایجاد')),
                ('plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='coverages', to='insurance.insuranceplan', verbose_name='طرح بیمه')),
            ],
            options={
                'verbose_name': 'پوشش بیمه',
                'verbose_name_plural': 'پوشش\u200cهای بیمه',
                'db_table': 'plan_coverages',
                'ordering': ['plan', 'coverage_type'],
            },
        ),
        migrations.CreateModel(
            name='InsuranceRegistration',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('pending', 'در انتظار بررسی'), ('approved', 'تایید شده'), ('rejected', 'رد شده'), ('active', 'فعال'), ('expired', 'منقضی شده'), ('cancelled', 'لغو شده')], default='pending', max_length=20, verbose_name='وضعیت')),
                ('registration_date', models.DateTimeField(default=django.utils.timezone.now, verbose_name='تاریخ ثبت\u200cنام')),
                ('start_date', models.DateField(blank=True, null=True, verbose_name='تاریخ شروع')),
                ('end_date', models.DateField(blank=True, null=True, verbose_name='تاریخ پایان')),
                ('additional_info', models.JSONField(blank=True, default=dict, verbose_name='اطلاعات تکمیلی')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='تاریخ ایجاد')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')),
                ('plan', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='registrations', to='insurance.insuranceplan', verbose_name='طرح بیمه')),
                ('school', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='insurance_registrations', to='locations.school', verbose_name='مدرسه')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='insurance_registrations', to=settings.AUTH_USER_MODEL, verbose_name='کاربر')),
            ],
            options={
                'verbose_name': 'ثبت\u200cنام بیمه',
                'verbose_name_plural': 'ثبت\u200cنام\u200cهای بیمه',
                'db_table': 'insurance_registrations',
                'ordering': ['-registration_date'],
            },
        ),
        migrations.AddConstraint(
            model_name='plancoverage',
            constraint=models.UniqueConstraint(fields=('plan', 'coverage_type'), name='unique_coverage_per_plan'),
        ),
    ]