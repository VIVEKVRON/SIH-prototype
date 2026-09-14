from shapely.geometry import Polygon, mapping

def format_feature(parcel_counter: int, poly: Polygon, metrics: dict) -> dict:
    """Formats a single parcel into a GeoJSON feature."""
    return {
        "type": "Feature",
        "id": f"PARCEL-KA-{parcel_counter}",
        "properties": {
            "parcel_id": f"KA-BLR-{parcel_counter}",
            **metrics
        },
        "geometry": mapping(poly)
    }

def create_feature_collection(features: list, width: int, height: int) -> dict:
    """Wraps features into a GeoJSON FeatureCollection."""
    return {
        "type": "FeatureCollection",
        "metadata": {
            "image_dimensions": {"width": width, "height": height},
            "total_parcels_detected": len(features),
            "algorithm": "SegFormer-Orthogonal-DP-v2"
        },
        "features": features
    }
