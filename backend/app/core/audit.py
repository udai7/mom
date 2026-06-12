from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import AuditEvent

async def log_audit_event(
    session: AsyncSession,
    actor_user_id: UUID | None,
    event_type: str,
    entity_type: str,
    entity_id: UUID | None = None,
    metadata: dict | None = None,
    ip_address: str | None = None,
) -> None:
    event = AuditEvent(
        actor_user_id=actor_user_id,
        event_type=event_type,
        entity_type=entity_type,
        entity_id=entity_id,
        event_metadata=metadata or {},
        ip_address=ip_address,
    )
    session.add(event)
    await session.flush()
