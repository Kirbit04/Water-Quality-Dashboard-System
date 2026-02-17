from typing import Optional, List
from mysql.connector import Error
import logging

from ..domain.model import User, LabTest, ContactMessage
from ..core.database import Database

logger = logging.getLogger(__name__)


class UserRepository:
    #Repository class for User database operations using OOP principles
    
    def __init__(self, database: Database):
        self.db = database
    
    def create(self, user: User) -> Optional[User]:
        """
        Create a new user in the database
        
        Args:
            user: User object to create
            
        Returns:
            User object with ID if successful, None otherwise
        """
        query = """
        INSERT INTO users (email, full_name, phone_number, hashed_password, 
                          is_active, is_superuser)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (
                    user.email,
                    user.full_name,
                    user.phone_number,
                    user.hashed_password,
                    user.is_active,
                    user.is_superuser
                ))
                user.id = cursor.lastrowid
                logger.info(f" User created: {user.email} (ID: {user.id})")
                return user
        except Error as e:
            logger.error(f" Error creating user: {e}")
            return None
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """
        Get user by ID
        
        Args:
            user_id: User ID
            
        Returns:
            User object if found, None otherwise
        """
        query = "SELECT * FROM users WHERE id = %s"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (user_id,))
                result = cursor.fetchone()
                
                if result:
                    return User.from_dict(result)
                return None
        except Error as e:
            logger.error(f" Error getting user by ID: {e}")
            return None
    
    def get_by_username(self, username: str) -> Optional[User]:
        """
        Get user by email (email is used as login identifier)
        
        Args:
            username: Email address (for backward compatibility)
            
        Returns:
            User object if found, None otherwise
        """
        return self.get_by_email(username)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email
        
        Args:
            email: Email address
            
        Returns:
            User object if found, None otherwise
        """
        query = "SELECT * FROM users WHERE email = %s"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (email,))
                result = cursor.fetchone()
                
                if result:
                    return User.from_dict(result)
                return None
        except Error as e:
            logger.error(f" Error getting user by email: {e}")
            return None
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        """
        Get all users with pagination
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of User objects
        """
        query = "SELECT * FROM users ORDER BY created_at DESC LIMIT %s OFFSET %s"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (limit, skip))
                results = cursor.fetchall()
                
                return [User.from_dict(row) for row in results]
        except Error as e:
            logger.error(f" Error getting all users: {e}")
            return []
    
    def update(self, user_id: int, **kwargs) -> Optional[User]:
        """
        Update user information
        
        Args:
            user_id: User ID
            **kwargs: Fields to update
            
        Returns:
            Updated User object if successful, None otherwise
        """
        # Build dynamic update query
        allowed_fields = ['email', 'full_name', 'hashed_password', 'is_active', 'is_superuser']
        update_fields = {k: v for k, v in kwargs.items() if k in allowed_fields and v is not None}
        
        if not update_fields:
            logger.warning("No valid fields to update")
            return self.get_by_id(user_id)
        
        set_clause = ", ".join([f"{field} = %s" for field in update_fields.keys()])
        query = f"UPDATE users SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
        
        try:
            with self.db.get_cursor() as cursor:
                values = list(update_fields.values()) + [user_id]
                cursor.execute(query, values)
                
                if cursor.rowcount > 0:
                    logger.info(f" User updated: ID {user_id}")
                    return self.get_by_id(user_id)
                return None
        except Error as e:
            logger.error(f" Error updating user: {e}")
            return None
    
    def delete(self, user_id: int) -> bool:
        """
        Delete user by ID
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful, False otherwise
        """
        query = "DELETE FROM users WHERE id = %s"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (user_id,))
                
                if cursor.rowcount > 0:
                    logger.info(f" User deleted: ID {user_id}")
                    return True
                return False
        except Error as e:
            logger.error(f" Error deleting user: {e}")
            return False
    
    def exists_by_username(self, username: str) -> bool:
        """
        Check if email exists (email is used as login identifier)
        
        Args:
            username: Email address (for backward compatibility)
            
        Returns:
            True if exists, False otherwise
        """
        return self.exists_by_email(username)
    
    def exists_by_email(self, email: str) -> bool:
        """
        Check if email exists
        
        Args:
            email: Email to check
            
        Returns:
            True if exists, False otherwise
        """
        query = "SELECT EXISTS(SELECT 1 FROM users WHERE email = %s) as email_exists"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (email,))
                result = cursor.fetchone()
                return bool(result['email_exists'])
        except Error as e:
            logger.error(f" Error checking email existence: {e}")
            return False
    
    def count(self) -> int:
        """
        Count total number of users
        
        Returns:
            Total count of users
        """
        query = "SELECT COUNT(*) as total FROM users"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query)
                result = cursor.fetchone()
                return result['total']
        except Error as e:
            logger.error(f" Error counting users: {e}")
            return 0


