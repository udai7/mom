from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class MeetingGuestCreate(BaseModel):
    name: str
    phone: str
    email: str
    office: str
    department: str
    designation: str


class MeetingGuestOut(BaseModel):
    id: UUID
    meeting_id: UUID
    name: str
    phone: str
    email: str
    office: str
    department: str
    designation: str
    created_at: datetime

    class Config:
        from_attributes = True


class MeetingCreate(BaseModel):
    title: str
    agenda: str
    time: str
    date: str
    venue: str
    institution_name: str
    department_name: str
    meeting_type: str
    chairperson: str | None = None


class MeetingUpdate(BaseModel):
    title: str | None = None
    agenda: str | None = None
    time: str | None = None
    date: str | None = None
    venue: str | None = None
    institution_name: str | None = None
    department_name: str | None = None
    meeting_type: str | None = None
    chairperson: str | None = None
    status: str | None = None


class MeetingPostpone(BaseModel):
    date: str
    time: str


class MeetingOut(BaseModel):
    id: UUID
    office_id: UUID
    title: str
    agenda: str
    time: str
    date: str
    venue: str
    institution_name: str
    department_name: str
    meeting_type: str
    chairperson: str | None
    status: str
    created_at: datetime
    updated_at: datetime
    office_name: str | None = None
    guests: list[MeetingGuestOut] = []

    class Config:
        from_attributes = True
