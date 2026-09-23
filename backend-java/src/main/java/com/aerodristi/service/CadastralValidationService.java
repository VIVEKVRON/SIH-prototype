package com.aerodristi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.io.geojson.GeoJsonReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Stage 3 Cadastral Pipeline: Strict Topological Validation Service
 * Uses the Java Topology Suite (JTS) to mathematically enforce spatial relationships.
 */
@Service
public class CadastralValidationService {

    private static final Logger logger = LoggerFactory.getLogger(CadastralValidationService.class);
    private final GeoJsonReader geoJsonReader;
    private final ObjectMapper objectMapper;
    private final GeometryFactory geometryFactory;

    // Minimum geometric area threshold for a valid parcel (Sliver check)
    private static final double MIN_AREA_SQM = 5.0;

    public CadastralValidationService() {
        this.geometryFactory = new GeometryFactory();
        this.geoJsonReader = new GeoJsonReader(geometryFactory);
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Validates a collection of synthesized parcels against strict topological rules.
     * 
     * @param parcelsGeoJson The GeoJSON FeatureCollection of synthesized parcels.
     * @param buildingsGeoJson The GeoJSON FeatureCollection of primary building footprints.
     * @return JSON string containing "valid_parcels" and "validation_errors".
     */
    public String validateTopology(String parcelsGeoJson, String buildingsGeoJson) throws Exception {
        logger.info("Stage 3: Initiating strict cadastral topology validation...");

        JsonNode parcelsRoot = objectMapper.readTree(parcelsGeoJson);
        JsonNode buildingsRoot = objectMapper.readTree(buildingsGeoJson);

        List<Geometry> buildings = extractGeometries(buildingsRoot);
        
        ArrayNode validParcels = objectMapper.createArrayNode();
        ArrayNode validationErrors = objectMapper.createArrayNode();

        JsonNode features = parcelsRoot.get("features");
        if (features == null || !features.isArray()) {
            throw new IllegalArgumentException("Invalid GeoJSON: Missing 'features' array.");
        }
        
        // Convert all parcels to Geometry objects first to cross-check overlaps
        Map<String, Geometry> parcelGeoms = new HashMap<>();
        Map<String, JsonNode> parcelNodes = new HashMap<>();
        
        for (JsonNode feature : features) {
            String parcelId = feature.has("id") ? feature.get("id").asText() : 
                              feature.path("properties").path("parcel_id").asText("UNKNOWN");
                              
            Geometry geom = geoJsonReader.read(feature.get("geometry").toString());
            parcelGeoms.put(parcelId, geom);
            parcelNodes.put(parcelId, feature);
        }

        logger.info("Processing {} parcels against {} structural footprints.", parcelGeoms.size(), buildings.size());

        for (Map.Entry<String, Geometry> entry : parcelGeoms.entrySet()) {
            String parcelId = entry.getKey();
            Geometry parcelGeom = entry.getValue();
            List<String> errors = new ArrayList<>();

            // ==========================================
            // RULE 1: SLIVER CHECK (Area must be >= 5 sqm)
            // ==========================================
            if (parcelGeom.getArea() < MIN_AREA_SQM) {
                logger.warn("Parcel {} failed SLIVER_CHECK: Area is {} sqm", parcelId, parcelGeom.getArea());
                errors.add("SLIVER_CHECK_FAILED: Geometry area (" + parcelGeom.getArea() + ") is under strict threshold of " + MIN_AREA_SQM + " sqm.");
            }

            // ==========================================
            // RULE 2: OVERLAP CHECK (No illegal shared space)
            // ==========================================
            boolean overlaps = false;
            for (Map.Entry<String, Geometry> otherEntry : parcelGeoms.entrySet()) {
                if (!parcelId.equals(otherEntry.getKey())) {
                    // Using JTS deterministic spatial predicate
                    if (parcelGeom.overlaps(otherEntry.getValue())) {
                        overlaps = true;
                        break;
                    }
                }
            }
            if (overlaps) {
                logger.warn("Parcel {} failed OVERLAP_CHECK: Illegally shares topological space with neighbor.", parcelId);
                errors.add("OVERLAP_CHECK_FAILED: Parcel illegally intersects/overlaps with an adjacent parcel boundary.");
            }

            // ==========================================
            // RULE 3: CONTAINMENT CHECK (1 Primary Building)
            // ==========================================
            int containedBuildings = 0;
            for (Geometry building : buildings) {
                // Using JTS deterministic spatial predicate
                if (parcelGeom.contains(building)) {
                    containedBuildings++;
                }
            }
            if (containedBuildings != 1) {
                logger.warn("Parcel {} failed CONTAINMENT_CHECK: Contains {} primary buildings.", parcelId, containedBuildings);
                errors.add("CONTAINMENT_CHECK_FAILED: Parcel must contain exactly 1 footprint. Found " + containedBuildings + ".");
            }

            // ==========================================
            // RESULT AGGREGATION
            // ==========================================
            if (errors.isEmpty()) {
                logger.debug("Parcel {} passed all spatial validations.", parcelId);
                validParcels.add(parcelNodes.get(parcelId));
            } else {
                ObjectNode errorNode = objectMapper.createObjectNode();
                errorNode.put("parcelId", parcelId);
                errorNode.put("rule", errors.get(0).split(":")[0]);
                errorNode.put("message", errors.get(0).split(":")[1].trim());
                ArrayNode errorsArray = errorNode.putArray("rule_violations");
                errors.forEach(errorsArray::add);
                errorNode.set("feature", parcelNodes.get(parcelId)); // Attach feature for frontend rendering
                validationErrors.add(errorNode);
            }
        }

        ObjectNode validFeatureCollection = objectMapper.createObjectNode();
        validFeatureCollection.put("type", "FeatureCollection");
        validFeatureCollection.set("features", validParcels);

        ObjectNode response = objectMapper.createObjectNode();
        response.set("valid_parcels", validFeatureCollection);
        response.set("validation_errors", validationErrors);
        
        logger.info("Validation complete. Valid: {} | Errored: {}", validParcels.size(), validationErrors.size());

        return objectMapper.writeValueAsString(response);
    }

    private List<Geometry> extractGeometries(JsonNode featureCollection) throws Exception {
        List<Geometry> geometries = new ArrayList<>();
        if (featureCollection.has("features")) {
            for (JsonNode feature : featureCollection.get("features")) {
                Geometry geom = geoJsonReader.read(feature.get("geometry").toString());
                geometries.add(geom);
            }
        }
        return geometries;
    }
}
