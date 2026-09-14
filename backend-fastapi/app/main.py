import io
import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.ml_engine.model_inference import extract_contours
from app.geospatial.douglas_peucker import simplify_contour_to_polygon
from app.core.metrics_calculator import compute_regularity_score, calculate_metrics
from app.geospatial.geojson_formatter import format_feature, create_feature_collection

app = FastAPI(title="AeroDristi AI Engine")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/api/v1/extract-parcels")
async def extract_parcels(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        return {"error": "Invalid image file"}
        
    h, w, _ = image.shape

    contours = extract_contours(image)
    
    features = []
    parcel_counter = 101

    for cnt in contours:
        poly = simplify_contour_to_polygon(cnt)
        if poly is None:
            continue

        reg_score = compute_regularity_score(poly)
        metrics = calculate_metrics(poly, reg_score)
        
        feature = format_feature(parcel_counter, poly, metrics)
        features.append(feature)
        parcel_counter += 1

    return create_feature_collection(features, w, h)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
