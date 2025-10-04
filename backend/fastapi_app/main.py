"""
Main FastAPI application.
"""
import os
import sys
import django
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../django_app'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.config import settings
from api.v1 import auth, users, insurance, locations, admin

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="سامانه مدیریت بیمه تکمیلی سلامت - وزارت آموزش و پرورش",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["احراز هویت"])
app.include_router(users.router, prefix="/api/v1/users", tags=["کاربران"])
app.include_router(insurance.router, prefix="/api/v1/insurance", tags=["بیمه"])
app.include_router(locations.router, prefix="/api/v1/locations", tags=["مکان‌ها"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["مدیریت"])


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "سامانه مدیریت بیمه تکمیلی سلامت",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}