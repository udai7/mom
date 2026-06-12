from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_user
from app.core.database import get_session
from app.core.security import hash_password, utcnow
from app.core.audit import log_audit_event
from app.models import User, Office, AccountRegistrationRequest, OfficeAncestor
from app.offices.codegen import generate_office_code, normalize_slug
from app.registrations.schemas import (
    DMRegisterRequest,
    OfficeRegisterRequest,
    ApproveRequest,
    RejectRequest,
    RegistrationRequestOut,
    OfficeSchemaOut
)

router = APIRouter()

# Helper to check if ancestor
async def is_ancestor_office(session: AsyncSession, ancestor_id: UUID, descendant_id: UUID) -> bool:
    stmt = select(OfficeAncestor).where(
        and_(
            OfficeAncestor.ancestor_office_id == ancestor_id,
            OfficeAncestor.descendant_office_id == descendant_id
        )
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none() is not None

# Helper to add office ancestors
async def build_ancestors(session: AsyncSession, office_id: UUID, parent_id: UUID | None) -> None:
    # Always self
    session.add(OfficeAncestor(ancestor_office_id=office_id, descendant_office_id=office_id, depth=0))
    
    if parent_id:
        stmt = select(OfficeAncestor).where(OfficeAncestor.descendant_office_id == parent_id)
        result = await session.execute(stmt)
        parent_ancestors = result.scalars().all()
        for pa in parent_ancestors:
            session.add(
                OfficeAncestor(
                    ancestor_office_id=pa.ancestor_office_id,
                    descendant_office_id=office_id,
                    depth=pa.depth + 1
                )
            )
    await session.flush()

@router.post("/dm", response_model=OfficeSchemaOut)
async def register_dm(
    payload: DMRegisterRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> Office:
    if current_user.role != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only central Super Admin can register a DM Office."
        )

    # Generate DM code
    code, code_slug, seq = await generate_office_code(session, parent_id=None, office_slug_input="dm")

    # Create DM office
    office = Office(
        name=payload.name,
        code=code,
        code_slug=code_slug,
        code_sequence=seq,
        type="DM",
        department="District Administration",
        official_email=payload.official_email,
        official_phone=payload.official_phone,
        address_line_1=payload.address_line_1,
        address_line_2=payload.address_line_2,
        city=payload.city,
        district=payload.district,
        state=payload.state,
        pincode=payload.pincode,
        website=payload.website,
        approval_status="APPROVED",
        is_active=True
    )
    session.add(office)
    await session.flush()

    # Now we have office.id
    office.dm_root_id = office.id

    # Create DM admin user
    user = User(
        office_id=office.id,
        full_name=payload.admin_name,
        designation=payload.admin_designation,
        email=payload.admin_email.lower(),
        mobile_number=payload.admin_mobile,
        employee_id=payload.employee_id,
        password_hash=hash_password(payload.admin_password),
        role="DM_ADMIN",
        status="ACTIVE"
    )
    session.add(user)
    await session.flush()

    # Add ancestors
    await build_ancestors(session, office.id, parent_id=None)

    # Log audit events
    await log_audit_event(session, current_user.id, "OFFICE_CREATED", "office", office.id, {"code": code})
    await log_audit_event(session, current_user.id, "USER_CREATED", "user", user.id, {"email": user.email})

    await session.commit()
    return office

@router.post("/offices", response_model=RegistrationRequestOut)
async def register_office(
    payload: OfficeRegisterRequest,
    session: AsyncSession = Depends(get_session)
) -> AccountRegistrationRequest:
    # Validate parent
    parent_stmt = select(Office).where(Office.id == payload.parent_id)
    parent_result = await session.execute(parent_stmt)
    parent = parent_result.scalar_one_or_none()
    
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent office not found."
        )
    if not parent.is_active or parent.approval_status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parent office is not active or approved."
        )

    # Check email duplicate
    email_check_stmt = select(User).where(User.email == payload.admin_email.lower())
    email_check_result = await session.execute(email_check_stmt)
    if email_check_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account holder email is already registered."
        )

    # Generate hierarchical code
    slug_input = payload.office_slug
    if not slug_input:
        slug_input = normalize_slug(payload.name)
        if not slug_input:
            slug_input = "office"
    code, code_slug, seq = await generate_office_code(session, parent_id=parent.id, office_slug_input=slug_input)

    # Create Office (pending)
    office = Office(
        parent_id=parent.id,
        dm_root_id=parent.dm_root_id,
        name=payload.name,
        code=code,
        code_slug=code_slug,
        code_sequence=seq,
        type=payload.type or "OTHER",
        department=payload.department,
        official_email=payload.official_email,
        official_phone=payload.official_phone,
        address_line_1=payload.address_line_1,
        address_line_2=payload.address_line_2,
        city=payload.city,
        district=payload.district,
        state=payload.state,
        pincode=payload.pincode,
        website=payload.website,
        approval_status="PENDING_PARENT_APPROVAL",
        is_active=False
    )
    session.add(office)
    await session.flush()

    # Create Primary User (inactive)
    user = User(
        office_id=office.id,
        full_name=payload.admin_name,
        designation=payload.admin_designation,
        email=payload.admin_email.lower(),
        mobile_number=payload.admin_mobile,
        employee_id=payload.employee_id,
        password_hash=hash_password(payload.admin_password),
        role="OFFICE_ADMIN",
        status="INACTIVE"
    )
    session.add(user)
    await session.flush()

    # Create registration request
    req = AccountRegistrationRequest(
        office_id=office.id,
        primary_user_id=user.id,
        parent_office_id=parent.id,
        requested_role="OFFICE_ADMIN",
        status="PENDING",
        submitted_payload=payload.dict()
    )
    session.add(req)
    await session.flush()

    await log_audit_event(session, actor_user_id=None, event_type="REGISTRATION_SUBMITTED", entity_type="registration", entity_id=req.id, metadata={"code": code})
    await session.commit()

    # Reload relationship to return full response
    stmt = select(AccountRegistrationRequest).where(AccountRegistrationRequest.id == req.id).options(
        selectinload(AccountRegistrationRequest.office),
        selectinload(AccountRegistrationRequest.primary_user)
    )
    res = await session.execute(stmt)
    return res.scalar_one()

