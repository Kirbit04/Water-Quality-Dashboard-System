from fastapi import APIRouter, HTTPException, Depends, status
import logging
from typing import List

from ..domain.schemas import ContactMessageCreate, ContactMessageResponse
from ..domain.model import ContactMessage
from ..services.repository import ContactMessageRepository
from ..core.database import get_db_instance

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contact", tags=["contact"])


class ContactService:
    #Service for contact message business logic
    
    def __init__(self, repo: ContactMessageRepository):
        self.repo = repo
    
    def submit_message(self, message_data: ContactMessageCreate) -> ContactMessage:
        #Submit a new message
        contact = ContactMessage(
            name=message_data.name,
            email=message_data.email,
            message=message_data.message,
            is_read=False
        )
        
        created = self.repo.create(contact)
        if not created:
            raise ValueError("Failed to submit message")
        
        logger.info(f"Contact message submitted from {message_data.email}")
        return created
    
    def get_all_messages(self, skip: int = 0, limit: int = 100) -> List[ContactMessage]:
        
        #Get all contact messages as admin
        return self.repo.get_all(skip, limit)
    
    def get_message(self, message_id: int) -> ContactMessage:
        """Get a specific message"""
        message = self.repo.get_by_id(message_id)
        if not message:
            raise ValueError("Message not found")
        return message
    
    def mark_as_read(self, message_id: int) -> bool:
        """Mark message as read"""
        return self.repo.mark_as_read(message_id)


class ContactController:
    #Controller for contact endpoints"""
    
    def __init__(self, service: ContactService):
        self.service = service
    
    async def submit(self, message_data: ContactMessageCreate) -> ContactMessageResponse:
        #Submit a contact message"""
        try:
            message = self.service.submit_message(message_data)
            
            return ContactMessageResponse(
                id=message.id,
                name=message.name,
                email=message.email,
                message=message.message,
                is_read=message.is_read,
                created_at=message.created_at,
                updated_at=message.updated_at
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error(f"Submit message error: {e}")
            raise HTTPException(status_code=500, detail="Failed to submit message")


def get_contact_service() -> ContactService:
    """Dependency injection for ContactService"""
    db = get_db_instance()
    repo = ContactMessageRepository(db)
    return ContactService(repo)


# Route endpoints
@router.post("", response_model=ContactMessageResponse, status_code=status.HTTP_201_CREATED)
async def submit_message(
    message_data: ContactMessageCreate,
    service: ContactService = Depends(get_contact_service)
) -> ContactMessageResponse:
    """
    Submit a contact message
    
    **Request body:**
    - **name**: Sender's name (2-100 characters)
    - **email**: Sender's email address
    - **message**: Message content (minimum 10 characters)
    
    **Returns:** ContactMessageResponse with message details and ID
    """
    controller = ContactController(service)
    return await controller.submit(message_data)


@router.get("", response_model=List[ContactMessageResponse])
async def get_all_messages(
    skip: int = 0,
    limit: int = 100,
    service: ContactService = Depends(get_contact_service)
) -> List[ContactMessageResponse]:
    """
    Get all contact messages (admin endpoint)
    
    **Query Parameters:**
    - **skip**: Number of records to skip (default: 0)
    - **limit**: Maximum records to return (default: 100)
    
    **Returns:** List of ContactMessageResponse objects
    """
    try:
        messages = service.get_all_messages(skip, limit)
        
        return [
            ContactMessageResponse(
                id=m.id,
                name=m.name,
                email=m.email,
                message=m.message,
                is_read=m.is_read,
                created_at=m.created_at,
                updated_at=m.updated_at
            )
            for m in messages
        ]
    except Exception as e:
        logger.error(f"Get all messages error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve messages")


@router.get("/{message_id}", response_model=ContactMessageResponse)
async def get_message(
    message_id: int,
    service: ContactService = Depends(get_contact_service)
) -> ContactMessageResponse:
    """
    Get a specific contact message by ID
    
    **Path Parameters:**
    - **message_id**: Contact message ID
    
    **Returns:** ContactMessageResponse with message details
    """
    try:
        message = service.get_message(message_id)
        
        return ContactMessageResponse(
            id=message.id,
            name=message.name,
            email=message.email,
            message=message.message,
            is_read=message.is_read,
            created_at=message.created_at,
            updated_at=message.updated_at
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Message not found")
    except Exception as e:
        logger.error(f"Get message error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve message")


@router.patch("/{message_id}/read")
async def mark_message_as_read(
    message_id: int,
    service: ContactService = Depends(get_contact_service)
):
    """
    Mark a contact message as read (admin endpoint)
    
    **Path Parameters:**
    - **message_id**: Contact message ID
    
    **Returns:** Success status
    """
    try:
        success = service.mark_as_read(message_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Message not found")
        
        return {"message": "Message marked as read", "message_id": message_id}
    except Exception as e:
        logger.error(f"Mark as read error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update message")
