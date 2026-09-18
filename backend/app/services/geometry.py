from fastapi import HTTPException, status
from geoalchemy2 import WKTElement


def polygon_geojson_to_wkt(geometry: dict) -> WKTElement:
    if geometry.get("type") != "Polygon":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Geometry must be a Polygon"
        )

    coordinates = geometry.get("coordinates")
    if not isinstance(coordinates, list) or len(coordinates) != 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Polygon must have one ring"
        )

    ring = coordinates[0]
    if not isinstance(ring, list) or len(ring) < 4 or ring[0] != ring[-1]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Polygon ring must contain at least four closed positions",
        )

    if any(not isinstance(position, list) or len(position) != 2 for position in ring):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid polygon positions"
        )

    points = ", ".join(f"{position[0]} {position[1]}" for position in ring)
    return WKTElement(f"POLYGON(({points}))", srid=4326)
