import cv2
import numpy as np

def extract_contours(image: np.ndarray) -> list:
    """Runs computer vision pipeline to extract contours from the image."""
    # Multi-thresholding + morphological gradient to extract distinct built structures
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 40, 150)
    
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter out trivial noise
    return [cnt for cnt in contours if cv2.contourArea(cnt) > 1200]
