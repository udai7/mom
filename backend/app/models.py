from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Office(Base):
    __tablename__ = "offices"
    __table_args__ = (UniqueConstraint("parent_id", "code_slug", "code_sequence"),)

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    parent_id: Mapped[UUID | None] = mapped_column(ForeignKey("offices.id"), nullable=True)
    dm_root_id: Mapped[UUID | None] = mapped_column(ForeignKey("offices.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255))
    code: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    code_slug: Mapped[str] = mapped_column(String(80))
    code_sequence: Mapped[int] = mapped_column(Integer)
    type: Mapped[str] = mapped_column(String(50))
    department: Mapped[str | None] = mapped_column(String(120), nullable=True)
    official_email: Mapped[str] = mapped_column(String(255))
    official_phone: Mapped[str] = mapped_column(String(40))
    address_line_1: Mapped[str] = mapped_column(String(255))
    address_line_2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    district: Mapped[str] = mapped_column(String(120))
    state: Mapped[str] = mapped_column(String(120))
    pincode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    approval_status: Mapped[str] = mapped_column(String(50), default="APPROVED")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    parent: Mapped["Office | None"] = relationship(
        "Office", foreign_keys=[parent_id], remote_side=[id]
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    office_id: Mapped[UUID | None] = mapped_column(ForeignKey("offices.id"), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255))
    designation: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    mobile_number: Mapped[str] = mapped_column(String(40))
    employee_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    password_hash: Mapped[str] = mapped_column(Text)
    role: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE")
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=False)
    password_changed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    office: Mapped[Office | None] = relationship("Office", foreign_keys=[office_id])


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_ip: Mapped[str | None] = mapped_column(INET, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped[User] = relationship("User")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    actor_user_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    event_type: Mapped[str] = mapped_column(String(80))
    entity_type: Mapped[str] = mapped_column(String(80))
    entity_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    event_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ip_address: Mapped[str | None] = mapped_column(INET, nullable=True)


class OfficeAncestor(Base):
    __tablename__ = "office_ancestors"

    ancestor_office_id: Mapped[UUID] = mapped_column(ForeignKey("offices.id"), primary_key=True)
    descendant_office_id: Mapped[UUID] = mapped_column(ForeignKey("offices.id"), primary_key=True)
    depth: Mapped[int] = mapped_column(Integer)


class AccountRegistrationRequest(Base):
    __tablename__ = "account_registration_requests"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    office_id: Mapped[UUID] = mapped_column(ForeignKey("offices.id"))
    primary_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    parent_office_id: Mapped[UUID | None] = mapped_column(ForeignKey("offices.id"), nullable=True)
    requested_role: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50), default="PENDING")
    submitted_payload: Mapped[dict] = mapped_column(JSONB, default=dict)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    reviewed_by_user_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    review_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    office: Mapped[Office] = relationship("Office", foreign_keys=[office_id])
    primary_user: Mapped[User] = relationship("User", foreign_keys=[primary_user_id])


