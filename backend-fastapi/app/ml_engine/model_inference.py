import os
import cv2
import numpy as np
from ultralytics import YOLO

# Try to load the YOLO model. We do it globally so it's loaded once at startup.
# Ensure the path is correct relative to where main.py runs
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "weights", "yolo26n.pt")
try:
    model = YOLO(MODEL_PATH)
    print(f"Successfully loaded YOLO model from {MODEL_PATH}")
except Exception as e:
    print(f"Warning: Failed to load YOLO model: {e}")
    model = None

def extract_contours(image: np.ndarray) -> list:
    """
    Runs computer vision pipeline to extract contours. 
    Uses the fine-tuned YOLO model if available.
    """
    if model is not None:
        # Run YOLO inference
        results = model(image, verbose=False)
        valid_contours = []
        
        # Parse masks from YOLO results
        for r in results:
            if r.masks is not None:
                # r.masks.xy is a list of segments, each is an (N, 2) numpy array
                for seg in r.masks.xy:
                    # Convert float coordinates to integers
                    seg_int = np.array(seg, dtype=np.int32)
                    # Reshape to OpenCV contour format (N, 1, 2)
                    contour = seg_int.reshape((-1, 1, 2))
                    
                    # Basic noise filtering
                    if cv2.contourArea(contour) > 800:
                        valid_contours.append(contour)
                        
        return valid_contours

    # -------------------------------------------------------------
    # FALLBACK OpenCV Logic (if model fails to load)
    # -------------------------------------------------------------
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Improve contrast
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    
    # Edge preservation smoothing
    blurred = cv2.bilateralFilter(enhanced, 9, 75, 75)
    
    # Adaptive thresholding
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                   cv2.THRESH_BINARY_INV, 11, 2)
    
    # Morphological operations to clean up and form solid blocks
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
    opened = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel, iterations=3)
    
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    valid_contours = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 800 < area < 100000:
            epsilon = 0.02 * cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, epsilon, True)
            if 4 <= len(approx) <= 12:
                valid_contours.append(approx)
                
    return valid_contours
