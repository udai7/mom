# MoM Backend

FastAPI + PostgreSQL backend for authentication and account hierarchy.

## Local Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
```

Create the database configured by `DATABASE_URL`, then initialize and seed:

```bash
python -m app.scripts.init_db
python -m app.scripts.seed
fastapi dev app/main.py
```

Seeded users:

- `super@gov.in` / `superadmin2026`
- `dm@gov.in` / `dmadmin2026`
- `maya.nic@gov.in` / `nicadmin2026`

