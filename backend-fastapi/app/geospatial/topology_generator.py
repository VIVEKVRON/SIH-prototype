import logging
import geopandas as gpd
from shapely.geometry import box, Polygon, MultiPolygon
from shapely.ops import voronoi_diagram

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Optional: Add console handler if not already configured globally
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

def synthesize_parcels(buildings_gdf: gpd.GeoDataFrame, roads_gdf: gpd.GeoDataFrame, bbox_geom=None) -> str:
    """
    Synthesizes preliminary legal parcels around building footprints using Voronoi tessellation.
    The resulting parcels are bounded by city blocks (which are bounded by road networks).
    
    :param buildings_gdf: GeoDataFrame containing building polygons.
    :param roads_gdf: GeoDataFrame containing road network polygons.
    :param bbox_geom: A shapely geometry representing the total survey bounding box.
    :return: GeoJSON string of the synthesized legal parcels.
    """
    logger.info("Stage 2: Starting computational parcel synthesis pipeline...")
    
    if buildings_gdf.empty:
        logger.warning("Building GeoDataFrame is empty. Returning empty GeoJSON.")
        return gpd.GeoDataFrame().to_json()
        
    # Extract building centroids for tessellation seed points
    logger.info(f"Extracting centroids from {len(buildings_gdf)} building footprints...")
    centroids = buildings_gdf.geometry.centroid
    
    # Establish Predefined survey bounding box
    if bbox_geom is None:
        minx, miny, maxx, maxy = buildings_gdf.total_bounds
        bbox_geom = box(minx, miny, maxx, maxy)
        # Buffer slightly to encompass the outer footprint boundaries
        bbox_geom = bbox_geom.buffer(10)
        
    logger.info(f"Survey bounding box created: {bbox_geom.bounds}")

    # Create City Blocks by mathematically subtracting road networks from the bounding box
    logger.info("Subtracting road networks from bounding box to isolate City Blocks...")
    if roads_gdf is not None and not roads_gdf.empty:
        # Union all roads into a single monolithic geometry
        unified_roads = roads_gdf.geometry.unary_union
        city_blocks = bbox_geom.difference(unified_roads)
    else:
        logger.info("No roads provided. Assuming the entire bounding box is a single city block.")
        city_blocks = bbox_geom
        
    # Apply Voronoi tessellation on the building centroids
    logger.info("Executing Voronoi tessellation on building centroids...")
    from shapely.geometry import MultiPoint
    multipoint_centroids = MultiPoint(centroids.tolist())
    
    # voronoi_diagram returns a GeometryCollection of Polygons mapped to the centroids
    voronoi_collection = voronoi_diagram(multipoint_centroids, envelope=bbox_geom)
    
    # Clip the Voronoi polygons strictly to the City Blocks to form legal parcels
    logger.info("Clipping infinite Voronoi geometry to City Block boundaries...")
    synthesized_parcels = []
    
    for poly in voronoi_collection.geoms:
        # Intersect with the city blocks to bound the parcel to legal limits
        clipped_poly = poly.intersection(city_blocks)
        
        if not clipped_poly.is_empty:
            # Intersection might result in MultiPolygons if a parcel spans a road (edge case)
            if isinstance(clipped_poly, MultiPolygon):
                synthesized_parcels.extend(list(clipped_poly.geoms))
            else:
                synthesized_parcels.append(clipped_poly)
                
    logger.info(f"Synthesis Complete: Successfully generated {len(synthesized_parcels)} preliminary parcels.")
    
    # Create final output GeoDataFrame
    crs = buildings_gdf.crs if buildings_gdf.crs else "EPSG:4326"
    parcels_gdf = gpd.GeoDataFrame(geometry=synthesized_parcels, crs=crs)
    
    # Assign standard Cadastral IDs
    parcels_gdf['parcel_id'] = [f"SYNTH-PARCEL-{i+1000}" for i in range(len(parcels_gdf))]
    parcels_gdf['status'] = "Pending Validation"
    
    return parcels_gdf.to_json()
