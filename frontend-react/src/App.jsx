import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SidebarDashboard from './components/layout/SidebarDashboard';
import GISCanvas from './components/map/GISCanvas';
import LandingPage from './components/layout/LandingPage';
import TeamPage from './components/layout/TeamPage';
import Navbar from './components/layout/Navbar';
import { SAMPLE_GEOJSON } from './data/sampleGeoJson';

// Dummy GeoJSON data to simulate backend response
const DUMMY_GEOJSON = {
  metadata: {
    image_dimensions: { width: 1024, height: 1024 },
    total_parcels_detected: 2,
    algorithm: "SegFormer-Orthogonal-DP-v2"
  },
  valid_parcels: {
    type: "FeatureCollection",
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
      }
    ]
  },
  validation_errors: [
    {
      parcelId: "PARCEL-KA-102",
      rule: "OVERLAP_CHECK",
      message: "Topological conflict detected with adjacent parcel. Please verify boundaries.",
      feature: {
        type: "Feature",
        id: "PARCEL-KA-102",
        properties: {
          parcel_id: "KA-BLR-102",
          feature_type: "Land Boundary",
          area_sqm: 450.5,
          perimeter_m: 110.2,
          regularity_score: 0.45,
          status: "Flagged",
          assessed_tax_inr: 8334
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [[500, 500], [800, 550], [750, 800], [450, 750], [500, 500]]
          ]
        }
      }
    }
  ]
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
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
    
    // Call the Spring Boot API Orchestrator
    const formData = new FormData();
    formData.append("drone_image", file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/api/v1/cadastre/generate`, {
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

  const handleDemoLoad = () => {
    setIsProcessing(true);
    setGeoData(null);
    setUploadedImage('/sample_drone_map.jpg');
    
    setTimeout(() => {
      setGeoData(SAMPLE_GEOJSON);
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <AnimatePresence mode="wait">
        {currentPage === 'home' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }} className="w-full h-full absolute inset-0 z-40">
            <LandingPage onEnter={() => setCurrentPage('engine')} />
          </motion.div>
        )}
        
        {currentPage === 'team' && (
          <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }} className="w-full h-full absolute inset-0 z-40">
            <TeamPage />
          </motion.div>
        )}

        {currentPage === 'engine' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="flex h-screen w-full bg-[#050505] text-slate-200 font-sans overflow-hidden pt-[72px] z-40 relative">
            {/* Fixed Sidebar */}
            <div className="w-[380px] h-full flex-shrink-0 z-10 shadow-2xl relative">
              <SidebarDashboard 
                isProcessing={isProcessing} 
                geoData={geoData} 
                onUpload={handleFileUpload} 
                hoveredFeatureId={hoveredFeatureId}
                setHoveredFeatureId={setHoveredFeatureId}
                onDemoLoad={handleDemoLoad}
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
    </>
  );
}

export default App;
