"""
Master seeding script that runs all data seeding in the correct order.
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Import seeding functions
from seed_data import (
    seed_admin_user,
    seed_states,
    seed_sample_locations,
    seed_insurance_plans
)

from seed_sample_data import (
    create_admin_users,
    create_sample_users,
    create_persons_for_users,
    create_insurance_registrations,
    print_summary
)


def main():
    print("🚀 Starting complete data seeding process...")
    print("=" * 70)
    
    # Step 1: Seed basic data
    print("\n📦 STEP 1: Seeding basic data...")
    print("-" * 70)
    seed_admin_user()
    seed_states()
    seed_sample_locations()
    seed_insurance_plans()
    
    # Step 2: Seed sample data
    print("\n📦 STEP 2: Seeding sample data...")
    print("-" * 70)
    create_admin_users(3)
    users = create_sample_users(50)
    create_persons_for_users(users)
    create_insurance_registrations(users)
    
    # Step 3: Print summary
    print_summary()
    
    print("\n🎉 All data seeding completed successfully!")
    print("=" * 70)


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
