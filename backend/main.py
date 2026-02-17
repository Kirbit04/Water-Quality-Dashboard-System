from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import shutil
from pathlib import Path

from app.core.settings import get_settings
from app.core.database import get_db_instance
from app.api import auth, users, lab_test, contact

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    logger.info(" Starting FastAPI application...")
    
    try:
        # Initialize database
        db = get_db_instance()
        db.initialize()
        logger.info(" Database initialized successfully")
        
        # Test connection
        if db.test_connection():
            logger.info(" Database connection verified")
        else:
            logger.warning("  Database connection test failed")

    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down FastAPI application...")
    db = get_db_instance()
    db.close()
    logger.info("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Water Quality Dashboard System - FastAPI backend with MySQL",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

#removing __pycache__ directories at startup to prevent stale bytecode issues
def clean_pycache():
    try:
        for path in Path(".").rglob("__pycache__"):
            if path.is_dir():
                try:
                    shutil.rmtree(path)
                    logger.debug(f"Deleted __pycache__: {path}")
                except PermissionError:
                    logger.debug(f"Skipped locked __pycache__: {path}")
                except Exception as e:
                    logger.debug(f"Could not delete {path}: {e}")
    except Exception as e:
        logger.debug(f"Error during pycache cleanup: {e}")

# Call at startup (won't fail if there are permission errors)
try:
    clean_pycache()
except Exception as e:
    logger.warning(f"Pycache cleanup encountered issues: {e}")
# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "status": "running",
        "docs": "/docs",
        "api": settings.API_V1_PREFIX
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db = get_db_instance()
    db_healthy = db.test_connection()
    
    return {
        "status": "healthy" if db_healthy else "unhealthy",
        "database": "connected" if db_healthy else "disconnected",
    }


# Include API routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(lab_test.router, prefix=settings.API_V1_PREFIX)
app.include_router(contact.router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level="info"
    )