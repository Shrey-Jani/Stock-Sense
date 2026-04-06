# Import sys module for system-specific parameters and functions (like path manipulation)
import sys
# Import os module for operating system interactions (file paths, environment variables)
import os

# Get the absolute path of the current file's directory (backend/)
# os.path.abspath(__file__) returns full path of main.py
# os.path.dirname() gets the directory containing that file
# This ensures we can import modules from the same directory regardless of where the script is run from
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import FastAPI class to create the web API application
from fastapi import FastAPI, Request
# Import CORSMiddleware to handle Cross-Origin Resource Sharing (allows frontend to communicate with backend)
from fastapi.middleware.cors import CORSMiddleware

# Import route modules that contain API endpoint logic
# predict module has stock prediction endpoints
# movers module has stock movers data (trending stocks)
# history module has historical data endpoints
from api.routes import predict, movers, history, charts

# Create the FastAPI application instance with metadata
app = FastAPI(
    # API title shown in documentation
    title = "StockSense API",
    # Description of what the API does
    description = "AI Powered Stock Prediction API",
    # Current version of the API
    version = "1.0.0"
)

# Add CORS (Cross-Origin Resource Sharing) middleware to the application
# This allows the frontend (running on different origin/port) to make requests to this backend
# Build allowed origins list - include localhost for development and deployed frontend URLs
frontend_origin = os.getenv("FRONTEND_ORIGIN", "https://frontend-00g7.onrender.com")
allowed_origins = [
    "http://localhost:3000",      # Development: React dev server
    "http://127.0.0.1:3000",      # Development: Alternative localhost
    frontend_origin,                # Render frontend (or custom domain via env var)
]

app.add_middleware(
    # Use CORSMiddleware to handle CORS
    CORSMiddleware,
    # Allow requests from localhost (development) and Vercel (production)
    # Without this, the browser would block requests due to same-origin policy
    allow_origins = allowed_origins,
    # Allow credentials (cookies, authorization headers) in cross-origin requests
    allow_credentials = True,
    # Allow all HTTP methods: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD, TRACE
    allow_methods = ["*"],
    # Allow all HTTP headers in requests (Content-Type, Authorization, etc.)
    allow_headers = ["*"],
    # Allow Vercel preview domains without listing each one manually
    allow_origin_regex=r"https://.*\.vercel\.app"
)

# Register route modules with the FastAPI app
# Router is like a group of related API endpoints

# Include predict router - endpoints for stock price predictions
# prefix="/predict" means all endpoints in this router will start with /predict
# tags=["Predictions"] categorizes these endpoints in the documentation UI
app.include_router(predict.router, prefix="/predict", tags = ["Predictions"])

# Include movers router - endpoints for trending/moving stocks
# prefix="/movers" means all endpoints will start with /movers
# tags=["Movers"] categorizes these endpoints in documentation
app.include_router(movers.router, prefix="/movers", tags = ["Movers"])

# Include history router - endpoints for historical stock data
# prefix="/history" means all endpoints will start with /history
# tags=["History"] categorizes these endpoints in documentation
app.include_router(history.router, prefix="/history", tags = ["History"])

app.include_router(charts.router, prefix="/charts", tags=["charts"])

# Define the root endpoint (GET request to /)
# This is the first endpoint users visit to check if API is working
@app.get("/")
# Function that handles GET requests to the root path
def root(request: Request):
    docs_url = str(request.base_url).rstrip("/") + "/docs"
    # Return a welcome message with API information
    return {
        "message": "Welcome to StockSense API",
        "status": "API is running",
        # Direct users to the auto-generated interactive API documentation (SwaggerUI)
        "docs": f"Visit {docs_url} for API documentation"
    }

# Define a health check endpoint (GET request to /health)
# Used to monitor if API is alive and responsive
@app.get("/health")
# Function that handles GET requests to /health
def health_check():
    # Return simple status indicating API is up
    return {
        "status": "healthy",
        "message": "API is up and running"
    }