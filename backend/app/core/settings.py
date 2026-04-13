from pydantic_settings import BaseSettings
from functools import lru_cache
from fastapi import Depends, HTTPException, Request
from jose import jwt, JWTError


class Settings(BaseSettings):
    # Database settings
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "NewPassword123"
    DB_NAME: str = "aquaguard"
    
    #Application settings
    APP_NAME: str = "Water Quality Dashboard System"
    API_V1_PREFIX: str = "/api/v1"
    
    # Security Settings
    SECRET_KEY: str = "local-development-secret-key-354"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS Settings
    CORS_ORIGINS: list = [
        "http://localhost:3000",  
        "http://localhost:5173",  
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]
    EXPOSE_HEADERS: list = ["Content-Disposition"]
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True

    # Authentication dependency to get current user from JWT token
    async def get_current_user(self, request: Request) -> dict:
        token = request.cookies.get("authToken")

        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")

        try:
            payload = jwt.decode(
                token,
                self.SECRET_KEY,
                algorithms=[self.ALGORITHM]
            )

            user_id: int = payload.get("user_id")
            email: str   = payload.get("sub")

            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token")

            return {"id": user_id, "email": email}

        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid or expired token.")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

async def get_current_user(request: Request) -> dict:
    return await get_settings().get_current_user(request)