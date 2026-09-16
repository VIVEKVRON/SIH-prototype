import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SidebarDashboard from './components/layout/SidebarDashboard';
import GISCanvas from './components/map/GISCanvas';
import LandingPage from './components/layout/LandingPage';

// Dummy GeoJSON data to simulate backend response
const DUMMY_GEOJSON = {
  type: "FeatureCollection",
  metadata: {
    image_dimensions: { width: 1024, height: 1024 },
    total_parcels_detected: 2,
    algorithm: "SegFormer-Orthogonal-DP-v2"
  },
  features: [
    {
      type: "Feature",
      id: "PARCEL-KA-101",
      properties: {
        parcel_id: "KA-BLR-101",
        feature_type: "Building Footprint",
        area_sqm: 145.2,
        perimeter_m: 54.3,
        regularity_score: 0.89,
        status: "Demarcated",
        assessed_tax_inr: 2686
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[150, 200], [400, 200], [400, 450], [150, 450], [150, 200]]
        ]
      }
    },
    {
      type: "Feature",
      id: "PARCEL-KA-102",
      properties: {
        parcel_id: "KA-BLR-102",
        feature_type: "Land Boundary",
        area_sqm: 450.5,
        perimeter_m: 110.2,
        regularity_score: 0.45,
        status: "Demarcated",
        assessed_tax_inr: 8334
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[500, 500], [800, 550], [750, 800], [450, 750], [500, 500]]
        ]
      }
    }
  ]
};

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [geoData, setGeoData] = useState(null);
  const [hoveredFeatureId, setHoveredFeatureId] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleFileUpload = async (file) => {
    setIsProcessing(true);
    setGeoData(null);
    
    // Create object URL for the uploaded image
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    
    // Call the actual backend API
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/v1/extract-parcels", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image on the server");
      }

      const data = await response.json();
      setGeoData(data);
      setIsProcessing(false);
    } catch (error) {
      console.error("API Error:", error);
      // Fallback for demonstration if API isn't running
      setTimeout(() => {
        setGeoData(DUMMY_GEOJSON);
        setIsProcessing(false);
      }, 1500);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {showLanding ? (
        <motion.div key="landing" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }} className="w-full h-full absolute inset-0 z-50">
          <LandingPage onEnter={() => setShowLanding(false)} />
        </motion.div>
      ) : (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex h-screen w-full bg-[#050505] text-slate-200 font-sans overflow-hidden">
          {/* Fixed Sidebar */}
          <div className="w-[380px] h-full flex-shrink-0 z-10 shadow-2xl relative">
            <SidebarDashboard 
              isProcessing={isProcessing} 
              geoData={geoData} 
              onUpload={handleFileUpload} 
              hoveredFeatureId={hoveredFeatureId}
            />
          </div>

          {/* Fluid Workspace */}
          <div className="flex-grow h-full relative">
            <GISCanvas 
              geoData={geoData} 
              hoveredFeatureId={hoveredFeatureId}
              setHoveredFeatureId={setHoveredFeatureId}
              uploadedImage={uploadedImage}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
