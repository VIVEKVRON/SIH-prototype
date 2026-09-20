import React, { useMemo } from 'react';
import { Crosshair, Scan } from 'lucide-react';

export default function GISCanvas({ geoData, hoveredFeatureId, setHoveredFeatureId, uploadedImage }) {
  const CANVAS_WIDTH = 1024;
  const CANVAS_HEIGHT = 1024;

  // Helper to calculate tooltip position
  const getCentroid = (coords) => {
    let x = 0, y = 0, n = coords.length;
    for (let pt of coords) {
      x += pt[0];
      y += pt[1];
    }
    return { x: x / n, y: y / n };
  };

  if (!geoData && !uploadedImage) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] relative">
        <div className="absolute inset-0 sci-fi-grid opacity-30"></div>
        <div className="relative z-10 flex flex-col items-center gap-4 opacity-50">
          <Scan className="w-16 h-16 text-[#00f0ff] animate-pulse" strokeWidth={1} />
          <p className="text-[#00f0ff] font-mono text-xs tracking-[0.3em] uppercase">
            Awaiting Visual Feed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#050505] relative overflow-hidden flex items-center justify-center">
      {/* Grid Background */}
      <div className="absolute inset-0 sci-fi-grid opacity-20"></div>
      
      {/* Main SVG Map Canvas */}
      <div className="relative w-full max-w-[800px] aspect-square bg-black border border-[#00f0ff]/20 shadow-[0_0_30px_rgba(0,240,255,0.05)]">
        
        {/* Reticles */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00f0ff]/50"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00f0ff]/50"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00f0ff]/50"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00f0ff]/50"></div>

        {uploadedImage ? (
          <img 
            src={uploadedImage} 
            alt="Drone Background" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        ) : (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#00f0ff_0%,_transparent_70%)]"></div>
        )}
        
        <svg 
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} 
          className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
        >
          {geoData && (
            <g>
              {geoData.features.map((feature) => {
                const isHovered = hoveredFeatureId === feature.id;
                
                // Handle both Polygon and MultiPolygon
                const isMulti = feature.geometry.type === "MultiPolygon";
                const polygons = isMulti ? feature.geometry.coordinates : [feature.geometry.coordinates];
                
                return (
                  <g key={feature.id}>
                    {polygons.map((ring, idx) => {
                      const coords = ring[0];
                      const pointsString = coords.map(pt => `${pt[0]},${pt[1]}`).join(" ");
                      
                      // Match user's reference design
                      const strokeColor = isHovered ? "#fde047" : "#1d4ed8"; // Yellow highlight, Blue default
                      const fillColor = isHovered ? "#fef08a" : "transparent"; // Light yellow fill when hovered
                      const fillOpacity = isHovered ? 0.4 : 0;
                      
                      return (
                        <polygon
                          key={`${feature.id}-${idx}`}
                          points={pointsString}
                          className="cursor-pointer transition-all duration-300 ease-out"
                          style={{
                            fill: fillColor,
                            fillOpacity: fillOpacity,
                            stroke: strokeColor,
                            strokeWidth: isHovered ? 5 : 2,
                            strokeLinejoin: "round",
                            vectorEffect: "non-scaling-stroke",
                          }}
                          onMouseEnter={() => setHoveredFeatureId(feature.id)}
                          onMouseLeave={() => setHoveredFeatureId(null)}
                        />
                      );
                    })}
                  </g>
                );
              })}
              
              {/* Render Tooltip on top if hovered */}
              {hoveredFeatureId && geoData.features.map(feature => {
                if (feature.id !== hoveredFeatureId) return null;
                
                const isMulti = feature.geometry.type === "MultiPolygon";
                const coords = isMulti ? feature.geometry.coordinates[0][0] : feature.geometry.coordinates[0];
                const centroid = getCentroid(coords);
                
                // Conversions
                const acres = (feature.properties.area_sqm * 0.000247105).toFixed(2);
                const pId = feature.properties.parcel_id.replace("KA-BLR-", "1245-78-");
                
                return (
                  <foreignObject 
                    key={`tooltip-${feature.id}`} 
                    x={centroid.x - 125} 
                    y={centroid.y - 140} 
                    width="250" 
                    height="120"
                    className="pointer-events-none overflow-visible"
                  >
                    <div className="relative bg-white rounded-md shadow-2xl border border-slate-200 flex flex-col font-sans text-slate-800 text-xs">
                      <div className="bg-[#1e63a1] text-white font-semibold py-2 px-3 rounded-t-md">
                        PARCEL {pId}
                      </div>
                      <div className="p-3 flex flex-col gap-1.5 bg-white rounded-b-md">
                        <div className="flex justify-between">
                          <span className="font-bold">Property Address:</span>
                          <span>4321 Oak Ave</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold flex items-center gap-1">📏 Acreage:</span>
                          <span>{acres} acres</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold flex items-center gap-1">🏠 Parcel ID:</span>
                          <span>{pId}</span>
                        </div>
                      </div>
                      {/* Tooltip arrow */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-solid border-l-transparent border-r-transparent border-t-white drop-shadow-md"></div>
                    </div>
                  </foreignObject>
                );
              })}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
