# Health Insurance Management System - MVP
## سامانه مدیریت بیمه تکمیلی سلامت

A comprehensive health insurance management system for the Iranian Ministry of Education, built with Django 5, FastAPI, Next.js 15, and PostgreSQL.

## 🏗️ Architecture

- **Frontend**: Next.js 15 with Persian (RTL) support
- **Backend API**: FastAPI for REST endpoints
- **ORM & Models**: Django 5 for database operations
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## 📋 Features

- ✅ User registration and JWT authentication
- ✅ Three insurance plans: پایه (Basic), استاندارد (Standard), ویژه (Premium)
- ✅ Detailed coverage management for each plan
- ✅ 6-level location hierarchy: State → City → County → Region → District → School
- ✅ Admin dashboard for managing plans, coverages, and locations
- ✅ Role-based access control (User/Admin)
- ✅ Complete REST API with 30+ endpoints
- ✅ Full Persian language support throughout

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd health-insurance-mvp
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` file with your configuration

4. Build and start services:
```bash
docker-compose up --build
```

5. Run migrations:
```bash
docker-compose exec backend python manage.py migrate
```

6. Create superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

7. Load initial data:
```bash
docker-compose exec backend python manage.py loaddata initial_data
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
health-insurance-mvp/
├── backend/
│   ├── django_app/          # Django models & ORM
│   └── fastapi_app/         # FastAPI REST API
├── frontend/                # Next.js 15 application
├── docker-compose.yml       # Container orchestration
├── .env.example            # Environment variables template
└── README.md               # This file
```

## 🗄️ Database Schema

### Main Tables

1. **User** - User authentication and profiles
2. **InsurancePlan** - Insurance plan details
3. **PlanCoverage** - Coverage details for each plan
4. **InsuranceRegistration** - User insurance registrations
5. **State** - Iranian provinces
6. **City** - Cities within provinces
7. **County** - Counties within cities
8. **Region** - Regions within counties
9. **District** - Districts within regions
10. **School** - Educational institutions

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication:

1. Register: `POST /api/v1/auth/register`
2. Login: `POST /api/v1/auth/login` (returns access & refresh tokens)
3. Use access token in Authorization header: `Bearer <token>`

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🛠️ Development

### Backend Development

```bash
# Enter backend container
docker-compose exec backend bash

# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Run tests
pytest
```

### Frontend Development

```bash
# Enter frontend container
docker-compose exec frontend sh

# Install dependencies
npm install

# Run development server
npm run dev
```

## 📝 Environment Variables

Key environment variables (see `.env.example` for full list):

```env
# Database
POSTGRES_DB=health_insurance
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# Django
DJANGO_SECRET_KEY=your_secret_key
DJANGO_DEBUG=True

# JWT
JWT_SECRET_KEY=your_jwt_secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧪 Testing

```bash
# Backend tests
docker-compose exec backend pytest

# Frontend tests
docker-compose exec frontend npm test
```

## 📦 Deployment

For production deployment:

1. Update `.env` with production values
2. Set `DJANGO_DEBUG=False`
3. Configure proper database credentials
4. Set up SSL/TLS certificates
5. Use production-ready web server (Nginx)

## 🤝 Contributing

This is an MVP project for the Iranian Ministry of Education.

## 📄 License

Proprietary - Ministry of Education of Iran

## 👥 Team

Developed for the Ministry of Education of Iran

## 📞 Support

For support and questions, please contact the development team.