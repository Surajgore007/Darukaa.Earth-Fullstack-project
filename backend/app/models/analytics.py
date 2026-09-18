from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import Date, DateTime, Float, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.site import Site


class AnalyticsRecord(Base):
    __tablename__ = "analytics_records"
    __table_args__ = (UniqueConstraint("site_id", "recorded_date", name="uq_site_recorded_date"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    site_id: Mapped[str] = mapped_column(ForeignKey("sites.id", ondelete="CASCADE"), index=True)
    recorded_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    carbon_tonnes: Mapped[float] = mapped_column(Float, nullable=False)
    biodiversity_index: Mapped[float] = mapped_column(Float, nullable=False)
    canopy_cover_pct: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    site: Mapped["Site"] = relationship(back_populates="analytics_records")
