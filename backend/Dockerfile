# Use Python 3.11 slim image to keep the container small
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Install system dependencies needed by some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (Docker caches this layer if requirements don't change)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Create the saved models directory
RUN mkdir -p models/saved

# Cloud Run sets the PORT environment variable
# Default to 8080 if not set
ENV PORT=8080

# Run the FastAPI app with uvicorn
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
