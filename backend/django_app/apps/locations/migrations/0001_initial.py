# Generated migration

import uuid
import django.utils.timezone
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='State',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name_fa', models.CharField(max_length=100, unique=True, verbose_name='نام استان')),
                ('code', models.CharField(max_length=10, unique=True, verbose_name='کد استان')),
                ('order_index', models.IntegerField(default=0, verbose_name='ترتیب نمایش')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='تاریخ ایجاد')),
            ],
            options={
                'verbose_name': 'استان',
                'verbose_name_plural': 'استان\u200cها',
                'db_table': 'states',
                'ordering': ['order_index', 'name_fa'],
            },
        ),
        migrations.CreateModel(
            name='City',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name_fa', models.CharField(max_length=100, verbose_name='نام شهر')),
                ('code', models.CharField(max_length=10, verbose_name='کد شهر')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='تاریخ ایجاد')),
                ('state', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cities', to='locations.state', verbose_name='استان')),
            ],
            options={
                'verbose_name': 'شهر',
                'verbose_name_plural': 'شهرها',
                'db_table': 'cities',
                'ordering': ['name_fa'],
            },
        ),
        migrations.CreateModel(
            name='County',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name_fa', models.CharField(max_length=100, verbose_name='نام شهرستان')),
                ('code', models.CharField(max_length=10, verbose_name='کد شهرستان')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='تاریخ ایجاد')),
                ('city', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='counties', to='locations.city', verbose_name='شهر')),
            ],
            options={
                'verbose_name': 'شهرستان',
                'verbose_name_plural': 'شهرستان\u200cها',
                'db_table': 'counties',
                'ordering': ['name_fa'],
            },
        ),
        migrations.CreateModel(
            name='Region',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name_fa', models.CharField(max_length=100, verbose_name='نام منطقه')),
                ('code', models.CharField(max_length=10, verbose_name='کد منطقه')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='تاریخ ایجاد')),
                ('county', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='regions', to='locations.county', verbose_name='شهرستان')),
            ],
            options={
                'verbose_name': 'منطقه',
                'verbose_name_plural': 'مناطق',
                'db_table': 'regions',
                'ordering': ['name_fa'],
            },
        ),
        migrations.CreateModel(
            name='District',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name_fa', models.CharField(max_length=100, verbose_name='نام ناحیه')),
                ('code', models.CharField(max_length=10, verbose_name='کد ناحیه')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='تاریخ ایجاد')),
                ('region', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='districts', to='locations.region', verbose_name='منطقه')),
            ],
            options={
                'verbose_name': 'ناحیه',
                'verbose_name_plural': 'نواحی',
                'db_table': 'districts',
                'ordering': ['name_fa'],
            },
        ),
        migrations.CreateModel(
            name='School',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name_fa', models.CharField(max_length=200, verbose_name='نام مدرسه')),
                ('code', models.CharField(max_length=20, unique=True, verbose_name='کد مدرسه')),
                ('school_type', models.CharField(choices=[('elementary', 'ابتدایی'), ('middle', 'متوسطه اول'), ('high', 'متوسطه دوم'), ('combined', 'ترکیبی')], default='elementary', max_length=20, verbose_name='نوع مدرسه')),
                ('address', models.TextField(blank=True, null=True, verbose_name='آدرس')),
                ('phone', models.CharField(blank=True, max_length=11, null=True, verbose_name='تلفن')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='تاریخ ایجاد')),
                ('district', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schools', to='locations.district', verbose_name='ناحیه')),
            ],
            options={
                'verbose_name': 'مدرسه',
                'verbose_name_plural': 'مدارس',
                'db_table': 'schools',
                'ordering': ['name_fa'],
            },
        ),
        migrations.AddConstraint(
            model_name='city',
            constraint=models.UniqueConstraint(fields=('state', 'code'), name='unique_city_per_state'),
        ),
        migrations.AddConstraint(
            model_name='county',
            constraint=models.UniqueConstraint(fields=('city', 'code'), name='unique_county_per_city'),
        ),
        migrations.AddConstraint(
            model_name='region',
            constraint=models.UniqueConstraint(fields=('county', 'code'), name='unique_region_per_county'),
        ),
        migrations.AddConstraint(
            model_name='district',
            constraint=models.UniqueConstraint(fields=('region', 'code'), name='unique_district_per_region'),
        ),
    ]