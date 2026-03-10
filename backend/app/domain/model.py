from typing import Optional, Dict, Any
from datetime import datetime
from dataclasses import dataclass, field


@dataclass
class User:
    
    id: Optional[int] = None
    email: str = ""
    name: Optional[str] = None    
    phone: Optional[str] = None    
    hashed_password: str = ""
    is_active: bool = True
    role: str = ""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def __post_init__(self):
        #Post initialization processing
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        #Convert user object to dictionary
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "phone": self.phone,
            "hashed_password": self.hashed_password,
            "is_active": self.is_active,
            "role": self.role,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    def to_response_dict(self) -> Dict[str, Any]:
        #Convert user object to dictionary without sensitive data
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "phone": self.phone,
            "is_active": self.is_active,
            "role": self.role,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        #Create User instance from dictionary
        return cls(
            id=data.get('id') or data.get('user_id'),
            email=data.get('email', ''),
            name=data.get('name'),
            phone=data.get('phone'),
            hashed_password=data.get('hashed_password', ''),
            is_active=data.get('is_active', True),
            role=data.get('role'),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    def is_authenticated(self) -> bool:
        #Check if user is authenticated using ID
        return self.id is not None
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"
    
    def __str__(self) -> str:
        return f"User: {self.email}"


@dataclass
class LabTest:
    #Lab test model representing water quality test results
    
    id: Optional[int] = None
    user_id: int = 0
    occupation: str = ""
    location_id: int = 0
    date_of_test: Optional[datetime] = None
    ph: float = 0.0
    turbidity: float = 0.0
    salinity: float = 0.0
    dissolved_oxygen: float = 0.0
    nitrates: float = 0.0
    phosphates: float = 0.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def __post_init__(self):
        #Post initialization processing
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        #Convert to dictionary
        return {
            "id": self.id,
            "user_id": self.user_id,
            "occupation": self.occupation,
            "location_id": self.location_id,
            "date_of_test": self.date_of_test,
            "ph": self.ph,
            "turbidity": self.turbidity,
            "salinity": self.salinity,
            "dissolved_oxygen": self.dissolved_oxygen,
            "nitrates": self.nitrates,
            "phosphates": self.phosphates,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'LabTest':
        #Create instance from dictionary
        return cls(
            id=data.get('id'),
            user_id=data.get('user_id', 0),
            occupation=data.get('occupation', ''),
            location_id=data.get('location_id', ''),
            date_of_test=data.get('date_of_test'),
            ph=float(data.get('ph', 0)),
            turbidity=float(data.get('turbidity', 0)),
            salinity=float(data.get('salinity', 0)),
            dissolved_oxygen=float(data.get('dissolved_oxygen', 0)),
            nitrates=float(data.get('nitrates', 0)),
            phosphates=float(data.get('phosphates', 0)),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    def __repr__(self) -> str:
        return f"<LabTest(id={self.id}, user_id={self.user_id}, location='{self.location_id}')>"
    
    def __str__(self) -> str:
        return f"LabTest: {self.location_id} ({self.date_of_test})"


@dataclass
class ContactMessage:
    #Contact message model for user inquiries
    
    id: Optional[int] = None
    name: str = ""
    email: str = ""
    message: str = ""
    is_read: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def __post_init__(self):
        #Post initialization processing
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        #Convert to dictionary
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "message": self.message,
            "is_read": self.is_read,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ContactMessage':
        #Create instance from dictionary
        return cls(
            id=data.get('id'),
            name=data.get('name', ''),
            email=data.get('email', ''),
            message=data.get('message', ''),
            is_read=data.get('is_read', False),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    def __repr__(self) -> str:
        return f"<ContactMessage(id={self.id}, from='{self.email}')>"
    
    def __str__(self) -> str:
        return f"ContactMessage from {self.name} ({self.email})"