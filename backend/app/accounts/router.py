from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_user
from app.auth.schemas import UserOut
from app.auth.service import user_to_out
from app.core.database import get_session
from app.core.security import hash_password, utcnow
from app.core.audit import log_audit_event
from app.models import User, Office, OfficeAncestor

router = APIRouter()

class ResetPasswordRequest(BaseModel):
    new_password: str

async def check_management_permission(session: AsyncSession, current_user: User, target_user: User) -> None:
    if current_user.role == "SUPER_ADMIN":
        if target_user.role == "SUPER_ADMIN" and current_user.id != target_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super Admin cannot modify another Super Admin."
            )
        return

    if not current_user.office_id or not target_user.office_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage this account."
        )

    # Check if target_user.office is a descendant of current_user.office
    stmt = select(OfficeAncestor).where(
        and_(
            OfficeAncestor.ancestor_office_id == current_user.office_id,
            OfficeAncestor.descendant_office_id == target_user.office_id
        )
    )
    result = await session.execute(stmt)
    is_desc = result.scalar_one_or_none() is not None
    if not is_desc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage this account."
        )

@router.get("", response_model=list[UserOut])
async def get_accounts(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> list[UserOut]:
    if current_user.role == "SUPER_ADMIN":
        stmt = select(User).options(selectinload(User.office))
    else:
        # Get descendants including self
        descendants_stmt = select(OfficeAncestor.descendant_office_id).where(
            OfficeAncestor.ancestor_office_id == current_user.office_id
        )
        descendant_ids = (await session.execute(descendants_stmt)).scalars().all()
        stmt = select(User).where(User.office_id.in_(descendant_ids)).options(selectinload(User.office))

    result = await session.execute(stmt)
    users = result.scalars().all()
    return [user_to_out(u) for u in users]

@router.post("/{user_id}/block", response_model=UserOut)
async def block_account(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> UserOut:
    stmt = select(User).where(User.id == user_id).options(selectinload(User.office))
    target_user = (await session.execute(stmt)).scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    await check_management_permission(session, current_user, target_user)

    target_user.status = "BLOCKED"
    await log_audit_event(session, current_user.id, "USER_BLOCKED", "user", target_user.id)
    await session.commit()
    return user_to_out(target_user)

@router.post("/{user_id}/deactivate", response_model=UserOut)
async def deactivate_account(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> UserOut:
    stmt = select(User).where(User.id == user_id).options(selectinload(User.office))
    target_user = (await session.execute(stmt)).scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    await check_management_permission(session, current_user, target_user)

    target_user.status = "INACTIVE"
    await log_audit_event(session, current_user.id, "USER_DEACTIVATED", "user", target_user.id)
    await session.commit()
    return user_to_out(target_user)

@router.post("/{user_id}/reactivate", response_model=UserOut)
async def reactivate_account(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> UserOut:
    stmt = select(User).where(User.id == user_id).options(selectinload(User.office))
    target_user = (await session.execute(stmt)).scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    await check_management_permission(session, current_user, target_user)

    # If belongs to an office, make sure office is active
    if target_user.office_id:
        office_stmt = select(Office).where(Office.id == target_user.office_id)
        office = (await session.execute(office_stmt)).scalar_one_or_none()
        if not office or not office.is_active or office.approval_status != "APPROVED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot activate user when their office is inactive or unapproved."
            )

    target_user.status = "ACTIVE"
    await log_audit_event(session, current_user.id, "USER_REACTIVATED", "user", target_user.id)
    await session.commit()
    return user_to_out(target_user)

@router.post("/{user_id}/reset-password", response_model=UserOut)
async def reset_password(
    user_id: UUID,
    payload: ResetPasswordRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> UserOut:
    stmt = select(User).where(User.id == user_id).options(selectinload(User.office))
    target_user = (await session.execute(stmt)).scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    await check_management_permission(session, current_user, target_user)

    new_password = payload.new_password
    if len(new_password) < 10 or not any(ch.isalpha() for ch in new_password) or not any(
        ch.isdigit() for ch in new_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 10 characters and include a letter and number."
        )

    target_user.password_hash = hash_password(new_password)
    target_user.must_change_password = True
    target_user.password_changed_at = utcnow()
    await log_audit_event(session, current_user.id, "USER_PASSWORD_RESET_BY_ADMIN", "user", target_user.id)
    await session.commit()
    return user_to_out(target_user)
