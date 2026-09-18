# Darukaa.Earth — Full-Stack Geospatial Data Analytics Platform

[![CI/CD Pipeline](https://github.com/Surajgore007/Darukaa.Earth-Fullstack-project/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Surajgore007/Darukaa.Earth-Fullstack-project/actions)
![React 18](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?logo=postgresql&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-GL%20JS-000000?logo=mapbox&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?logo=chartdotjs&logoColor=white)

A production-grade, full-stack geospatial data analytics platform built for the **Darukaa.Earth Full-Stack Developer Hackathon**. The platform serves as an interactive management dashboard for ecological restoration, carbon offset verification, and biodiversity conservation sites worldwide.

---

## 1. Project & Submission Overview

- **Live Web Application (Frontend)**: [https://darukaa-earth-fullstack-project.vercel.app](https://darukaa-earth-fullstack-project.vercel.app)
- **Live REST API (Backend)**: [https://darukaa-earth-api-amber.vercel.app](https://darukaa-earth-api-amber.vercel.app)
- **Interactive API Documentation (Swagger)**: [https://darukaa-earth-api-amber.vercel.app/docs](https://darukaa-earth-api-amber.vercel.app/docs)
- **API Health Check**: [https://darukaa-earth-api-amber.vercel.app/health](https://darukaa-earth-api-amber.vercel.app/health)
- **GitHub Repository**: [https://github.com/Surajgore007/Darukaa.Earth-Fullstack-project](https://github.com/Surajgore007/Darukaa.Earth-Fullstack-project)
- **Candidate Name**: Suraj Gore
- **Repository Access**: Public repository (directly accessible without invitations); evaluator permissions also configured for:
  - `ankita.dasgupta@darukaa.com`
  - `harsh.kumar@darukaa.com`
  - `utkarsh.gauniyal@darukaa.com`
  - `guneet.mutreja@darukaa.com`
- **Pre-Seeded Demo Account**:
  - **Email**: `demo@darukaa.earth`
  - **Password**: `DarukaaDemo123!`
  - **Pre-loaded Data**: "Western Ghats Restoration" project featuring the "Kudremukh Ridge" site with 12 months of synthetic carbon, biodiversity, and canopy cover time-series analytics.

---

## 2. Core User Stories & Key Features

| User Story | Implementation |
| :--- | :--- |
| **User Authentication** | JWT-based authentication with bcrypt password hashing, token expiration, and protected routes via Axios interceptors and Zustand state management. |
| **Project Management** | Interactive admin dashboard to create, view, update, and manage restoration project workspaces. |
| **Geospatial Site Creation** | Add ecological monitoring sites by interactively drawing vector polygons on a map using **Mapbox GL Draw** and persisting `POLYGON` geometries in **PostGIS (SRID 4326)**. |
| **Data Visualization** | Deep-dive site analytics displaying multi-metric time-series curves (Carbon Tonnes, Biodiversity Index, Canopy Cover %) rendered dynamically with **Chart.js**. |
| **Automated Code Quality** | **Husky** and **lint-staged** pre-commit hooks enforcing **ESLint** & **Prettier** formatting for frontend code, paired with **Ruff**, **Black**, and **Pytest** for backend Python validation. |

---

## 3. System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend (React 18 + Vite + TypeScript)"]
        UI[Dashboard & Project Views]
        Map[Mapbox GL JS + Mapbox Draw]
        Charts[Chart.js / react-chartjs-2]
        AuthStore[Zustand Auth Store]
        ApiClient[Axios REST Client + JWT Interceptor]
    end

    subgraph Server["Backend API (Python FastAPI)"]
        Router[FastAPI Route Handlers (/api/v1)]
        Security[JWT Auth & Password Hashing]
        ORM[SQLAlchemy 2.0 + GeoAlchemy2]
        GeoService[Geometry Parsing & Validation]
    end

    subgraph Database["Database (Supabase PostgreSQL + PostGIS)"]
        UsersTable[(users)]
        ProjectsTable[(projects)]
        SitesTable[(sites - PostGIS POLYGON SRID 4326)]
        AnalyticsTable[(analytics_records - Time Series)]
    end

    UI --> ApiClient
    Map --> ApiClient
    ApiClient -->|HTTP / JSON + Bearer JWT| Router
    Router --> Security
    Router --> GeoService
    Router --> ORM
    ORM --> UsersTable
    ORM --> ProjectsTable
    ORM --> SitesTable
    ORM --> AnalyticsTable
```

---

## 4. Database Schema Breakdown (PostgreSQL + PostGIS)

The relational schema is managed via **Alembic** migrations and powered by **PostGIS**:

### `users`
- `id` (UUID, Primary Key)
- `email` (String, Unique, Indexed)
- `full_name` (String)
- `hashed_password` (String)
- `created_at`, `updated_at` (Timestamptz)

### `projects`
- `id` (UUID, Primary Key)
- `name` (String, Required)
- `description` (Text, Optional)
- `project_type` (String: "Reforestation", "Wetland", "Agroforestry", etc.)
- `owner_id` (UUID, Foreign Key → `users.id`)
- `created_at`, `updated_at` (Timestamptz)

### `sites`
- `id` (UUID, Primary Key)
- `project_id` (UUID, Foreign Key → `projects.id`)
- `name` (String, Required)
- `description` (Text, Optional)
- `site_type` (String)
- `area_hectares` (Float)
- `geom` (**`Geometry(geometry_type='POLYGON', srid=4326)`**) — Native PostGIS spatial geometry for polygon boundaries.
- `created_at`, `updated_at` (Timestamptz)

### `analytics_records`
- `id` (UUID, Primary Key)
- `site_id` (UUID, Foreign Key → `sites.id`)
- `recorded_date` (Date, Required)
- `carbon_tonnes` (Float — Metric tons of carbon sequestered)
- `biodiversity_index` (Float — Standardized ecological score 0–100)
- `canopy_cover_pct` (Float — Forest canopy density percentage 0–100%)
- `created_at` (Timestamptz)

---

## 5. Local Setup & Running Instructions

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL database with PostGIS enabled (or free Supabase project)
- Mapbox Public Access Token (free at [mapbox.com](https://mapbox.com))

### 1. Backend Setup
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# Run database migrations
alembic upgrade head

# (Optional) Seed realistic demonstration data
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000`. Interactive Swagger documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup
```powershell
cd ../frontend
npm install

# Configure environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000/api/v1
# Set VITE_MAPBOX_TOKEN=your_mapbox_public_token

# Run Vite dev server
npm run dev
```
Frontend web application will be live at `http://localhost:5173`.

---

## 6. Code Quality & CI/CD Pipeline

### Automated Pre-Commit Enforcement
Pre-commit hooks are installed using **Husky** and **lint-staged**:
- **Frontend**: Automatically runs `eslint --fix` and `prettier --write` on staged `.ts` and `.tsx` files.
- **Backend**: Pre-commit runs `ruff check` and `black --check` on Python modules.

### GitHub Actions Pipeline (`.github/workflows/ci-cd.yml`)
1. **Backend Job**:
   - Boots a live containerized PostgreSQL + PostGIS instance (`postgis/postgis:16-3.4`).
   - Runs Alembic migrations (`alembic upgrade head`).
   - Executes code linters (`ruff check`, `black --check`).
   - Runs test suite via `pytest`.
2. **Frontend Job**:
   - Installs dependencies via `npm ci`.
   - Executes ESLint (`npm run lint`).
   - Runs TypeScript strict typecheck (`npm run typecheck`).
   - Compiles production bundle (`npm run build`).
3. **Deployment Job**: Automatically deploys the application on pushes to `main`.

---

## 7. Deployment Instructions

### Option 1: Unified Vercel Deployment (Zero Configuration)
1. Import repository on [Vercel](https://vercel.com).
2. Configure Environment Variables:
   - `DATABASE_URL`: Supabase PostgreSQL connection string
   - `SECRET_KEY`: Random 32+ character string
   - `VITE_MAPBOX_TOKEN`: Mapbox public access token
   - `VITE_API_URL`: `/api/v1`
3. Click **Deploy**. Both the Vite frontend and the FastAPI serverless functions will be hosted under a single HTTPS domain with zero CORS complications.

### Option 2: Separate Frontend (Vercel) + Backend (Render)
- Deploy `backend` to Render using `render.yaml`.
- Deploy `frontend` to Vercel pointing `VITE_API_URL` to `https://darukaa-earth-api.onrender.com/api/v1`.

---

## 8. Technical Decisions & Trade-Offs

1. **PostGIS vs. Client-Side GeoJSON**: Rather than treating geometries as opaque JSON blobs, spatial polygons are stored as native PostGIS geometries (`SRID 4326`). This enables spatial indexing, bounding box queries, and area calculations directly on the database level.
2. **FastAPI vs. Django**: FastAPI was chosen for its high-performance asynchronous request handling, automatic OpenAPI documentation generation, and lightweight Pydantic schema validation.
3. **Chart.js vs. D3.js**: Chart.js was selected for crisp, responsive canvas rendering with built-in accessibility and tooltips, without the boilerplate complexity of D3.js.
4. **Synthetic Data Disclosure**: As per the challenge guidelines, the 12-month analytics records are realistic demonstration data to allow reviewers to immediately evaluate time-series trends.
