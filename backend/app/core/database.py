from typing import Generator
from mysql.connector import connect, Error
from contextlib import contextmanager
import logging
from .settings import Settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Database:
    #acessing database configuration from settings

    def __init__(self, settings: Settings):
        self.settings = settings

    def _get_connection(self):
        return connect(
            host=self.settings.DB_HOST,
            port=self.settings.DB_PORT,
            user=self.settings.DB_USER,
            password=self.settings.DB_PASSWORD,
            database=self.settings.DB_NAME,
            autocommit=False,
            raise_on_warnings=False,
        )

    @contextmanager
    def get_cursor(self, dictionary: bool = True) -> Generator:
        conn = None
        cursor = None
        try:
            conn = self._get_connection()
            cursor = conn.cursor(dictionary=dictionary)
            yield cursor
            conn.commit()
        except Error as e:
            if conn:
                conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def initialize(self) -> None:
        #Initialize database (create tables if needed)."""
        logger.info("Initializing database...")
        self._create_tables()
        logger.info("Database initialized successfully!")

    def _create_tables(self) -> None:
        create_users_table = """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            full_name VARCHAR(100),
            phone_number VARCHAR(20),
            hashed_password VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            is_superuser BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
        
        create_lab_tests_table = """
        CREATE TABLE IF NOT EXISTS lab_tests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            occupation VARCHAR(100),
            location VARCHAR(100),
            date_of_test DATETIME,
            ph DECIMAL(5, 2),
            turbidity DECIMAL(8, 2),
            salinity DECIMAL(8, 2),
            dissolved_oxygen DECIMAL(8, 2),
            nitrates DECIMAL(8, 2),
            phosphates DECIMAL(8, 2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
        
        create_contact_messages_table = """
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
        
        try:
            with self.get_cursor() as cursor:
                cursor.execute(create_users_table)
                logger.info("Database users table created/verified")
                
                cursor.execute(create_lab_tests_table)
                logger.info("Database lab_tests table created/verified")
                
                cursor.execute(create_contact_messages_table)
                logger.info("Database contact_messages table created/verified")
        except Error as e:
            logger.error(f"Error creating tables: {e}")
            raise

    def test_connection(self) -> bool:
        try:
            with self.get_cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            logger.info("Database connection test successful")
            return True
        except Error as e:
            logger.error(f"Database connection test failed: {e}")
            return False


# Dependency for FastAPI
def get_database() -> Database:
    from .settings import get_settings
    settings = get_settings()
    return Database(settings)


# Global database instance for convenience
_db_instance: Database | None = None


def get_db_instance() -> Database:
    global _db_instance
    if _db_instance is None:
        from .settings import get_settings
        settings = get_settings()
        _db_instance = Database(settings)
    return _db_instance