from fastapi import APIRouter, HTTPException, Depends, status
import logging

from ..domain.schemas import UserCreate, UserResponse
from ..services.service import UserService
from ..core.database import get_db_instance
from ..core.settings import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])


class UserController:

    def __init__(self, service: UserService):
        self.service = service

    async def signup(self, user_data: UserCreate) -> UserResponse:
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

            return UserResponse.model_validate(created_user, from_attributes=True)

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

    db = get_db_instance()
    settings = get_settings()
    return UserService(db, settings)


# Route endpoints
@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    user_data: UserCreate,
    service: UserService = Depends(get_user_service)
) -> UserResponse:
    controller = UserController(service)
    return await controller.signup(user_data)


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
) -> UserResponse:
    
    user = service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse.model_validate(user, from_attributes=True)
