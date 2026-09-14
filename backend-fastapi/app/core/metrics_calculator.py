import math
from shapely.geometry import Polygon

def compute_regularity_score(poly: Polygon) -> float:
    """Calculates how close a polygon is to a regular rectangle/orthogonal shape."""
    min_rect = poly.minimum_rotated_rectangle
    if min_rect.area == 0:
        return 0.0
    return round(min(1.0, poly.area / min_rect.area), 3)

def calculate_metrics(poly: Polygon, reg_score: float) -> dict:
    """Calculates ground metrics from a polygon."""
    # Calibrated estimate (assuming ~0.15m per pixel resolution)
    ground_area_sqm = round(poly.area * 0.0225, 2)
    perimeter_m = round(poly.length * 0.15, 2)
    feature_type = "Building Footprint" if reg_score > 0.65 else "Land Boundary"
    assessed_tax_inr = int(ground_area_sqm * 18.5)
    
    return {
        "feature_type": feature_type,
        "area_sqm": ground_area_sqm,
        "perimeter_m": perimeter_m,
        "regularity_score": reg_score,
        "status": "Demarcated",
        "assessed_tax_inr": assessed_tax_inr
    }
