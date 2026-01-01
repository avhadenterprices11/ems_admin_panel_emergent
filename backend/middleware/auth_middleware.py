from fastapi import HTTPException, Header, Depends
from typing import Optional

from utils.token_utils import decode_access_token
from dependencies import get_database


async def get_current_user(authorization: Optional[str] = Header(None), db=Depends(get_database)):
    """Middleware to extract and validate current user from token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = await db.users.find_one(
        {"id": user_id, "deleted_at": None},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user
