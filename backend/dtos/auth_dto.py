from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime


class LoginDTO(BaseModel):
    """DTO for user login request"""
    email: EmailStr
    password_hash: str = Field(..., min_length=6, description="User password")


class TokenResponseDTO(BaseModel):
    """DTO for authentication token response"""
    token: str
    token_type: str = "Bearer"


class UserResponseDTO(BaseModel):
    """DTO for user information response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    email: str
    created_at: datetime
    updated_at: datetime


class TokenValidationDTO(BaseModel):
    """DTO for token validation response"""
    valid: bool
    user: Optional[UserResponseDTO] = None
