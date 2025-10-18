"""
Main FastAPI application.
"""
import os
import sys
import django
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../django_app'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.config import settings
from api.v1 import auth, users, insurance, locations, admin, persons, statistics, documents

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="سامانه مدیریت بیمه تکمیلی سلامت - وزارت آموزش و پرورش",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS - Must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Add middleware to handle OPTIONS requests
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    """Add CORS headers to all responses."""
    if request.method == "OPTIONS":
        return JSONResponse(
            content={},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["احراز هویت"])
app.include_router(users.router, prefix="/api/v1/users", tags=["کاربران"])
app.include_router(insurance.router, prefix="/api/v1/insurance", tags=["بیمه"])
app.include_router(locations.router, prefix="/api/v1/locations", tags=["مکان‌ها"])
app.include_router(persons.router, prefix="/api/v1/persons", tags=["افراد تحت پوشش"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["مدیریت"])
app.include_router(statistics.router, prefix="/api/v1/statistics", tags=["آمار و گزارشات"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["مدارک"])


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