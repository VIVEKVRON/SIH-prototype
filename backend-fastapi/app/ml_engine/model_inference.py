import cv2
import numpy as np

def extract_contours(image: np.ndarray) -> list:
    """
    Runs computer vision pipeline to extract contours. 
    Placeholder until SegFormer finetuned weights are loaded.
    """
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
        # Filter tiny noise and massive background contours
        if 800 < area < 100000:
            # Approximate the contour to a polygon to make it more "building-like"
            epsilon = 0.02 * cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, epsilon, True)
            
            # Ensure it has a reasonable number of vertices (like a building)
            if 4 <= len(approx) <= 12:
                valid_contours.append(approx)
                
    return valid_contours
