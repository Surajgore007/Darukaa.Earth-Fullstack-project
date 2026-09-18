from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class AnalyticsCreate(BaseModel):
    recorded_date: date
    carbon_tonnes: float = Field(ge=0)
    biodiversity_index: float = Field(ge=0, le=100)
    canopy_cover_pct: float = Field(ge=0, le=100)


class AnalyticsRead(AnalyticsCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    site_id: str
    created_at: datetime
