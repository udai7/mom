# Minutes of Meeting (MoM) Platform

This repository contains the **Minutes of Meeting (MoM)** platform, a hierarchical meeting management system designed for district-level government offices.

For the detailed Product Requirements Document & System Design, please refer to [docs/readme.md](file:///home/archilect/Projects/mom/docs/readme.md).

---

## 🚀 Quick Start Guide

Follow these steps to set up and run both the frontend and backend applications locally.

---

### 1. Backend Setup & Run

The backend is built with **FastAPI**, **SQLAlchemy**, and **PostgreSQL**.

#### Prerequisites
* Python 3.12+ installed.
* Access to a PostgreSQL database (local or cloud-hosted like Neon).

#### Step-by-Step Instructions

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install the dependencies in editable development mode:**
   ```bash
   pip install -e ".[dev]"
   ```

4. **Configure Environment Variables:**
   Copy the example environment file to `.env`:
   ```bash
   cp .env.example .env
   ```
   > [!IMPORTANT]
   > Make sure the `DATABASE_URL` in `.env` uses the `postgresql+asyncpg://` protocol scheme (instead of `postgresql://`) to ensure SQLAlchemy uses `asyncpg` for async operation.
   > 
   > Example:
   > ```env
   > DATABASE_URL=postgresql+asyncpg://user:pass@host/dbname?ssl=require
   > ```

5. **Initialize Database Schema:**
   Create the database tables:
   ```bash
   ./.venv/bin/python -m app.scripts.init_db
   ```

6. **Seed Default Data:**
   Populate the database with default offices and user accounts:
   ```bash
   ./.venv/bin/python -m app.scripts.seed
   ```

7. **Start the Backend Server:**
   ```bash
   ./.venv/bin/fastapi dev app/main.py
   ```
   The backend API will run at `http://127.0.0.1:8000`. Documentation is available at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup & Run

The frontend is a single-page application built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

#### Prerequisites
* Node.js (v18+) and npm installed.

#### Step-by-Step Instructions

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The frontend application will be hosted at `http://localhost:5173/`.

---

### 🔑 Seed Credentials

Once the database is seeded, you can log in using any of the following accounts:

| Persona | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `super@gov.in` | `superadmin2026` | SUPER_ADMIN |
| **DM Office** | `dm@gov.in` | `dmadmin2026` | DM_ADMIN |
| **Maya (NIC)** | `maya.nic@gov.in` | `nicadmin2026` | OFFICE_ADMIN |
