# Alembic migrations

Run migrations from the `backend` directory after starting a PostgreSQL server
with PostGIS installed:

```powershell
..\.venv\Scripts\alembic.exe upgrade head
```

The application intentionally has no SQLite fallback. Site geometry requires
the PostgreSQL PostGIS extension.