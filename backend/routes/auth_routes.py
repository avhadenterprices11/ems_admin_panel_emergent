from fastapi import APIRouter, Depends, Header
from typing import Optional

from dtos.auth_dto import LoginDTO, TokenResponseDTO, TokenValidationDTO
from controllers.auth_controller import AuthController
from services.auth_service import AuthService
from dependencies import get_database


router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_auth_controller(db=Depends(get_database)) -> AuthController:
    """Dependency injection for auth controller"""
    auth_service = AuthService(db)
    return AuthController(auth_service)


@router.post("/login", response_model=TokenResponseDTO)
async def login(
    login_dto: LoginDTO,
    controller: AuthController = Depends(get_auth_controller)
):
    """Login endpoint"""
    return await controller.login(login_dto)


@router.post("/logout")
async def logout(
    controller: AuthController = Depends(get_auth_controller)
):
    """Logout endpoint"""
    return await controller.logout()


@router.get("/validate", response_model=TokenValidationDTO)
async def validate_token(
    authorization: Optional[str] = Header(None),
    controller: AuthController = Depends(get_auth_controller)
):
    """Token validation endpoint"""
    return await controller.validate_token(authorization)
