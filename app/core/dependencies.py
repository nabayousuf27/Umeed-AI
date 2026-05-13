"""
Authentication and authorization dependencies
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
import os
from app.core.config import supabase, JWT_SECRET_KEY, JWT_ALGORITHM


security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Extract and validate JWT token from Authorization header
    Returns user_id and role
    """
    token = credentials.credentials
    
    try:
        # Use centralized JWT configuration
        secret_key = JWT_SECRET_KEY
        algorithm = JWT_ALGORITHM



        
        # Decode and verify JWT token
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        user_id = payload.get("sub") or payload.get("user_id")
        role = payload.get("role", "borrower")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        return {"user_id": user_id, "role": role}
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation error: {str(e)}"
        )


def get_current_borrower(current_user: dict = Depends(get_current_user)):
    """Ensure the current user is a borrower"""
    if current_user.get("role") != "borrower":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Borrower access required."
        )
    return current_user


def get_current_admin(current_user: dict = Depends(get_current_user)):
    """Ensure the current user is an admin"""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin access required."
        )
    return current_user


# Optional dependency for endpoints that work with or without auth
def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    )
):
    """Optional authentication - returns user if token present, None otherwise"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        secret_key = JWT_SECRET_KEY
        algorithm = JWT_ALGORITHM


        
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        user_id = payload.get("sub") or payload.get("user_id")
        role = payload.get("role", "borrower")
        
        if user_id:
            return {"user_id": user_id, "role": role}
    except:
        pass
    
    return None


