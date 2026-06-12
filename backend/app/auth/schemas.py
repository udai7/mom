from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class OfficeOut(BaseModel):
    id: str | None
    name: str | None
    code: str | None
    type: str | None
    dm_root_id: str | None = None


class UserOut(BaseModel):
    id: str
    full_name: str
    designation: str
    email: EmailStr
    mobile_number: str
    role: str
    status: str
    office: OfficeOut
    permissions: list[str]
    must_change_password: bool


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class RefreshResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class OkResponse(BaseModel):
    ok: bool

