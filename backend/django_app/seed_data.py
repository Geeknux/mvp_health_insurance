"""
Data seeding script for initial data.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.locations.models import State, City, County, Region, District, School
from apps.insurance.models import InsurancePlan, PlanCoverage


def seed_admin_user():
    """Create admin user."""
    if not User.objects.filter(national_id='0000000000').exists():
        User.objects.create_superuser(
            national_id='0000000000',
            email='admin@example.com',
            password='admin123',
            first_name='مدیر',
            last_name='سیستم'
        )
        print("✅ Admin user created (national_id: 0000000000, password: admin123)")


def seed_states():
    """Seed Iranian provinces."""
    states_data = [
        ('تهران', '01', 1),
        ('اصفهان', '02', 2),
        ('فارس', '03', 3),
        ('خراسان رضوی', '04', 4),
        ('آذربایجان شرقی', '05', 5),
        ('خوزستان', '06', 6),
        ('مازندران', '07', 7),
        ('گیلان', '08', 8),
        ('کرمان', '09', 9),
        ('آذربایجان غربی', '10', 10),
    ]
    
    for name, code, order in states_data:
        State.objects.get_or_create(
            code=code,
            defaults={'name_fa': name, 'order_index': order}
        )
    print(f"✅ {len(states_data)} States seeded")


def seed_sample_locations():
    """Seed comprehensive location hierarchy with multiple cities and schools."""
    # Tehran Province
    tehran_state, _ = State.objects.get_or_create(
        code='01',
        defaults={'name_fa': 'تهران', 'order_index': 1}
    )
    
    # Tehran City
    tehran_city, _ = City.objects.get_or_create(
        state=tehran_state,
        code='0101',
        defaults={'name_fa': 'تهران'}
    )
    
    # Counties in Tehran
    counties_data = [
        ('شهرستان تهران', '010101'),
        ('شهرستان ری', '010102'),
        ('شهرستان شمیرانات', '010103'),
    ]
    
    total_schools = 0
    
    for county_name, county_code in counties_data:
        county, _ = County.objects.get_or_create(
            city=tehran_city,
            code=county_code,
            defaults={'name_fa': county_name}
        )
        
        # Create 2 regions per county
        for region_num in range(1, 3):
            region, _ = Region.objects.get_or_create(
                county=county,
                code=f"{county_code}{region_num:02d}",
                defaults={'name_fa': f'منطقه {region_num}'}
            )
            
            # Create 2 districts per region
            for district_num in range(1, 3):
                district, _ = District.objects.get_or_create(
                    region=region,
                    code=f"{county_code}{region_num:02d}{district_num:02d}",
                    defaults={'name_fa': f'ناحیه {district_num}'}
                )
                
                # Create schools for each district
                schools_data = [
                    (f'دبستان شهید بهشتی {region_num}-{district_num}', f'SCH{county_code[-2:]}{region_num}{district_num}01', 'elementary', 'خیابان ولیعصر، پلاک 123'),
                    (f'دبستان دخترانه فاطمیه {region_num}-{district_num}', f'SCH{county_code[-2:]}{region_num}{district_num}02', 'elementary', 'خیابان انقلاب، پلاک 456'),
                    (f'دبیرستان علامه حلی {region_num}-{district_num}', f'SCH{county_code[-2:]}{region_num}{district_num}03', 'high', 'میدان ونک، پلاک 789'),
                    (f'دبیرستان فرزانگان {region_num}-{district_num}', f'SCH{county_code[-2:]}{region_num}{district_num}04', 'high', 'خیابان آزادی، پلاک 321'),
                    (f'مدرسه راهنمایی امام خمینی {region_num}-{district_num}', f'SCH{county_code[-2:]}{region_num}{district_num}05', 'middle', 'میدان تجریش، پلاک 654'),
                ]
                
                for name, code, school_type, address in schools_data:
                    School.objects.get_or_create(
                        code=code,
                        defaults={
                            'district': district,
                            'name_fa': name,
                            'school_type': school_type,
                            'address': address,
                            'phone': '02112345678'
                        }
                    )
                    total_schools += 1
    
    # Isfahan Province
    isfahan_state, _ = State.objects.get_or_create(
        code='02',
        defaults={'name_fa': 'اصفهان', 'order_index': 2}
    )
    
    isfahan_city, _ = City.objects.get_or_create(
        state=isfahan_state,
        code='0201',
        defaults={'name_fa': 'اصفهان'}
    )
    
    isfahan_county, _ = County.objects.get_or_create(
        city=isfahan_city,
        code='020101',
        defaults={'name_fa': 'شهرستان اصفهان'}
    )
    
    isfahan_region, _ = Region.objects.get_or_create(
        county=isfahan_county,
        code='02010101',
        defaults={'name_fa': 'منطقه 1'}
    )
    
    isfahan_district, _ = District.objects.get_or_create(
        region=isfahan_region,
        code='0201010101',
        defaults={'name_fa': 'ناحیه 1'}
    )
    
    # Isfahan schools
    isfahan_schools = [
        ('دبستان شهید چمران', 'SCH0201', 'elementary', 'خیابان چهارباغ، اصفهان'),
        ('دبیرستان حافظ', 'SCH0202', 'high', 'میدان نقش جهان، اصفهان'),
        ('مدرسه راهنمایی سعدی', 'SCH0203', 'middle', 'خیابان سی و سه پل، اصفهان'),
    ]
    
    for name, code, school_type, address in isfahan_schools:
        School.objects.get_or_create(
            code=code,
            defaults={
                'district': isfahan_district,
                'name_fa': name,
                'school_type': school_type,
                'address': address,
                'phone': '03132345678'
            }
        )
        total_schools += 1
    
    print(f"✅ Comprehensive location hierarchy created with {total_schools} schools across multiple cities")


def seed_insurance_plans():
    """Seed insurance plans with coverages."""
    plans_data = [
        {
            'name_fa': 'بیمه پایه',
            'plan_type': 'basic',
            'description_fa': 'بیمه تکمیلی پایه برای کارکنان آموزش و پرورش با پوشش‌های اساسی',
            'monthly_premium': 500000,
            'coverages': [
                ('outpatient', 'درمان سرپایی', 'پوشش هزینه‌های ویزیت و درمان سرپایی', 5000000, 70, 10),
                ('hospitalization', 'بستری', 'پوشش هزینه‌های بستری در بیمارستان', 50000000, 90, None),
                ('medication', 'دارو', 'پوشش هزینه‌های دارویی', 3000000, 80, None),
                ('laboratory', 'آزمایش', 'پوشش هزینه‌های آزمایشگاهی', 2000000, 75, None),
            ]
        },
        {
            'name_fa': 'بیمه استاندارد',
            'plan_type': 'standard',
            'description_fa': 'بیمه تکمیلی استاندارد با پوشش بیشتر و خدمات گسترده‌تر',
            'monthly_premium': 800000,
            'coverages': [
                ('outpatient', 'درمان سرپایی', 'پوشش هزینه‌های ویزیت و درمان سرپایی', 8000000, 80, 15),
                ('hospitalization', 'بستری', 'پوشش هزینه‌های بستری در بیمارستان', 80000000, 95, None),
                ('medication', 'دارو', 'پوشش هزینه‌های دارویی', 5000000, 85, None),
                ('laboratory', 'آزمایش', 'پوشش هزینه‌های آزمایشگاهی', 3000000, 80, None),
                ('imaging', 'تصویربرداری', 'پوشش هزینه‌های تصویربرداری پزشکی', 4000000, 75, None),
                ('dental', 'دندانپزشکی', 'پوشش هزینه‌های دندانپزشکی', 3000000, 70, 5),
            ]
        },
        {
            'name_fa': 'بیمه ویژه',
            'plan_type': 'premium',
            'description_fa': 'بیمه تکمیلی ویژه با بالاترین پوشش و خدمات کامل',
            'monthly_premium': 1200000,
            'coverages': [
                ('outpatient', 'درمان سرپایی', 'پوشش هزینه‌های ویزیت و درمان سرپایی', 12000000, 90, 20),
                ('hospitalization', 'بستری', 'پوشش هزینه‌های بستری در بیمارستان', 100000000, 100, None),
                ('medication', 'دارو', 'پوشش هزینه‌های دارویی', 8000000, 90, None),
                ('laboratory', 'آزمایش', 'پوشش هزینه‌های آزمایشگاهی', 5000000, 85, None),
                ('imaging', 'تصویربرداری', 'پوشش هزینه‌های تصویربرداری پزشکی', 6000000, 85, None),
                ('dental', 'دندانپزشکی', 'پوشش هزینه‌های دندانپزشکی', 5000000, 80, 10),
                ('ophthalmology', 'چشم‌پزشکی', 'پوشش هزینه‌های چشم‌پزشکی', 4000000, 75, 5),
                ('physiotherapy', 'فیزیوتراپی', 'پوشش هزینه‌های فیزیوتراپی', 3000000, 70, 10),
            ]
        },
    ]
    
    for plan_data in plans_data:
        coverages_data = plan_data.pop('coverages')
        plan, created = InsurancePlan.objects.get_or_create(
            name_fa=plan_data['name_fa'],
            defaults=plan_data
        )
        
        if created:
            for cov_type, title, desc, amount, percentage, max_usage in coverages_data:
                PlanCoverage.objects.create(
                    plan=plan,
                    coverage_type=cov_type,
                    title_fa=title,
                    description_fa=desc,
                    coverage_amount=amount,
                    coverage_percentage=percentage,
                    max_usage_count=max_usage
                )
            print(f"✅ Created plan: {plan.name_fa} with {len(coverages_data)} coverages")
        else:
            print(f"ℹ️  Plan already exists: {plan.name_fa}")


if __name__ == '__main__':
    print("🌱 Starting data seeding...")
    print("-" * 50)
    seed_admin_user()
    seed_states()
    seed_sample_locations()
    seed_insurance_plans()
    print("-" * 50)
    print("✅ Data seeding completed successfully!")
    print("\n📝 Admin credentials:")
    print("   National ID: 0000000000")
    print("   Password: admin123")