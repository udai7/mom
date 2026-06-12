from uuid import UUID

import jwt
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.schemas import OfficeOut, UserOut
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    utcnow,
    verify_password,
)
from app.models import AuditEvent, RefreshToken, User


ROLE_PERMISSIONS = {
    "SUPER_ADMIN": [
        "accounts:view_all",
        "accounts:manage_all",
        "offices:view_all",
        "registrations:approve_all",
    ],
    "DM_ADMIN": [
        "accounts:view_dm",
        "accounts:manage_dm",
        "offices:view_dm",
        "registrations:approve_dm",
        "meetings:read_hierarchy",
    ],
    "OFFICE_ADMIN": [
        "meetings:create",
        "meetings:update_own",
        "summaries:submit_own",
        "registrations:approve_direct_children",
    ],
    "OFFICE_MEMBER": ["meetings:read_visible", "actions:update_assigned"],
}


def user_to_out(user: User) -> UserOut:
    office = user.office
    return UserOut(
        id=str(user.id),
        full_name=user.full_name,
        designation=user.designation,
        email=user.email,
        mobile_number=user.mobile_number,
        role=user.role,
        status=user.status,
        office=OfficeOut(
            id=str(office.id) if office else None,
            name=office.name if office else None,
            code=office.code if office else None,
            type=office.type if office else None,
            dm_root_id=str(office.dm_root_id) if office and office.dm_root_id else None,
        ),
        permissions=ROLE_PERMISSIONS.get(user.role, []),
        must_change_password=user.must_change_password,
    )


async def add_audit_event(
    session: AsyncSession,
    event_type: str,
    entity_type: str,
    actor_user_id: UUID | None = None,
    entity_id: UUID | None = None,
    metadata: dict | None = None,
) -> None:
    session.add(
        AuditEvent(
            actor_user_id=actor_user_id,
            event_type=event_type,
            entity_type=entity_type,
            entity_id=entity_id,
            event_metadata=metadata or {},
        )
    )


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(
        select(User).where(User.email == email.lower()).options(selectinload(User.office))
    )
    return result.scalar_one_or_none()


async def get_user_by_id(session: AsyncSession, user_id: str | UUID) -> User | None:
    result = await session.execute(
        select(User).where(User.id == UUID(str(user_id))).options(selectinload(User.office))
    )
    return result.scalar_one_or_none()


def validate_login_user(user: User | None) -> User:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    if user.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active.")
    if user.office and (not user.office.is_active or user.office.approval_status != "APPROVED"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Office is not approved or active.",
        )
    return user


async def issue_tokens(session: AsyncSession, user: User) -> tuple[str, str, int]:
    office = user.office
    access_token, expires_in = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "office_id": str(office.id) if office else "",
            "office_code": office.code if office else "",
            "dm_root_id": str(office.dm_root_id) if office and office.dm_root_id else "",
        }
    )
    refresh_token, _token_id, refresh_expires_at = create_refresh_token(str(user.id))
    session.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh_token),
            expires_at=refresh_expires_at,
        )
    )
    return access_token, refresh_token, expires_in


async def login(session: AsyncSession, email: str, password: str) -> tuple[str, str, int, User]:
    user = await get_user_by_email(session, email)
    if not user or not verify_password(password, user.password_hash):
        await add_audit_event(
            session,
            "AUTH_LOGIN_FAILED",
            "user",
            metadata={"email": email.lower()},
        )
        await session.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    user = validate_login_user(user)
    user.last_login_at = utcnow()
    access_token, refresh_token, expires_in = await issue_tokens(session, user)
    await add_audit_event(session, "AUTH_LOGIN_SUCCESS", "user", user.id, user.id)
    await session.commit()
    return access_token, refresh_token, expires_in, user


async def refresh(session: AsyncSession, refresh_token: str) -> tuple[str, str, int]:
    try:
        payload = decode_token(refresh_token)
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.") from exc

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")

    result = await session.execute(
        select(RefreshToken).where(RefreshToken.token_hash == hash_token(refresh_token))
    )
    token_row = result.scalar_one_or_none()
    if not token_row or token_row.revoked_at or token_row.expires_at <= utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")

    user = await get_user_by_id(session, token_row.user_id)
    user = validate_login_user(user)
    token_row.revoked_at = utcnow()
    access_token, next_refresh_token, expires_in = await issue_tokens(session, user)
    await add_audit_event(session, "AUTH_REFRESH", "user", user.id, user.id)
    await session.commit()
    return access_token, next_refresh_token, expires_in


async def logout(session: AsyncSession, refresh_token: str) -> None:
    result = await session.execute(
        select(RefreshToken).where(RefreshToken.token_hash == hash_token(refresh_token))
    )
    token_row = result.scalar_one_or_none()
    if token_row and not token_row.revoked_at:
        token_row.revoked_at = utcnow()
        await add_audit_event(session, "AUTH_LOGOUT", "user", token_row.user_id, token_row.user_id)
        await session.commit()


async def change_password(
    session: AsyncSession, user: User, current_password: str, new_password: str
) -> None:
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is wrong.")
    if len(new_password) < 10 or not any(ch.isalpha() for ch in new_password) or not any(
        ch.isdigit() for ch in new_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 10 characters and include a letter and number.",
        )
    user.password_hash = hash_password(new_password)
    user.must_change_password = False
    user.password_changed_at = utcnow()
    await add_audit_event(session, "USER_PASSWORD_CHANGED", "user", user.id, user.id)
    await session.commit()

