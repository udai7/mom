import asyncio

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models import Office, User


async def upsert_office(session, **values) -> Office:
    result = await session.execute(select(Office).where(Office.code == values["code"]))
    office = result.scalar_one_or_none()
    if office:
        return office
    office = Office(**values)
    session.add(office)
    await session.flush()
    return office


async def upsert_user(session, **values) -> User:
    result = await session.execute(select(User).where(User.email == values["email"]))
    user = result.scalar_one_or_none()
    if user:
        return user
    user = User(**values)
    session.add(user)
    await session.flush()
    return user


async def main() -> None:
    async with AsyncSessionLocal() as session:
        dm = await upsert_office(
            session,
            name="DM Office",
            code="dm-001",
            code_slug="dm",
            code_sequence=1,
            type="DM",
            department="District Administration",
            official_email="dm@gov.in",
            official_phone="0000000000",
            address_line_1="DM Office",
            district="Tripura",
            state="Tripura",
            approval_status="APPROVED",
            is_active=True,
        )
        dm.dm_root_id = dm.id

        nic = await upsert_office(
            session,
            parent_id=dm.id,
            dm_root_id=dm.id,
            name="NIC Tripura",
            code="dm-nic-001",
            code_slug="nic",
            code_sequence=1,
            type="NIC",
            department="Information Technology",
            official_email="nic@gov.in",
            official_phone="0000000001",
            address_line_1="NIC Office",
            district="Tripura",
            state="Tripura",
            approval_status="APPROVED",
            is_active=True,
        )

        await upsert_user(
            session,
            full_name="Central Super Admin",
            designation="Platform Administrator",
            email="super@gov.in",
            mobile_number="9999999999",
            password_hash=hash_password("superadmin2026"),
            role="SUPER_ADMIN",
            status="ACTIVE",
        )
        await upsert_user(
            session,
            office_id=dm.id,
            full_name="DM Administrator",
            designation="District Magistrate",
            email="dm@gov.in",
            mobile_number="9999999998",
            password_hash=hash_password("dmadmin2026"),
            role="DM_ADMIN",
            status="ACTIVE",
        )
        await upsert_user(
            session,
            office_id=nic.id,
            full_name="Maya Debbarma",
            designation="District Informatics Officer",
            email="maya.nic@gov.in",
            mobile_number="9999999997",
            password_hash=hash_password("nicadmin2026"),
            role="OFFICE_ADMIN",
            status="ACTIVE",
        )

        await session.commit()


if __name__ == "__main__":
    asyncio.run(main())

