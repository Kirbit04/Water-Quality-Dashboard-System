from fastapi import APIRouter, HTTPException, Depends, status
import logging
from typing import List

from ..domain.schemas import LabTestCreate, LabTestResponse
from ..domain.model import LabTest
from ..services.repository import LabTestRepository
from ..core.database import get_db_instance
from ..core.settings import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/lab-tests", tags=["lab-tests"])


class LabTestService:
    """Service for lab test business logic"""
    
    def __init__(self, repo: LabTestRepository):
        self.repo = repo
    
    def submit_test(self, user_id: int, test_data: LabTestCreate) -> LabTest:
        """Submit a new lab test"""
        lab_test = LabTest(
            user_id=user_id,
            occupation=test_data.occupation,
            location=test_data.location,
            date_of_test=test_data.date_of_test,
            ph=test_data.ph,
            turbidity=test_data.turbidity,
            salinity=test_data.salinity,
            dissolved_oxygen=test_data.dissolved_oxygen,
            nitrates=test_data.nitrates,
            phosphates=test_data.phosphates
        )
        
        created = self.repo.create(lab_test)
        if not created:
            raise ValueError("Failed to create lab test")
        
        logger.info(f"Lab test submitted by user {user_id}")
        return created
    
    def get_user_tests(self, user_id: int, skip: int = 0, limit: int = 100) -> List[LabTest]:
        """Get all test submissions for a user"""
        return self.repo.get_by_user_id(user_id, skip, limit)
    
    def get_all_tests(self, skip: int = 0, limit: int = 100) -> List[LabTest]:
        """Get all test submissions (admin)"""
        return self.repo.get_all(skip, limit)
    
    def get_test(self, test_id: int) -> LabTest:
        """Get a specific test"""
        test = self.repo.get_by_id(test_id)
        if not test:
            raise ValueError("Test not found")
        return test


class LabTestController:
    """Controller for lab test endpoints"""
    
    def __init__(self, service: LabTestService):
        self.service = service
    
    async def submit(self, user_id: int, test_data: LabTestCreate) -> LabTestResponse:
        """Submit a lab test"""
        try:
            lab_test = self.service.submit_test(user_id, test_data)
            
            return LabTestResponse(
                id=lab_test.id,
                user_id=lab_test.user_id,
                occupation=lab_test.occupation,
                location=lab_test.location,
                date_of_test=lab_test.date_of_test,
                ph=lab_test.ph,
                turbidity=lab_test.turbidity,
                salinity=lab_test.salinity,
                dissolved_oxygen=lab_test.dissolved_oxygen,
                nitrates=lab_test.nitrates,
                phosphates=lab_test.phosphates,
                created_at=lab_test.created_at,
                updated_at=lab_test.updated_at
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error(f"Submit test error: {e}")
            raise HTTPException(status_code=500, detail="Failed to submit test")
    
    async def get_user_tests(self, user_id: int, skip: int = 0, limit: int = 100) -> List[LabTestResponse]:
        """Get user's test submissions"""
        try:
            tests = self.service.get_user_tests(user_id, skip, limit)
            
            return [
                LabTestResponse(
                    id=t.id,
                    user_id=t.user_id,
                    occupation=t.occupation,
                    location=t.location,
                    date_of_test=t.date_of_test,
                    ph=t.ph,
                    turbidity=t.turbidity,
                    salinity=t.salinity,
                    dissolved_oxygen=t.dissolved_oxygen,
                    nitrates=t.nitrates,
                    phosphates=t.phosphates,
                    created_at=t.created_at,
                    updated_at=t.updated_at
                )
                for t in tests
            ]
        except Exception as e:
            logger.error(f"Get user tests error: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve tests")


def get_lab_test_service() -> LabTestService:
    """Dependency injection for LabTestService"""
    db = get_db_instance()
    repo = LabTestRepository(db)
    return LabTestService(repo)


# Route endpoints
@router.post("", response_model=LabTestResponse, status_code=status.HTTP_201_CREATED)
async def submit_test(
    test_data: LabTestCreate,
    user_id: int = 1,  # TODO: Get from JWT token
    service: LabTestService = Depends(get_lab_test_service)
) -> LabTestResponse:
    """
    Submit a water quality lab test
    
    **Request body:**
    - **occupation**: User's occupation
    - **location**: Test location
    - **date_of_test**: Date of test (optional)
    - **ph**: pH level (0-14)
    - **turbidity**: Turbidity value
    - **salinity**: Salinity value
    - **dissolved_oxygen**: Dissolved oxygen level
    - **nitrates**: Nitrates level
    - **phosphates**: Phosphates level
    
    **Returns:** LabTestResponse with test details and ID
    """
    controller = LabTestController(service)
    return await controller.submit(user_id, test_data)


@router.get("/user/{user_id}", response_model=List[LabTestResponse])
async def get_user_tests(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    service: LabTestService = Depends(get_lab_test_service)
) -> List[LabTestResponse]:
    """
    Get all lab tests submitted by a user
    
    **Path Parameters:**
    - **user_id**: User ID
    
    **Query Parameters:**
    - **skip**: Number of records to skip (default: 0)
    - **limit**: Maximum records to return (default: 100)
    
    **Returns:** List of LabTestResponse objects
    """
    controller = LabTestController(service)
    return await controller.get_user_tests(user_id, skip, limit)


@router.get("", response_model=List[LabTestResponse])
async def get_all_tests(
    skip: int = 0,
    limit: int = 100,
    service: LabTestService = Depends(get_lab_test_service)
) -> List[LabTestResponse]:
    """
    Get all lab tests (admin endpoint)
    
    **Query Parameters:**
    - **skip**: Number of records to skip (default: 0)
    - **limit**: Maximum records to return (default: 100)
    
    **Returns:** List of LabTestResponse objects
    """
    try:
        tests = service.get_all_tests(skip, limit)
        
        return [
            LabTestResponse(
                id=t.id,
                user_id=t.user_id,
                occupation=t.occupation,
                location=t.location,
                date_of_test=t.date_of_test,
                ph=t.ph,
                turbidity=t.turbidity,
                salinity=t.salinity,
                dissolved_oxygen=t.dissolved_oxygen,
                nitrates=t.nitrates,
                phosphates=t.phosphates,
                created_at=t.created_at,
                updated_at=t.updated_at
            )
            for t in tests
        ]
    except Exception as e:
        logger.error(f"Get all tests error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve tests")


@router.get("/{test_id}", response_model=LabTestResponse)
async def get_test(
    test_id: int,
    service: LabTestService = Depends(get_lab_test_service)
) -> LabTestResponse:
    """
    Get a specific lab test by ID
    
    **Path Parameters:**
    - **test_id**: Lab test ID
    
    **Returns:** LabTestResponse with test details
    """
    try:
        test = service.get_test(test_id)
        
        return LabTestResponse(
            id=test.id,
            user_id=test.user_id,
            occupation=test.occupation,
            location=test.location,
            date_of_test=test.date_of_test,
            ph=test.ph,
            turbidity=test.turbidity,
            salinity=test.salinity,
            dissolved_oxygen=test.dissolved_oxygen,
            nitrates=test.nitrates,
            phosphates=test.phosphates,
            created_at=test.created_at,
            updated_at=test.updated_at
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Test not found")
    except Exception as e:
        logger.error(f"Get test error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve test")
