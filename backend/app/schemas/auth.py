from pydantic import BaseModel, Field, EmailStr

class RegisterRequest(BaseModel):
    email: str = Field(..., description="User email", min_length=5)
    password: str = Field(..., description="User password", min_length=6)
    name: str = Field(..., description="Display name", min_length=1)

class LoginRequest(BaseModel):
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: str
    name: str

    class Config:
        from_attributes = True
