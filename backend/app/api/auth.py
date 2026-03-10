from fastapi import APIRouter, HTTPException, Depends, status, Response, Cookie
import logging

from ..domain.schemas import UserLogin, UserResponse
from ..services.service import UserService
from ..core.database import get_db_instance
from ..core.settings import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


class AuthController:

    def __init__(self, service: UserService):
        self.service = service

    async def login(self, credentials: UserLogin, response: Response) -> UserResponse:

        try:
            # Authenticate user
            user = self.service.authenticate_user(
                credentials.email,
                credentials.password
            )

            if not user:
                logger.warning(f"Failed authentication attempt for: {credentials.email}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password",
                    headers={"WWW-Authenticate": "Bearer"}
                )

            # Generate token and set as HTTP-only cookie
            token = self.service.create_token_for_user(user)
            response.set_cookie(
                key="authToken",
                value=token,
                httponly=True,
                secure=False,    
                samesite="lax",
                max_age=86400    #seconds
            )

            logger.info(f"User logged in successfully: {user.email}")

            #return user details
            return UserResponse.model_validate(user, from_attributes=True)
        
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred during login"
            )

    async def get_profile(self, auth_token: str) -> UserResponse:

        try:
            if not auth_token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated"
                )
            
            user = self.service.verify_token(auth_token)

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )

            return UserResponse.model_validate(user, from_attributes=True)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Get profile error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred while fetching profile"
            )
        
    async def logout(self, response: Response):
        try:
            response.delete_cookie(key="authToken")
            return {"message": "Logged out successfully"}
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred during logout"
            )

def get_user_service() -> UserService:

    db = get_db_instance()
    settings = get_settings()
    return UserService(db, settings)


# Route endpoints
@router.post("/login", response_model=UserResponse)
async def login(
    credentials: UserLogin,
    response: Response,
    service: UserService = Depends(get_user_service)
) -> UserResponse:
    controller = AuthController(service)
    return await controller.login(credentials, response)


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    authToken: str = Cookie(None),
    service: UserService = Depends(get_user_service)
) -> UserResponse:
    controller = AuthController(service)
    return await controller.get_profile(authToken)



@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("authToken")
    return {"message": "Logged out successfully"}


@router.post("/verify-token")
async def verify_token(
    authToken: str = Cookie(None),
    service: UserService = Depends(get_user_service)
):
    try:
        if not authToken:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        user = service.verify_token(authToken)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )

        return {
            "valid": True,
            "user_id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }

    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
