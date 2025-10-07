"""
Enhanced data seeding script for sample users, persons, and insurance registrations.
Run this after seed_data.py to populate the system with realistic sample data.
"""
import os
import django
from datetime import datetime, timedelta
from random import choice, randint, sample

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User, Person
from apps.insurance.models import InsurancePlan, InsuranceRegistration
from apps.locations.models import School

# Sample Iranian names
FIRST_NAMES_MALE = [
    'علی', 'محمد', 'حسین', 'رضا', 'احمد', 'مهدی', 'حسن', 'امیر', 'سعید', 'مجید',
    'محسن', 'ابراهیم', 'یوسف', 'داود', 'اسماعیل', 'جعفر', 'کاظم', 'موسی', 'عباس', 'صادق'
]

FIRST_NAMES_FEMALE = [
    'فاطمه', 'زهرا', 'مریم', 'زینب', 'سکینه', 'معصومه', 'سمیه', 'خدیجه', 'نرگس', 'مهسا',
    'سارا', 'الهام', 'شیما', 'نازنین', 'پریسا', 'ریحانه', 'سمانه', 'مینا', 'نیلوفر', 'آزاده'
]

LAST_NAMES = [
    'احمدی', 'محمدی', 'حسینی', 'رضایی', 'علوی', 'موسوی', 'کریمی', 'جعفری', 'نوری', 'صادقی',
    'رحیمی', 'ابراهیمی', 'یوسفی', 'اسماعیلی', 'کاظمی', 'حیدری', 'مرادی', 'اکبری', 'نصیری', 'باقری',
    'فاطمی', 'زارعی', 'حسنی', 'طاهری', 'عباسی', 'قاسمی', 'سلیمانی', 'خانی', 'شریفی', 'امینی'
]


def generate_national_id():
    """Generate a random 10-digit national ID."""
    return ''.join([str(randint(0, 9)) for _ in range(10)])


def create_sample_users(count=50):
    """Create sample users with realistic data."""
    print(f"\n📝 Creating {count} sample users...")
    
    created_users = []
    for i in range(count):
        # Alternate between male and female names
        is_male = i % 2 == 0
        first_name = choice(FIRST_NAMES_MALE if is_male else FIRST_NAMES_FEMALE)
        last_name = choice(LAST_NAMES)
        
        national_id = generate_national_id()
        
        # Check if user already exists
        while User.objects.filter(national_id=national_id).exists():
            national_id = generate_national_id()
        
        user = User.objects.create_user(
            national_id=national_id,
            email=f"{first_name.lower()}.{last_name.lower()}{i}@example.com",
            password='user123',  # Simple password for testing
            first_name=first_name,
            last_name=last_name,
            phone=f"0912{randint(1000000, 9999999)}"
        )
        created_users.append(user)
        
        if (i + 1) % 10 == 0:
            print(f"   ✅ Created {i + 1} users...")
    
    print(f"✅ Successfully created {len(created_users)} users")
    return created_users


def create_persons_for_users(users):
    """Create persons (family members) for users."""
    print(f"\n👨‍👩‍👧‍👦 Creating persons for users...")
    
    relations = ['spouse', 'child', 'parent', 'sibling', 'other']
    total_persons = 0
    
    for user in users:
        # Each user gets 1-4 family members
        num_persons = randint(1, 4)
        
        for _ in range(num_persons):
            relation = choice(relations)
            
            # Generate appropriate names based on relation
            if relation == 'spouse':
                # Spouse has opposite gender
                first_name = choice(FIRST_NAMES_FEMALE if user.first_name in FIRST_NAMES_MALE else FIRST_NAMES_MALE)
                # Spouse might have same last name
                last_name = user.last_name if randint(0, 1) else choice(LAST_NAMES)
                birth_year = randint(1970, 1990)
            elif relation == 'child':
                # Child can be any gender
                first_name = choice(FIRST_NAMES_MALE + FIRST_NAMES_FEMALE)
                last_name = user.last_name
                birth_year = randint(2005, 2018)
            elif relation == 'parent':
                # Parent is older
                first_name = choice(FIRST_NAMES_MALE + FIRST_NAMES_FEMALE)
                last_name = user.last_name if randint(0, 1) else choice(LAST_NAMES)
                birth_year = randint(1950, 1970)
            else:  # sibling or other
                first_name = choice(FIRST_NAMES_MALE + FIRST_NAMES_FEMALE)
                last_name = user.last_name if relation == 'sibling' else choice(LAST_NAMES)
                birth_year = randint(1975, 2000)
            
            national_code = generate_national_id()
            birth_date = datetime(birth_year, randint(1, 12), randint(1, 28)).date()
            
            Person.objects.create(
                user=user,
                first_name=first_name,
                last_name=last_name,
                national_code=national_code,
                birth_date=birth_date,
                relation=relation
            )
            total_persons += 1
    
    print(f"✅ Successfully created {total_persons} persons")


