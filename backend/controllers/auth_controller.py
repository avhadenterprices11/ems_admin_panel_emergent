from fastapi import HTTPException, Header
from typing import Optional

from dtos.auth_dto import LoginDTO, TokenResponseDTO, TokenValidationDTO
from services.auth_service import AuthService


class AuthController:
    """Controller layer for authentication request handling"""
    
    def __init__(self, auth_service: AuthService):
        self.auth_service = auth_service
    
    async def login(self, login_dto: LoginDTO) -> TokenResponseDTO:
        """Handle login request"""
        try:
            token_response = await self.auth_service.login(login_dto)
            return token_response
        except ValueError as e:
            raise HTTPException(status_code=401, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail="Internal server error")
    
    async def validate_token(self, authorization: Optional[str] = Header(None)) -> TokenValidationDTO:
        """Handle token validation request"""
        if not authorization or not authorization.startswith("Bearer "):
            return TokenValidationDTO(valid=False, user=None)
        
        token = authorization.replace("Bearer ", "")
        
        try:
            user = await self.auth_service.validate_token(token)
            if user:
                return TokenValidationDTO(valid=True, user=user)
            return TokenValidationDTO(valid=False, user=None)
        except Exception:
            return TokenValidationDTO(valid=False, user=None)
    
    async def logout(self) -> dict:
        """Handle logout request"""
        return {"message": "Logged out successfully"}
