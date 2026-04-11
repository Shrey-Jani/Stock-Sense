# Dockerfile
# This file tells Docker how to package our FastAPI app
# into a container that can run anywhere — including GCP

# Start with Python 3.11 as the base image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy requirements first — Docker caches this layer
# so it won't reinstall packages every time you redeploy
COPY requirements.txt .

# Install all Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy ALL backend files into the container
# This includes our pre-trained model files in models/saved/
COPY . .

# Tell the container which port to listen on
EXPOSE 8080

# Command to start the FastAPI server
# GCP Cloud Run uses port 8080 by default
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]