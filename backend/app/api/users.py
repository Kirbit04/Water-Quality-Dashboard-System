from fastapi import APIRouter, HTTPException, Depends, status
import logging

from ..domain.schemas import UserCreate, UserResponse
from ..services.service import UserService
from ..core.database import get_db_instance
from ..core.settings import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])


class UserController:
    """Controller class for user endpoints following OOP principles"""

    def __init__(self, service: UserService):
        self.service = service

    async def signup(self, user_data: UserCreate) -> UserResponse:
        """
        Register a new user (signup endpoint)
        
        Args:
            user_data: UserCreate schema with user information
            
        Returns:
            UserResponse with created user details
            
        Raises:
            HTTPException if signup fails
        """
        try:
            # Create user via service
            created_user = self.service.create_user(user_data)

            if not created_user:
                logger.warning(f"Failed to create user: {user_data.email}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user"
                )

            logger.info(f"User signed up successfully: {created_user.email}")

            return UserResponse(
                id=created_user.id,
                email=created_user.email,
                full_name=created_user.full_name,
                phone_number=created_user.phone_number,
                is_active=created_user.is_active,
                created_at=created_user.created_at,
                updated_at=created_user.updated_at
            )

        except ValueError as e:
            logger.warning(f"Validation error during signup: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            logger.error(f"Signup error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred during signup"
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
@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    user_data: UserCreate,
    service: UserService = Depends(get_user_service)
) -> UserResponse:
    """
    User signup endpoint
    
    **Request body:**
    - **email**: Valid email address
    - **password**: Password (minimum 6 characters)
    - **full_name**: Optional full name
    - **phone_number**: Optional phone number
    
    **Returns:** UserResponse with created user details
    """
    controller = UserController(service)
    return await controller.signup(user_data)


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
) -> UserResponse:
    """
    Get current user profile
    
    Returns: UserResponse with user details
    """
    user = service.get_user_by_id(user_id)

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
