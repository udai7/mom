from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID

class DMRegisterRequest(BaseModel):
    name: str
    official_email: EmailStr
    official_phone: str
    address_line_1: str
    address_line_2: str | None = None
    city: str | None = None
    district: str
    state: str
    pincode: str | None = None
    website: str | None = None
    admin_name: str
    admin_designation: str
    admin_email: EmailStr
    admin_mobile: str
    admin_password: str
    employee_id: str | None = None

class OfficeRegisterRequest(BaseModel):
    parent_id: UUID
    name: str
    office_slug: str | None = None
    type: str | None = None
    department: str | None = None
    official_email: EmailStr
    official_phone: str
    address_line_1: str
    address_line_2: str | None = None
    city: str | None = None
    district: str
    state: str
    pincode: str | None = None
    website: str | None = None
    admin_name: str
    admin_designation: str
    admin_email: EmailStr
    admin_mobile: str
    admin_password: str
    employee_id: str | None = None

class ApproveRequest(BaseModel):
    review_note: str | None = None

class RejectRequest(BaseModel):
    rejection_reason: str

class OfficeSchemaOut(BaseModel):
    id: UUID
    parent_id: UUID | None
    dm_root_id: UUID | None
    name: str
    code: str
    type: str
    approval_status: str
    is_active: bool

    class Config:
        from_attributes = True

class UserSchemaOut(BaseModel):
    id: UUID
    full_name: str
    designation: str
    email: EmailStr
    role: str
    status: str

    class Config:
        from_attributes = True

class RegistrationRequestOut(BaseModel):
    id: UUID
    office_id: UUID
    primary_user_id: UUID
    parent_office_id: UUID | None
    requested_role: str
    status: str
    submitted_payload: dict
    submitted_at: datetime
    reviewed_by_user_id: UUID | None
    reviewed_at: datetime | None
    review_note: str | None
    office: OfficeSchemaOut
    primary_user: UserSchemaOut

    class Config:
        from_attributes = True
