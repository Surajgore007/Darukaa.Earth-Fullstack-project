from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.routes.projects import get_owned_site
from app.core.security import get_current_user
from app.models.analytics import AnalyticsRecord
from app.models.user import User
from app.schemas.analytics import AnalyticsCreate, AnalyticsRead

router = APIRouter(tags=["analytics"])


@router.get("/sites/{site_id}/analytics", response_model=list[AnalyticsRead])
def list_analytics(
    site_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_owned_site(site_id, current_user, db)
    return (
        db.query(AnalyticsRecord)
        .filter(AnalyticsRecord.site_id == site_id)
        .order_by(AnalyticsRecord.recorded_date.asc())
        .all()
    )


@router.post(
    "/sites/{site_id}/analytics", response_model=AnalyticsRead, status_code=status.HTTP_201_CREATED
)
def create_analytics(
    site_id: str,
    payload: AnalyticsCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_owned_site(site_id, current_user, db)
    existing = (
        db.query(AnalyticsRecord)
        .filter(
            AnalyticsRecord.site_id == site_id,
            AnalyticsRecord.recorded_date == payload.recorded_date,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Analytics date already exists"
        )

    record = AnalyticsRecord(site_id=site_id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