class LabTestRepository:
    """Repository for lab test database operations"""
    
    def __init__(self, database: Database):
        self.db = database
    
    def create(self, lab_test: LabTest) -> Optional[LabTest]:
        """Create a new lab test"""
        query = """
        INSERT INTO lab_tests (user_id, occupation, location, date_of_test,
                               ph, turbidity, salinity, dissolved_oxygen, nitrates, phosphates)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (
                    lab_test.user_id,
                    lab_test.occupation,
                    lab_test.location,
                    lab_test.date_of_test,
                    lab_test.ph,
                    lab_test.turbidity,
                    lab_test.salinity,
                    lab_test.dissolved_oxygen,
                    lab_test.nitrates,
                    lab_test.phosphates
                ))
                lab_test.id = cursor.lastrowid
                logger.info(f" Lab test created: ID {lab_test.id}")
                return lab_test
        except Error as e:
            logger.error(f" Error creating lab test: {e}")
            return None
    
    def get_by_id(self, test_id: int) -> Optional[LabTest]:
        """Get lab test by ID"""
        query = "SELECT * FROM lab_tests WHERE id = %s"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (test_id,))
                result = cursor.fetchone()
                
                if result:
                    return LabTest.from_dict(result)
                return None
        except Error as e:
            logger.error(f" Error getting lab test: {e}")
            return None
    
    def get_by_user_id(self, user_id: int, skip: int = 0, limit: int = 100) -> List[LabTest]:
        """Get all lab tests for a user"""
        query = "SELECT * FROM lab_tests WHERE user_id = %s ORDER BY created_at DESC LIMIT %s OFFSET %s"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (user_id, limit, skip))
                results = cursor.fetchall()
                return [LabTest.from_dict(row) for row in results]
        except Error as e:
            logger.error(f" Error getting user lab tests: {e}")
            return []
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[LabTest]:
        """Get all lab tests"""
        query = "SELECT * FROM lab_tests ORDER BY created_at DESC LIMIT %s OFFSET %s"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (limit, skip))
                results = cursor.fetchall()
                return [LabTest.from_dict(row) for row in results]
        except Error as e:
            logger.error(f" Error getting all lab tests: {e}")
            return []
    
    def delete(self, test_id: int) -> bool:
        """Delete a lab test"""
        query = "DELETE FROM lab_tests WHERE id = %s"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (test_id,))
                return cursor.rowcount > 0
        except Error as e:
            logger.error(f" Error deleting lab test: {e}")
            return False


class ContactMessageRepository:
    """Repository for contact message database operations"""
    
    def __init__(self, database: Database):
        self.db = database
    
    def create(self, message: ContactMessage) -> Optional[ContactMessage]:
        """Create a new contact message"""
        query = """
        INSERT INTO contact_messages (name, email, message, is_read)
        VALUES (%s, %s, %s, %s)
        """
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (
                    message.name,
                    message.email,
                    message.message,
                    message.is_read
                ))
                message.id = cursor.lastrowid
                logger.info(f" Contact message created: ID {message.id}")
                return message
        except Error as e:
            logger.error(f" Error creating contact message: {e}")
            return None
    
    def get_by_id(self, message_id: int) -> Optional[ContactMessage]:
        """Get contact message by ID"""
        query = "SELECT * FROM contact_messages WHERE id = %s"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (message_id,))
                result = cursor.fetchone()
                
                if result:
                    return ContactMessage.from_dict(result)
                return None
        except Error as e:
            logger.error(f" Error getting contact message: {e}")
            return None
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[ContactMessage]:
        """Get all contact messages"""
        query = "SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT %s OFFSET %s"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (limit, skip))
                results = cursor.fetchall()
                return [ContactMessage.from_dict(row) for row in results]
        except Error as e:
            logger.error(f" Error getting contact messages: {e}")
            return []
    
    def mark_as_read(self, message_id: int) -> bool:
        """Mark message as read"""
        query = "UPDATE contact_messages SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (message_id,))
                return cursor.rowcount > 0
        except Error as e:
            logger.error(f" Error updating message: {e}")
            return False
    
    def delete(self, message_id: int) -> bool:
        """Delete a contact message"""
        query = "DELETE FROM contact_messages WHERE id = %s"
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (message_id,))
                return cursor.rowcount > 0
        except Error as e:
            logger.error(f" Error deleting message: {e}")
            return False