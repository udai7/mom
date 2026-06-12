import asyncio
from sqlalchemy import text
from app.core.database import engine

async def main() -> None:
    queries = [
        "CREATE INDEX IF NOT EXISTS ix_offices_parent_id ON offices(parent_id);",
        "CREATE INDEX IF NOT EXISTS ix_offices_dm_root_id ON offices(dm_root_id);",
        "CREATE INDEX IF NOT EXISTS ix_offices_approval_status ON offices(approval_status);",
        "CREATE INDEX IF NOT EXISTS ix_offices_is_active ON offices(is_active);",
        "CREATE INDEX IF NOT EXISTS ix_users_office_id ON users(office_id);",
        "CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);",
        "CREATE INDEX IF NOT EXISTS ix_users_status ON users(status);",
        "CREATE INDEX IF NOT EXISTS ix_office_ancestors_descendant_office_id ON office_ancestors(descendant_office_id);",
        "CREATE INDEX IF NOT EXISTS ix_account_registration_requests_office_id ON account_registration_requests(office_id);",
        "CREATE INDEX IF NOT EXISTS ix_account_registration_requests_primary_user_id ON account_registration_requests(primary_user_id);",
        "CREATE INDEX IF NOT EXISTS ix_account_registration_requests_parent_office_id ON account_registration_requests(parent_office_id);",
        "CREATE INDEX IF NOT EXISTS ix_account_registration_requests_status ON account_registration_requests(status);",
        "CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user_id ON refresh_tokens(user_id);",
        "CREATE INDEX IF NOT EXISTS ix_audit_events_actor_user_id ON audit_events(actor_user_id);",
        "CREATE INDEX IF NOT EXISTS ix_audit_events_entity_id ON audit_events(entity_id);",
        "CREATE INDEX IF NOT EXISTS ix_audit_events_event_type ON audit_events(event_type);"
    ]
    
    print("Applying indexes to database...")
    async with engine.begin() as conn:
        for q in queries:
            print(f"Executing: {q}")
            await conn.execute(text(q))
    print("All indexes applied successfully!")

if __name__ == "__main__":
    asyncio.run(main())
