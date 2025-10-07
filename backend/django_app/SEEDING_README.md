# Data Seeding Guide

This guide explains how to populate the database with sample data for development and testing.

## Available Seeding Scripts

### 1. `seed_data.py` - Basic Data
Seeds essential data including:
- Admin user (national_id: 0000000000)
- Iranian provinces (states)
- Cities, counties, regions, districts
- Schools (90+ schools across Tehran and Isfahan)
- Insurance plans (Basic, Standard, Premium)
- Plan coverages

### 2. `seed_sample_data.py` - Sample Data
Seeds realistic sample data including:
- 50 regular users with Iranian names
- 3 additional admin users
- 100+ persons (family members) with realistic relationships
- 50+ insurance registrations with various statuses
- Persons linked to registrations

### 3. `seed_all.py` - Complete Seeding
Runs both scripts in the correct order for complete database population.

## How to Run

### Option 1: Run Complete Seeding (Recommended)
```bash
# From the django_app directory
cd /home/amdev/Projects/Sib_Demo_AmoozeshParvaresh/source/backend/django_app

# Run complete seeding
python seed_all.py
```

### Option 2: Run Individual Scripts
```bash
# First, seed basic data
python seed_data.py

# Then, seed sample data
python seed_sample_data.py
```

### Option 3: Using Docker
```bash
# From the project root
docker-compose exec backend python django_app/seed_all.py
```

## Sample Credentials

### Admin Users
| National ID | Password | Name |
|------------|----------|------|
| 0000000000 | admin123 | مدیر سیستم |
| 1111111111 | admin123 | محمد رضایی |
| 2222222222 | admin123 | فاطمه احمدی |
| 3333333333 | admin123 | علی موسوی |

### Regular Users
- **Count**: 50 users
- **Password**: `user123` (for all users)
- **National IDs**: Randomly generated 10-digit numbers
- **Names**: Realistic Iranian names

## What Gets Created

### Users
- **Total**: 54 users (4 admins + 50 regular)
- **Fields**: National ID, email, name, phone
- **Password**: Simple passwords for testing

### Persons (Family Members)
- **Total**: 100+ persons
- **Relations**: spouse, child, parent, sibling, other
- **Data**: Realistic names, birth dates, national codes
- **Distribution**: 1-4 persons per user

### Insurance Registrations
- **Total**: 50+ registrations
- **Plans**: Basic, Standard, Premium
- **Schools**: Randomly assigned from 90+ schools
- **Statuses**: pending, approved, rejected, active, expired
- **Persons**: 0-3 persons per registration
- **Dates**: Registration dates within last 6 months

### Locations
- **States**: 10 Iranian provinces
- **Cities**: Multiple cities per state
- **Counties**: 3 counties in Tehran
- **Regions**: 2 regions per county
- **Districts**: 2 districts per region
- **Schools**: 90+ schools across Tehran and Isfahan

### Insurance Plans
- **Basic Plan**: 500,000 Toman/month, 4 coverages
- **Standard Plan**: 800,000 Toman/month, 6 coverages
- **Premium Plan**: 1,200,000 Toman/month, 8 coverages

## Data Statistics

After running `seed_all.py`, you'll have:

```
📊 DATA SUMMARY
═══════════════════════════════════════════════════════════

👥 Users:
   Total: 54
   Admins: 4
   Regular: 50

👨‍👩‍👧‍👦 Persons: 100+
   spouse: ~15
   child: ~40
   parent: ~20
   sibling: ~15
   other: ~10

📋 Insurance Registrations: 50+
   pending: ~10
   approved: ~10
   rejected: ~10
   active: ~10
   expired: ~10

💼 Insurance Plans: 3

🏫 Schools: 90+
```

## Resetting Data

To clear all data and reseed:

```bash
# Drop and recreate database (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Seed data
docker-compose exec backend python django_app/seed_all.py
```

## Customization

### Change Number of Users
Edit `seed_sample_data.py`:
```python
users = create_sample_users(100)  # Change from 50 to 100
```

### Change Number of Admins
Edit `seed_sample_data.py`:
```python
create_admin_users(5)  # Change from 3 to 5
```

### Add Custom Data
Create your own seeding script following the pattern:
```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
# Your custom seeding logic here
```

## Troubleshooting

### Error: "No module named 'apps'"
Make sure you're in the correct directory:
```bash
cd /home/amdev/Projects/Sib_Demo_AmoozeshParvaresh/source/backend/django_app
```

### Error: "Database locked"
Stop the server before seeding:
```bash
docker-compose stop backend
docker-compose exec backend python django_app/seed_all.py
docker-compose start backend
```

### Error: "Duplicate national_id"
The script handles duplicates automatically. If you see this error, it means the database already has data. Clear it first.

## Notes

- All passwords are simple (`admin123`, `user123`) for testing only
- National IDs are randomly generated and may not be valid Iranian national IDs
- Dates are realistic but randomly generated
- The data is suitable for development and testing, not production
