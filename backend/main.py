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
from fastapi import FastAPI, Request, HTTPException
# Import CORSMiddleware to handle Cross-Origin Resource Sharing (allows frontend to communicate with backend)
from fastapi.middleware.cors import CORSMiddleware
# Import JSONResponse for custom error responses with CORS headers
from fastapi.responses import JSONResponse

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
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",           # local development
        "https://your-app.vercel.app",     # replace with your Vercel URL after deploying frontend
        "*"                                # allows all origins (remove after testing)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Custom exception handlers to ensure CORS headers are always present ---
# When FastAPI raises an HTTPException (e.g. 500), the CORS middleware may not
# attach Access-Control-Allow-Origin to the error response, causing the browser
# to block it entirely. These handlers manually add the header so the frontend
# can read the error message instead of seeing a generic CORS error.

@app.exception_handler(HTTPException)
async def cors_http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTPException and ensure CORS headers are included."""
    origin = request.headers.get("origin", "")
    headers = {}
    # Only add the CORS header if the origin is in our allowed list
    if origin in allowed_origins or origin.endswith(".vercel.app"):
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers,
    )


@app.exception_handler(Exception)
async def cors_general_exception_handler(request: Request, exc: Exception):
    """Catch-all handler for unhandled exceptions – ensures CORS headers are present."""
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in allowed_origins or origin.endswith(".vercel.app"):
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    print(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers=headers,
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