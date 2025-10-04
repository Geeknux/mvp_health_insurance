FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files
COPY django_app/requirements.txt /app/django_requirements.txt
COPY fastapi_app/requirements.txt /app/fastapi_requirements.txt

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r django_requirements.txt && \
    pip install -r fastapi_requirements.txt

# Copy project files
COPY . /app/

# Expose port
EXPOSE 8000

# Default command (will be overridden by docker-compose)
CMD ["uvicorn", "fastapi_app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]