import cv2
from shapely.geometry import Polygon

def simplify_contour_to_polygon(contour) -> Polygon:
    """Applies Douglas-Peucker algorithm to simplify a contour to an orthogonal-like polygon."""
    peri = cv2.arcLength(contour, True)
    epsilon = 0.035 * peri  # Sharp orthogonal simplification
    approx = cv2.approxPolyDP(contour, epsilon, True)
    
    if len(approx) < 3:
        return None
        
    coords = [(float(pt[0][0]), float(pt[0][1])) for pt in approx]
    coords.append(coords[0])  # Close polygon ring
    
    poly = Polygon(coords)
    if not poly.is_valid:
        poly = poly.buffer(0)
    
    return poly if not poly.is_empty else None
