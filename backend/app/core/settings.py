from pydantic_settings import BaseSettings
from pydantic import field_validator, model_validator
from functools import lru_cache
from fastapi import HTTPException, Request
from jose import jwt, JWTError
from typing import List
import json


class Settings(BaseSettings):
    # Database settings
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    # Application settings
    APP_NAME: str
    API_V1_PREFIX: str = "/api/v1"

    # Security Settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS Settings — typed as str, parsed in validator
    CORS_ORIGINS: str = ""
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: str = "*"
    CORS_ALLOW_HEADERS: str = "*"
    EXPOSE_HEADERS: str = "Content-Disposition"

    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True

    def _parse_list(self, value: str) -> List[str]:
        #Parse comma-separated or JSON array string into a list.
        value = value.strip()
        if not value:
            return []
        if value.startswith("["):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                pass
        return [i.strip() for i in value.split(",") if i.strip()]

    @property
    def cors_origins_list(self) -> List[str]:
        return self._parse_list(self.CORS_ORIGINS)

    @property
    def cors_allow_methods_list(self) -> List[str]:
        return self._parse_list(self.CORS_ALLOW_METHODS)

    @property
    def cors_allow_headers_list(self) -> List[str]:
        return self._parse_list(self.CORS_ALLOW_HEADERS)

    @property
    def expose_headers_list(self) -> List[str]:
        return self._parse_list(self.EXPOSE_HEADERS)

    async def get_current_user(self, request: Request) -> dict:
        token = request.cookies.get("authToken")
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        try:
            payload = jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
            user_id: int = payload.get("user_id")
            email: str = payload.get("sub")
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