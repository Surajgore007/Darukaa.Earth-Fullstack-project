from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    project_type: str | None = Field(default=None, max_length=80)


class ProjectUpdate(ProjectCreate):
    pass


class ProjectRead(ProjectCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime


class SiteCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    site_type: str | None = Field(default=None, max_length=80)
    area_hectares: float | None = Field(default=None, ge=0)
    geometry: dict


class SiteRead(BaseModel):
    id: str
    project_id: str
    name: str
    description: str | None
    site_type: str | None
    area_hectares: float | None
    geometry: dict
    created_at: datetime
