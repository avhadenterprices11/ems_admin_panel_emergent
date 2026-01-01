from typing import Optional
from datetime import datetime, timezone
import uuid
from motor.motor_asyncio import AsyncIOMotorDatabase

from dtos.auth_dto import LoginDTO, TokenResponseDTO, UserResponseDTO
from utils.password_utils import hash_password, verify_password
from utils.token_utils import create_access_token, decode_access_token


class AuthService:
    """Service layer for authentication business logic"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.users_collection = db.users
    
    async def login(self, login_dto: LoginDTO) -> TokenResponseDTO:
        """Authenticate user and return access token"""
        user = await self.users_collection.find_one(
            {"email": login_dto.email, "deleted_at": None},
            {"_id": 0}
        )
        
        if not user:
            raise ValueError("Invalid email or password")
        
        if not verify_password(login_dto.password_hash, user["password_hash"]):
            raise ValueError("Invalid email or password")
        
        token = create_access_token(data={"sub": user["id"], "email": user["email"]})
        
        return TokenResponseDTO(token=token)
    
    async def validate_token(self, token: str) -> Optional[UserResponseDTO]:
        """Validate token and return user information"""
        payload = decode_access_token(token)
        
        if not payload:
            return None
        
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        user = await self.users_collection.find_one(
            {"id": user_id, "deleted_at": None},
            {"_id": 0}
        )
        
        if not user:
            return None
        
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        if isinstance(user['updated_at'], str):
            user['updated_at'] = datetime.fromisoformat(user['updated_at'])
        
        return UserResponseDTO(**user)
    
    async def create_default_user(self):
        """Create a default admin user for testing (if not exists)"""
        existing_user = await self.users_collection.find_one(
            {"email": "admin@example.com", "deleted_at": None}
        )
        
        if existing_user:
            return
        
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        user_doc = {
            "id": user_id,
            "email": "admin@example.com",
            "password_hash": hash_password("admin123"),
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "deleted_at": None
        }
        
        await self.users_collection.insert_one(user_doc)
