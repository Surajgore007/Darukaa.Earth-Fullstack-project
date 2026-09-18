from datetime import date
from random import Random
from uuid import uuid4

from geoalchemy2 import WKTElement

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.analytics import AnalyticsRecord
from app.models.project import Project
from app.models.site import Site
from app.models.user import User


def seed_demo_data() -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "demo@darukaa.earth").first()
        if user is None:
            user = User(
                email="demo@darukaa.earth",
                full_name="Darukaa Demo",
                hashed_password=get_password_hash("DarukaaDemo123!"),
            )
            db.add(user)
            db.flush()

        project = db.query(Project).filter(Project.owner_id == user.id).first()
        if project is None:
            project = Project(
                name="Western Ghats Restoration",
                description="Synthetic demonstration project for forest restoration monitoring.",
                project_type="Reforestation",
                owner_id=user.id,
            )
            db.add(project)
            db.flush()

        if not project.sites:
            site = Site(
                project_id=project.id,
                name="Kudremukh Ridge",
                description="Synthetic demonstration monitoring site.",
                site_type="Forest restoration",
                area_hectares=42.5,
                geom=WKTElement("POLYGON((74.85 13.25, 74.89 13.25, 74.89 13.29, 74.85 13.29, 74.85 13.25))", srid=4326),
            )
            db.add(site)
            db.flush()
        else:
            site = project.sites[0]

        if not db.query(AnalyticsRecord).filter(AnalyticsRecord.site_id == site.id).count():
            random = Random(site.id)
            for month_offset in range(11, -1, -1):
                month = 12 - month_offset
                record_date = date(2025 + (month - 1) // 12, ((month - 1) % 12) + 1, 15)
                db.add(
                    AnalyticsRecord(
                        id=str(uuid4()),
                        site_id=site.id,
                        recorded_date=record_date,
                        carbon_tonnes=round(180 + (11 - month_offset) * 4.2 + random.uniform(-2, 2), 2),
                        biodiversity_index=round(58 + (11 - month_offset) * 0.8 + random.uniform(-1, 1), 2),
                        canopy_cover_pct=round(46 + (11 - month_offset) * 0.7 + random.uniform(-0.4, 0.4), 2),
                    )
                )
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()