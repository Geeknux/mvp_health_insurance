# Health Insurance MVP - Complete Setup Guide

This guide provides step-by-step instructions to set up and run the Health Insurance Management System.

## Prerequisites

- Docker and Docker Compose installed
- Git (for cloning the repository)
- At least 4GB of free RAM
- Ports 3000, 5432, and 8000 available

## Step-by-Step Setup

### 1. Clone and Prepare Environment

```bash
# Navigate to project directory
cd health-insurance-mvp

# Copy environment file
cp .env.example .env

# (Optional) Edit .env file with your preferred settings
nano .env
```

### 2. Start Docker Services

```bash
# Build and start all services
docker-compose up --build -d

# Check if all services are running
docker-compose ps
```

You should see three services running:
- `health_insurance_db` (PostgreSQL)
- `health_insurance_backend` (Django + FastAPI)
- `health_insurance_frontend` (Next.js)

### 3. Apply Database Migrations

```bash
# Apply all migrations (migration files are already created)
docker-compose exec backend python django_app/manage.py migrate
```

**Note**: Migration files are already included in the project. You don't need to run `makemigrations` unless you modify the models.

### 4. Seed Initial Data

```bash
# Run the data seeding script
docker-compose exec backend python django_app/seed_data.py
```

This will create:
- Admin user (National ID: 0000000000, Password: admin123)
- 10 Iranian provinces
- Sample location hierarchy for Tehran
- 3 insurance plans with coverages
- 3 sample schools

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **API Documentation (ReDoc)**: http://localhost:8000/redoc

### 6. Test the API

You can test the API using the Swagger UI at http://localhost:8000/docs

#### Example: Register a New User

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "national_id": "1234567890",
    "email": "user@example.com",
    "first_name": "علی",
    "last_name": "احمدی",
    "phone": "09123456789",
    "password": "password123"
  }'
```

#### Example: Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "national_id": "1234567890",
    "password": "password123"
  }'
```

#### Example: Get Insurance Plans

```bash
curl -X GET "http://localhost:8000/api/v1/insurance/plans"
```

## Troubleshooting

### Issue: Port Already in Use

If you get a port conflict error:

```bash
# Check which process is using the port
sudo lsof -i :8000  # or :3000 or :5432

# Stop the conflicting service or change the port in docker-compose.yml
```

### Issue: Database Connection Error

```bash
# Restart the database service
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Issue: Migration Errors

```bash
# Reset the database (WARNING: This will delete all data)
docker-compose down -v
docker-compose up -d db
docker-compose exec backend python django_app/manage.py migrate
docker-compose exec backend python django_app/seed_data.py
```

### Issue: Backend Not Starting

```bash
# Check backend logs
docker-compose logs backend

# Restart backend service
docker-compose restart backend
```

### Issue: Frontend Build Errors

```bash
# Rebuild frontend
docker-compose exec frontend npm install
docker-compose restart frontend
```

## Development Workflow

### Making Changes to Backend

```bash
# After modifying Django models
docker-compose exec backend python django_app/manage.py makemigrations
docker-compose exec backend python django_app/manage.py migrate

# Restart backend to apply changes
docker-compose restart backend
```

### Making Changes to Frontend

The frontend has hot-reload enabled, so changes will be reflected automatically.

### Viewing Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Accessing Django Shell

```bash
# Open Django shell
docker-compose exec backend python django_app/manage.py shell

# Example: Query users
>>> from apps.users.models import User
>>> User.objects.all()
```

### Accessing Database

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d health_insurance

# List tables
\dt

# Query users
SELECT * FROM users;

# Exit
\q
```

## Stopping the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data)
docker-compose down -v
```

## Production Deployment

For production deployment, you should:

1. **Update Environment Variables**:
   - Set `DJANGO_DEBUG=False`
   - Use strong, unique passwords
   - Configure proper CORS origins
   - Set secure JWT secret keys

2. **Use Production Database**:
   - Use a managed PostgreSQL service
   - Enable SSL connections
   - Set up regular backups

3. **Configure Web Server**:
   - Use Nginx as reverse proxy
   - Enable HTTPS with SSL certificates
   - Configure rate limiting

4. **Security Hardening**:
   - Enable Django security middleware
   - Set secure cookie flags
   - Configure HSTS headers
   - Use environment-specific settings

5. **Monitoring**:
   - Set up logging aggregation
   - Configure error tracking (e.g., Sentry)
   - Monitor performance metrics

## API Endpoints Reference

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

### Insurance
- `GET /api/v1/insurance/plans` - List all insurance plans
- `GET /api/v1/insurance/plans/{id}` - Get plan details
- `POST /api/v1/insurance/register` - Register for insurance
- `GET /api/v1/insurance/registrations` - Get user registrations
- `GET /api/v1/insurance/registrations/{id}` - Get registration details

### Locations
- `GET /api/v1/locations/states` - List all states
- `GET /api/v1/locations/cities?state_id={id}` - List cities by state
- `GET /api/v1/locations/counties?city_id={id}` - List counties by city
- `GET /api/v1/locations/regions?county_id={id}` - List regions by county
- `GET /api/v1/locations/districts?region_id={id}` - List districts by region
- `GET /api/v1/locations/schools?district_id={id}` - List schools by district

## Default Credentials

### Admin User
- **National ID**: 0000000000
- **Password**: admin123
- **Email**: admin@example.com

### Test User (Create via API)
- **National ID**: 1234567890
- **Password**: password123
- **Email**: user@example.com

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Review the IMPLEMENTATION_GUIDE.md for detailed code examples
3. Check the API documentation at http://localhost:8000/docs

## Next Steps

1. Complete frontend implementation using the structure provided
2. Add comprehensive error handling
3. Implement unit and integration tests
4. Set up CI/CD pipeline
5. Configure production environment
6. Add monitoring and analytics

---

**Note**: This is an MVP (Minimum Viable Product) for demonstration purposes. Additional features and security hardening should be implemented before production use.