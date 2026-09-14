import React from 'react';
import { Crosshair, Scan } from 'lucide-react';

export default function GISCanvas({ geoData, hoveredFeatureId, setHoveredFeatureId, uploadedImage }) {
  const CANVAS_WIDTH = 1024;
  const CANVAS_HEIGHT = 1024;

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
          <>
            {/* Grayscale Background Image */}
            <img 
              src={uploadedImage} 
              alt="Drone Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" 
            />
            {/* Color tint overlay for sci-fi feel on the rest of the canvas */}
            <div className="absolute inset-0 bg-[#00f0ff]/5 mix-blend-overlay pointer-events-none"></div>
          </>
        ) : (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#00f0ff_0%,_transparent_70%)]"></div>
        )}
        
        <svg 
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} 
          className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
        >
          {geoData && (
            <>
              {/* Define clip path for the colored image */}
              <defs>
                <clipPath id="polygon-clip">
                  {geoData.features.map((feature) => {
                    const coords = feature.geometry.coordinates[0];
                    const pointsString = coords.map(pt => `${pt[0]},${pt[1]}`).join(" ");
                    return <polygon key={`clip-${feature.id}`} points={pointsString} />;
                  })}
                </clipPath>
              </defs>
              
              {/* Render the full-color image inside the SVG, clipped by the polygons */}
              {uploadedImage && (
                <image 
                  href={uploadedImage} 
                  width={CANVAS_WIDTH} 
                  height={CANVAS_HEIGHT} 
                  preserveAspectRatio="xMidYMid slice" 
                  clipPath="url(#polygon-clip)" 
                />
              )}
              
              {/* Render polygon outlines & overlays */}
              <g>
                {geoData.features.map((feature) => {
                const isHovered = hoveredFeatureId === feature.id;
                const coords = feature.geometry.coordinates[0];
                const pointsString = coords.map(pt => `${pt[0]},${pt[1]}`).join(" ");
                
                const isBuilding = feature.properties.feature_type === "Building Footprint";
                const baseColor = isBuilding ? "#00f0ff" : "#ff003c";

                return (
                  <polygon
                    key={feature.id}
                    points={pointsString}
                    className="cursor-crosshair transition-all duration-300 ease-out"
                    style={{
                      fill: baseColor,
                      fillOpacity: isHovered ? 0.4 : 0.1,
                      stroke: baseColor,
                      strokeWidth: isHovered ? 4 : 1.5,
                      strokeLinejoin: "miter",
                      strokeDasharray: isHovered ? "none" : "5,5",
                      vectorEffect: "non-scaling-stroke",
                      filter: isHovered ? `drop-shadow(0 0 10px ${baseColor})` : "none"
                    }}
                    onMouseEnter={() => setHoveredFeatureId(feature.id)}
                    onMouseLeave={() => setHoveredFeatureId(null)}
                  />
                );
              })}
              </g>
            </>
          )}
        </svg>
        
        {/* HUD Overlays */}
        <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
           <div className="px-2 py-0.5 bg-black/50 border border-[#00f0ff]/30 text-[9px] font-mono text-[#00f0ff] backdrop-blur-sm tracking-widest">
             LAT: 12.9716° N
           </div>
           <div className="px-2 py-0.5 bg-black/50 border border-[#00f0ff]/30 text-[9px] font-mono text-[#00f0ff] backdrop-blur-sm tracking-widest">
             LNG: 77.5946° E
           </div>
        </div>
        <div className="absolute bottom-4 right-4 pointer-events-none">
           <div className="flex items-center gap-2 px-2 py-1 bg-black/50 border border-amber-500/30 text-[9px] font-mono text-amber-500 backdrop-blur-sm tracking-widest">
             <Crosshair className="w-3 h-3" />
             TARGETING ACTIVE
           </div>
        </div>
      </div>
    </div>
  );
}