@router.get("/pending", response_model=list[RegistrationRequestOut])
async def get_pending_registrations(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> list[AccountRegistrationRequest]:
    if current_user.role == "SUPER_ADMIN":
        stmt = select(AccountRegistrationRequest).where(
            AccountRegistrationRequest.status == "PENDING"
        ).options(
            selectinload(AccountRegistrationRequest.office),
            selectinload(AccountRegistrationRequest.primary_user)
        )
    elif current_user.role in ["DM_ADMIN", "OFFICE_ADMIN"]:
        # Find all descendant offices of current user's office
        descendants_stmt = select(OfficeAncestor.descendant_office_id).where(
            OfficeAncestor.ancestor_office_id == current_user.office_id
        )
        descendant_ids = (await session.execute(descendants_stmt)).scalars().all()
        
        stmt = select(AccountRegistrationRequest).where(
            and_(
                AccountRegistrationRequest.status == "PENDING",
                AccountRegistrationRequest.parent_office_id.in_(descendant_ids)
            )
        ).options(
            selectinload(AccountRegistrationRequest.office),
            selectinload(AccountRegistrationRequest.primary_user)
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view pending registration requests."
        )

    result = await session.execute(stmt)
    return result.scalars().all()

@router.post("/{id}/approve", response_model=RegistrationRequestOut)
async def approve_registration(
    id: UUID,
    payload: ApproveRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> AccountRegistrationRequest:
    stmt = select(AccountRegistrationRequest).where(
        AccountRegistrationRequest.id == id
    ).options(
        selectinload(AccountRegistrationRequest.office),
        selectinload(AccountRegistrationRequest.primary_user)
    )
    result = await session.execute(stmt)
    req = result.scalar_one_or_none()
    
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration request not found."
        )
    if req.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration request is already processed."
        )

    # Check permission
    has_permission = False
    if current_user.role == "SUPER_ADMIN":
        has_permission = True
    elif current_user.role == "DM_ADMIN" or current_user.role == "OFFICE_ADMIN":
        # Must be parent or ancestor
        if req.parent_office_id == current_user.office_id or await is_ancestor_office(session, current_user.office_id, req.parent_office_id):
            has_permission = True

    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to approve this registration."
        )

    # Process Approval
    req.status = "APPROVED"
    req.reviewed_by_user_id = current_user.id
    req.reviewed_at = utcnow()
    req.review_note = payload.review_note

    req.office.approval_status = "APPROVED"
    req.office.is_active = True
    req.primary_user.status = "ACTIVE"

    # Add ancestors
    await build_ancestors(session, req.office.id, req.parent_office_id)

    await log_audit_event(session, current_user.id, "REGISTRATION_APPROVED", "registration", req.id)
    await log_audit_event(session, current_user.id, "OFFICE_ACTIVATED", "office", req.office.id)
    await log_audit_event(session, current_user.id, "USER_REACTIVATED", "user", req.primary_user.id)

    await session.commit()
    return req

@router.post("/{id}/reject", response_model=RegistrationRequestOut)
async def reject_registration(
    id: UUID,
    payload: RejectRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> AccountRegistrationRequest:
    stmt = select(AccountRegistrationRequest).where(
        AccountRegistrationRequest.id == id
    ).options(
        selectinload(AccountRegistrationRequest.office),
        selectinload(AccountRegistrationRequest.primary_user)
    )
    result = await session.execute(stmt)
    req = result.scalar_one_or_none()
    
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration request not found."
        )
    if req.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration request is already processed."
        )

    # Check permission
    has_permission = False
    if current_user.role == "SUPER_ADMIN":
        has_permission = True
    elif current_user.role == "DM_ADMIN" or current_user.role == "OFFICE_ADMIN":
        if req.parent_office_id == current_user.office_id or await is_ancestor_office(session, current_user.office_id, req.parent_office_id):
            has_permission = True

    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to reject this registration."
        )

    # Process Rejection
    req.status = "REJECTED"
    req.reviewed_by_user_id = current_user.id
    req.reviewed_at = utcnow()
    req.review_note = payload.rejection_reason

    req.office.approval_status = "REJECTED"

    await log_audit_event(session, current_user.id, "REGISTRATION_REJECTED", "registration", req.id, {"reason": payload.rejection_reason})
    await session.commit()
    return req


@router.get("/offices/all", response_model=list[OfficeSchemaOut])
async def get_all_offices(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> list[Office]:
    if current_user.role == "SUPER_ADMIN":
        stmt = select(Office)
    else:
        descendants_stmt = select(OfficeAncestor.descendant_office_id).where(
            OfficeAncestor.ancestor_office_id == current_user.office_id
        )
        descendant_ids = (await session.execute(descendants_stmt)).scalars().all()
        stmt = select(Office).where(Office.id.in_(descendant_ids))
        
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.get("/public/parent-offices", response_model=list[OfficeSchemaOut])
async def get_public_parent_offices(
    session: AsyncSession = Depends(get_session)
) -> list[Office]:
    stmt = select(Office).where(Office.approval_status == "APPROVED")
    result = await session.execute(stmt)
    return list(result.scalars().all())