def create_insurance_registrations(users):
    """Create insurance registrations for users."""
    print(f"\n📋 Creating insurance registrations...")
    
    plans = list(InsurancePlan.objects.filter(is_active=True))
    schools = list(School.objects.all())
    
    if not plans:
        print("❌ No insurance plans found. Please run seed_data.py first.")
        return
    
    if not schools:
        print("❌ No schools found. Please run seed_data.py first.")
        return
    
    statuses = ['pending', 'approved', 'rejected', 'active', 'expired']
    total_registrations = 0
    
    for user in users:
        # Each user gets 0-2 registrations
        num_registrations = randint(0, 2)
        
        for _ in range(num_registrations):
            plan = choice(plans)
            school = choice(schools)
            status = choice(statuses)
            
            # Registration date in the past 6 months
            days_ago = randint(1, 180)
            registration_date = datetime.now() - timedelta(days=days_ago)
            
            # Start date is usually after registration
            start_date = registration_date + timedelta(days=randint(1, 30))
            
            # End date is 1 year after start
            end_date = start_date + timedelta(days=365) if status in ['active', 'expired'] else None
            
            registration = InsuranceRegistration.objects.create(
                user=user,
                plan=plan,
                school=school,
                status=status,
                registration_date=registration_date,
                start_date=start_date,
                end_date=end_date
            )
            
            # Add some persons to the registration (0-3 persons)
            user_persons = list(Person.objects.filter(user=user))
            if user_persons:
                num_persons = min(randint(0, 3), len(user_persons))
                selected_persons = sample(user_persons, num_persons)
                registration.persons.set(selected_persons)
            
            total_registrations += 1
    
    print(f"✅ Successfully created {total_registrations} insurance registrations")
    
    # Print statistics
    print("\n📊 Registration Statistics:")
    for status in statuses:
        count = InsuranceRegistration.objects.filter(status=status).count()
        print(f"   {status}: {count}")


def create_admin_users(count=3):
    """Create additional admin users for testing."""
    print(f"\n👑 Creating {count} admin users...")
    
    admin_data = [
        ('1111111111', 'admin1@example.com', 'محمد', 'رضایی'),
        ('2222222222', 'admin2@example.com', 'فاطمه', 'احمدی'),
        ('3333333333', 'admin3@example.com', 'علی', 'موسوی'),
    ]
    
    for i in range(min(count, len(admin_data))):
        national_id, email, first_name, last_name = admin_data[i]
        
        if not User.objects.filter(national_id=national_id).exists():
            User.objects.create_superuser(
                national_id=national_id,
                email=email,
                password='admin123',
                first_name=first_name,
                last_name=last_name
            )
            print(f"   ✅ Created admin: {first_name} {last_name} (ID: {national_id})")
        else:
            print(f"   ℹ️  Admin already exists: {national_id}")


def print_summary():
    """Print summary of created data."""
    print("\n" + "=" * 60)
    print("📊 DATA SUMMARY")
    print("=" * 60)
    
    total_users = User.objects.count()
    admin_users = User.objects.filter(is_admin=True).count()
    regular_users = total_users - admin_users
    
    print(f"\n👥 Users:")
    print(f"   Total: {total_users}")
    print(f"   Admins: {admin_users}")
    print(f"   Regular: {regular_users}")
    
    total_persons = Person.objects.count()
    print(f"\n👨‍👩‍👧‍👦 Persons: {total_persons}")
    
    relations = Person.objects.values_list('relation', flat=True).distinct()
    for relation in relations:
        count = Person.objects.filter(relation=relation).count()
        print(f"   {relation}: {count}")
    
    total_registrations = InsuranceRegistration.objects.count()
    print(f"\n📋 Insurance Registrations: {total_registrations}")
    
    statuses = InsuranceRegistration.objects.values_list('status', flat=True).distinct()
    for status in statuses:
        count = InsuranceRegistration.objects.filter(status=status).count()
        print(f"   {status}: {count}")
    
    total_plans = InsurancePlan.objects.count()
    print(f"\n💼 Insurance Plans: {total_plans}")
    
    total_schools = School.objects.count()
    print(f"\n🏫 Schools: {total_schools}")
    
    print("\n" + "=" * 60)
    print("\n🔑 Sample Credentials:")
    print("   Admin: 0000000000 / admin123")
    print("   Admin: 1111111111 / admin123")
    print("   User: Any created user / user123")
    print("\n   (All users have password: user123)")
    print("=" * 60)


if __name__ == '__main__':
    print("🌱 Starting enhanced data seeding...")
    print("=" * 60)
    
    # Create admin users
    create_admin_users(3)
    
    # Create regular users
    users = create_sample_users(50)
    
    # Create persons for users
    create_persons_for_users(users)
    
    # Create insurance registrations
    create_insurance_registrations(users)
    
    # Print summary
    print_summary()
    
    print("\n✅ Enhanced data seeding completed successfully!")
