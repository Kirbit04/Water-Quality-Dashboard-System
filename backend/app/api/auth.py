from fastapi import APIRouter, HTTPException, Depends, status
import logging

from ..domain.schemas import UserLogin, Token, UserResponse
from ..services.service import UserService
from ..core.database import get_db_instance
from ..core.settings import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


class AuthController:
    """Controller class for authentication endpoints following OOP principles"""

    def __init__(self, service: UserService):
        self.service = service

    async def login(self, credentials: UserLogin) -> Token:
        """
        Authenticate user and return access token
        
        Args:
            credentials: UserLogin schema with email and password
            
        Returns:
            Token schema with access token and metadata
            
        Raises:
            HTTPException if authentication fails
        """
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

            # Generate token
            token = self.service.create_token_for_user(user)

            logger.info(f"User logged in successfully: {user.email}")

            return token

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred during login"
            )

    async def get_profile(self, user_id: int) -> UserResponse:
        """
        Get authenticated user profile
        
        Args:
            user_id: User ID from token
            
        Returns:
            UserResponse with user details
            
        Raises:
            HTTPException if user not found
        """
        try:
            user = self.service.get_user_by_id(user_id)

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )

            return UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                phone_number=user.phone_number,
                is_active=user.is_active,
                created_at=user.created_at,
                updated_at=user.updated_at
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Get profile error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred while fetching profile"
            )


def get_user_service() -> UserService:
    """
    Dependency injection for UserService
    
    Returns:
        UserService instance with database and settings
    """
    db = get_db_instance()
    settings = get_settings()
    return UserService(db, settings)


# Route endpoints
@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    service: UserService = Depends(get_user_service)
) -> Token:
    """
    User login endpoint
    
    **Request body:**
    - **email**: Valid email address
    - **password**: User password
    
    **Returns:** Token with access_token, token_type, and expires_in
    
    **Example response:**
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_type": "bearer",
        "expires_in": 1800
    }
    ```
    """
    controller = AuthController(service)
    return await controller.login(credentials)


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    user_id: int,
    service: UserService = Depends(get_user_service)
) -> UserResponse:
    """
    Get authenticated user profile
    
    **Query Parameters:**
    - **user_id**: User ID (from JWT token claims)
    
    **Returns:** UserResponse with user profile details
    """
    controller = AuthController(service)
    return await controller.get_profile(user_id)


@router.post("/verify-token")
async def verify_token(
    token: str,
    service: UserService = Depends(get_user_service)
):
    """
    Verify JWT token validity
    
    **Query Parameters:**
    - **token**: JWT access token
    
    **Returns:** User information if token is valid
    """
    try:
        user = service.verify_token(token)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )

        return {
            "valid": True,
            "user_id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }

    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
