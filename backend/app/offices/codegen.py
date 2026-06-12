import re
from sqlalchemy import select, func
from app.models import Office

def normalize_slug(slug: str) -> str:
    # Convert to lowercase, allow only a-z, 0-9, and hyphen. Collapse repeated hyphens.
    normalized = slug.lower()
    normalized = re.sub(r'[^a-z0-9\-]', '', normalized)
    normalized = re.sub(r'\-+', '-', normalized)
    return normalized.strip('-')

async def generate_office_code(session, parent_id, office_slug_input: str) -> tuple[str, str, int]:
    code_slug = normalize_slug(office_slug_input)
    
    # Query current max sequence under this parent and this code_slug
    if parent_id is None:
        # DM roots
        stmt = select(func.max(Office.code_sequence)).where(
            Office.parent_id.is_(None),
            Office.code_slug == code_slug
        )
        result = await session.execute(stmt)
        max_seq = result.scalar() or 0
        sequence = max_seq + 1
        code = f"{code_slug}-{sequence:03d}"
    else:
        # Get parent code
        parent_stmt = select(Office.code).where(Office.id == parent_id)
        parent_result = await session.execute(parent_stmt)
        parent_code = parent_result.scalar()
        if not parent_code:
            raise ValueError("Parent office not found")
            
        stmt = select(func.max(Office.code_sequence)).where(
            Office.parent_id == parent_id,
            Office.code_slug == code_slug
        )
        result = await session.execute(stmt)
        max_seq = result.scalar() or 0
        sequence = max_seq + 1
        code = f"{parent_code}-{code_slug}-{sequence:03d}"
        
    return code, code_slug, sequence
