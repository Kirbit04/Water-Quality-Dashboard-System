from typing import Optional, List
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import logging

from ..domain.model import User
from ..domain.schemas import UserCreate, UserUpdate, Token
from ..services.repository import UserRepository
from ..core.database import Database
from ..core.settings import Settings

logger = logging.getLogger(__name__)


class PasswordService:
    """Service for password hashing and verification"""
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def hash_password(self, password: str) -> str:
        """Hash a password"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)


class TokenService:
    """Service for JWT token generation and verification"""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def decode_token(self, token: str) -> Optional[dict]:
        """Decode and verify JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.PyJWTError as e:
            logger.error(f"Token decode error: {e}")
            return None


class UserService:
    """Service class for user-related business logic"""
    
    def __init__(self, database: Database, settings: Settings):
        self.repository = UserRepository(database)
        self.password_service = PasswordService()
        self.token_service = TokenService(settings)
        self.settings = settings
    
    def create_user(self, user_data: UserCreate) -> Optional[User]:
        """
        Create a new user
        
        Args:
            user_data: UserCreate schema with user information
            
        Returns:
            Created User object if successful, None otherwise
        """
        # Check if email already exists
        if self.repository.exists_by_email(user_data.email):
            logger.warning(f"Email already exists: {user_data.email}")
            raise ValueError("Email already exists")
        
        # Hash password
        hashed_password = self.password_service.hash_password(user_data.password)
        
        # Create user object
        user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            phone_number=user_data.phone_number,
            hashed_password=hashed_password,
            is_active=True,
            is_superuser=False
        )
        
        # Save to database
        created_user = self.repository.create(user)
        
        if created_user:
            logger.info(f" User created successfully: {created_user.email}")
        
        return created_user
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate user with email and password
        
        Args:
            email: User email
            password: Plain password
            
        Returns:
            User object if authenticated, None otherwise
        """
        user = self.repository.get_by_email(email)
        
        if not user:
            logger.warning(f"User not found: {email}")
            return None
        
        if not self.password_service.verify_password(password, user.hashed_password):
            logger.warning(f"Invalid password for user: {email}")
            return None
        
        if not user.is_active:
            logger.warning(f"Inactive user attempted login: {email}")
            return None
        
        logger.info(f" User authenticated: {email}")
        return user
    
    def create_token_for_user(self, user: User) -> Token:
        """
        Create access token for user
        
        Args:
            user: User object
            
        Returns:
            Token schema with access token
        """
        access_token_expires = timedelta(minutes=self.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        access_token = self.token_service.create_access_token(
            data={"sub": user.email, "user_id": user.id},
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=self.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return self.repository.get_by_id(user_id)
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.repository.get_by_email(email)
    
    def get_all_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination"""
        return self.repository.get_all(skip=skip, limit=limit)
    
    def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """
        Update user information
        
        Args:
            user_id: User ID
            user_data: UserUpdate schema with fields to update
            
        Returns:
            Updated User object if successful, None otherwise
        """
        update_data = user_data.model_dump(exclude_unset=True)
        
        # Hash password if provided
        if 'password' in update_data:
            update_data['hashed_password'] = self.password_service.hash_password(
                update_data.pop('password')
            )
        
        updated_user = self.repository.update(user_id, **update_data)
        
        if updated_user:
            logger.info(f" User updated: ID {user_id}")
        
        return updated_user
    
    def delete_user(self, user_id: int) -> bool:
        """Delete user"""
        return self.repository.delete(user_id)
    
    def verify_token(self, token: str) -> Optional[User]:
        """
        Verify token and return user
        
        Args:
            token: JWT token
            
        Returns:
            User object if token is valid, None otherwise
        """
        payload = self.token_service.decode_token(token)
        
        if not payload:
            return None
        
        email = payload.get("sub")
        if not email:
            return None
        
        user = self.repository.get_by_email(email)
        return user