from pydantic import BaseModel
from datetime import date

class UserSignup(BaseModel):
    name: str
    email: str
    password: str
    phone: str

class UserLogin(BaseModel):
    email: str
    password: str
    role: str = "user"

class LabTestSubmit(BaseModel):
    occupation: str
    location: str
    dateOfTest: date
    ph: float
    turbidity: float
    salinity: float
    dissolvedOxygen: float
    nitrates: float
    phosphates: float

class ContactMessage(BaseModel):
    name: str
    email: str
    message: str