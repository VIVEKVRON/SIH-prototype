import io
import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import json
import geopandas as gpd
from app.geospatial.topology_generator import synthesize_parcels

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

@app.post("/api/v1/engine/synthesize")
async def synthesize_api(file: UploadFile = File(...)):
    """
    Extracts geometric features from the image and synthesizes topological parcels.
    Returns both the synthesized parcels and the underlying building footprints.
    """
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            logging.error("Failed to decode uploaded image.")
            return JSONResponse(status_code=400, content={"error": "Invalid image file"})
            
        h, w, _ = image.shape
        
        # Extract basic contours
        contours = extract_contours(image)
        
        # Convert contours to shapely polygons
        polygons = []
        for cnt in contours:
            poly = simplify_contour_to_polygon(cnt)
            if poly is not None and poly.is_valid and not poly.is_empty:
                polygons.append(poly)
                
        if not polygons:
            logging.warning("No building footprints detected in image.")
            buildings_gdf = gpd.GeoDataFrame(geometry=[], crs="EPSG:32643")
        else:
            buildings_gdf = gpd.GeoDataFrame(geometry=polygons, crs="EPSG:32643")
            
        # Optional: Empty roads_gdf as YOLO doesn't currently predict roads
        roads_gdf = gpd.GeoDataFrame(geometry=[], crs="EPSG:32643")
        
        # Synthesize parcels using Voronoi tessellation
        geojson_str = synthesize_parcels(buildings_gdf, roads_gdf)
        buildings_geojson_str = buildings_gdf.to_json()
        
        return {
            "synthesized_parcels": json.loads(geojson_str),
            "building_footprints": json.loads(buildings_geojson_str)
        }
        
    except Exception as e:
        logging.error(f"Engine orchestration failed: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500, 
            content={"error": str(e), "message": "Inference or geometry generation failed due to an internal error."}
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
