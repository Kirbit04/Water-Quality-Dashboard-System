from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
import re


class UserBase(BaseModel):
    #Base User schema with common attributes
    email: EmailStr = Field(..., description="Email address")
    name: Optional[str] = Field(None, max_length=100, description="Full name")
    role: str = Field(..., description="User role (e.g., 'user', 'admin')")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        """Validate phone number format: +254 followed by 9 digits or other country codes"""
        if v is None or v == '':
            return v
        
        # Remove any spaces or hyphens
        v = v.replace(" ", "").replace("-", "")
        
        # Pattern: + followed by 1-3 digit country code, then 9+ digits
        pattern = r'^\+\d{1,3}\d{9,}$'
        
        if v and not re.match(pattern, v):
            raise ValueError(
                'Invalid phone number format. Use format: +[country_code][9+ digits] '
                '(e.g., +254723456789 for Kenya)'
            )
        return v


class UserCreate(UserBase):
    #Schema for creating a new user"
    name: str = Field(..., max_length=100, description="Full name")
    password: str = Field(..., min_length=6, max_length=72, description="Password")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    role: str = Field(..., description="User role (e.g., 'user', 'admin')")

    @field_validator('password')
    @classmethod
    def validate_password_bytes(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot exceed 72 bytes. Please shorten it.')
        return v

    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "john@example.com",
                "name": "John Doe",
                "phone": "+254723456789",
                "password": "securepassword123",
                "role": "user"
            }
        }
    )


class UserUpdate(BaseModel):
    #Schema for updating user information
    email: Optional[EmailStr] = None
    name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    password: Optional[str] = Field(None, min_length=6, max_length=100)
    is_active: Optional[bool] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "newemail@example.com",
                "name": "John Updated Doe",
                "phone": "+254734567890",
                "is_active": True
            }
        }
    )


class UserInDB(UserBase):
    #Schema for user as stored in database
    id: int
    name: Optional[str]
    hashed_password: str
    phone: Optional[str]
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    
    model_config = ConfigDict(from_attributes=True)


class UserResponse(UserBase):
    #Schema for user response 
    id: int
    email: EmailStr
    name: str
    role: str
    phone: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "email": "john@example.com",
                "name": "John Doe",
                "phone": "+25473456789",
                "role": "user",
                "is_active": True,
                "created_at": "2024-01-23T10:30:00",
                "updated_at": "2024-01-23T10:30:00"
            }
        }
    )


class UserLogin(BaseModel):
    #Schema for user login
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")
    role: str = Field(..., description="User role (e.g., 'user', 'admin')")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "john@example.com",
                "password": "securepassword123",
                "role": "user"
            }
        }
    )

# Lab Test Schemas
class LabTestCreate(BaseModel):
    #Schema for creating a lab test
    occupation: str = Field(..., min_length=1, max_length=100, description="Occupation")
    location_id: int = Field(..., description="Location ID")
    date_of_test: Optional[datetime] = Field(None, description="Date of test")
    ph: float = Field(..., ge=0, le=14, description="pH level (0-14)")
    turbidity: float = Field(..., ge=0, description="Turbidity (positive number)")
    salinity: float = Field(..., ge=0, description="Salinity (positive number)")
    dissolved_oxygen: float = Field(..., ge=0, description="Dissolved oxygen (positive number)")
    nitrates: float = Field(..., ge=0, description="Nitrates (positive number)")
    phosphates: float = Field(..., ge=0, description="Phosphates (positive number)")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "occupation": "Farmer",
                "location_id": "1",
                "date_of_test": "2026-01-17",
                "ph": 7.5,
                "turbidity": 2.3,
                "salinity": 0.8,
                "dissolved_oxygen": 8.2,
                "nitrates": 15.0,
                "phosphates": 0.5
            }
        }
    )


class LabTestResponse(BaseModel):
    #Schema for lab test response
    id: int
    user_id: int
    occupation: str
    location_id: int
    date_of_test: Optional[datetime]
    ph: float
    turbidity: float
    salinity: float
    dissolved_oxygen: float
    nitrates: float
    phosphates: float
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "user_id": 1,
                "occupation": "Farmer",
                "location_id": "1",
                "date_of_test": "2026-01-17T00:00:00",
                "ph": 7.5,
                "turbidity": 2.3,
                "salinity": 0.8,
                "dissolved_oxygen": 8.2,
                "nitrates": 15.0,
                "phosphates": 0.5,
                "created_at": "2026-01-17T10:30:00",
                "updated_at": "2026-01-17T10:30:00"
            }
        }
    )


# Contact Message Schemas
class ContactMessageCreate(BaseModel):
    #Schema for creating a contact message
    name: str = Field(..., min_length=2, max_length=100, description="Name")
    email: EmailStr = Field(..., description="Email address")
    message: str = Field(..., min_length=10, max_length=5000, description="Message")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "message": "I have a question about water quality testing procedures and would like more information."
            }
        }
    )


class ContactMessageResponse(BaseModel):
    #Schema for contact message response
    id: int
    name: str
    email: str
    message: str
    is_read: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "message": "I have a question about water quality testing procedures and would like more information.",
                "is_read": False,
                "created_at": "2026-01-17T10:30:00",
                "updated_at": "2026-01-17T10:30:00"
            }
        }
    )