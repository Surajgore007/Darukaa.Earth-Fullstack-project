from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import get_current_user
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate, SiteCreate, SiteRead
from app.services.geometry import polygon_geojson_to_wkt

router = APIRouter(tags=["projects", "sites"])


def get_owned_project(project_id: str, user: User, db: Session) -> Project:
    project = (
        db.query(Project).filter(Project.id == project_id, Project.owner_id == user.id).first()
    )
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def get_owned_site(site_id: str, user: User, db: Session) -> Site:
    site = (
        db.query(Site)
        .join(Project, Site.project_id == Project.id)
        .filter(Site.id == site_id, Project.owner_id == user.id)
        .first()
    )
    if site is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    return site


@router.get("/projects", response_model=list[ProjectRead])
def list_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Project)
        .filter(Project.owner_id == current_user.id)
        .order_by(Project.created_at.desc())
        .all()
    )


@router.post("/projects", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = Project(**payload.model_dump(), owner_id=current_user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/projects/{project_id}", response_model=ProjectRead)
def read_project(
    project_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return get_owned_project(project_id, current_user, db)


@router.put("/projects/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = get_owned_project(project_id, current_user, db)
    for field, value in payload.model_dump().items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    project = get_owned_project(project_id, current_user, db)
    db.delete(project)
    db.commit()


@router.get("/projects/{project_id}/sites", response_model=list[SiteRead])
def list_sites(
    project_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    get_owned_project(project_id, current_user, db)
    sites = (
        db.query(Site).filter(Site.project_id == project_id).order_by(Site.created_at.desc()).all()
    )
    return [_site_response(site, db) for site in sites]


@router.post(
    "/projects/{project_id}/sites", response_model=SiteRead, status_code=status.HTTP_201_CREATED
)
def create_site(
    project_id: str,
    payload: SiteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_owned_project(project_id, current_user, db)
    site = Site(
        project_id=project_id,
        name=payload.name,
        description=payload.description,
        site_type=payload.site_type,
        area_hectares=payload.area_hectares,
        geom=polygon_geojson_to_wkt(payload.geometry),
    )
    db.add(site)
    db.commit()
    db.refresh(site)
    return _site_response(site, db)


@router.get("/sites/{site_id}", response_model=SiteRead)
def read_site(
    site_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return _site_response(get_owned_site(site_id, current_user, db), db)


@router.delete("/sites/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(
    site_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    site = get_owned_site(site_id, current_user, db)
    db.delete(site)
    db.commit()


def _site_response(site: Site, db: Session) -> dict:
    from sqlalchemy import text

    geometry = db.execute(
        text("SELECT ST_AsGeoJSON(geom) FROM sites WHERE id = :site_id"), {"site_id": site.id}
    ).scalar_one()
    import json

    return {
        "id": site.id,
        "project_id": site.project_id,
        "name": site.name,
        "description": site.description,
        "site_type": site.site_type,
        "area_hectares": site.area_hectares,
        "geometry": json.loads(geometry),
        "created_at": site.created_at,
    }
