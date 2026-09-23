import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, Cpu, AlertTriangle } from 'lucide-react';
import UploadDropzone from '../ui/UploadDropzone';
import FeatureMetricsCard from '../ui/FeatureMetricsCard';

export default function SidebarDashboard({ isProcessing, geoData, onUpload, hoveredFeatureId, setHoveredFeatureId, onDemoLoad }) {
  
  const activeFeature = useMemo(() => {
    if (!geoData) return null;
    const valid = geoData.valid_parcels?.features || [];
    const invalid = (geoData.validation_errors || []).map(e => e.feature).filter(Boolean);
    const allFeatures = [...valid, ...invalid];
    
    if (allFeatures.length === 0) return null;
    if (hoveredFeatureId) {
      return allFeatures.find(f => f.id === hoveredFeatureId) || allFeatures[0];
    }
    return allFeatures[0];
  }, [geoData, hoveredFeatureId]);

  return (
    <div className="flex flex-col h-full relative overflow-y-auto custom-scrollbar bg-[#050505]/95 border-r border-[#00f0ff]/20">
      {/* Decorative Sci-Fi Edge */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[#00f0ff]/30 to-transparent"></div>
      
      <div className="p-6 flex flex-col h-full relative z-10">
        {/* Header section */}
        <div className="flex items-start justify-between mb-8 pb-4 border-b border-[#00f0ff]/20">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-[#00f0ff]/10 sci-fi-panel">
              <Target className="w-6 h-6 text-[#00f0ff]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-[0.2em] text-white uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                AeroDristi
              </h1>
              <span className="text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest">
                v2.0 // Neural Core
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6 flex-grow">
          {/* Status HUD */}
          <div className="sci-fi-panel p-3 flex justify-between items-center bg-[#00f0ff]/5">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">System Link</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${isProcessing ? 'text-amber-400' : 'text-[#00f0ff]'}`}>
                {isProcessing ? 'Acquiring...' : 'Online'}
              </span>
              <motion.div 
                className={`w-2 h-2 ${isProcessing ? 'bg-amber-400' : 'bg-[#00f0ff]'}`}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: isProcessing ? 0.5 : 2, repeat: Infinity }}
              />
            </div>
          </div>

          {/* Upload Dropzone */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Telemetry Input
              </h2>
            </div>
            <UploadDropzone onUpload={onUpload} isProcessing={isProcessing} />
            <button 
              onClick={onDemoLoad}
              disabled={isProcessing}
              className="mt-3 w-full bg-slate-900 border border-emerald-500/50 hover:bg-emerald-900/30 text-emerald-400 text-[10px] font-mono tracking-widest uppercase py-2 transition-all disabled:opacity-50"
            >
              [ Demo Perfect Parcel Mapping ]
            </button>
          </div>

          {/* Surveyor Audit Feed */}
          {geoData && geoData.validation_errors && geoData.validation_errors.length > 0 && (
            <div className="mt-2 border-t border-red-500/30 pt-4">
              <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Surveyor Audit Feed
              </h2>
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                {geoData.validation_errors.map((err, idx) => (
                  <div 
                    key={idx} 
                    className="bg-red-950/30 border border-red-500/20 p-2 rounded text-xs cursor-pointer hover:bg-red-900/40 transition-colors"
                    onMouseEnter={() => setHoveredFeatureId?.(err.parcelId)}
                    onMouseLeave={() => setHoveredFeatureId?.(null)}
                  >
                    <div className="font-bold text-red-400 font-mono mb-1">{err.parcelId} // {err.rule}</div>
                    <div className="text-red-200/70 leading-tight">{err.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Metrics */}
          {geoData && activeFeature && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="pt-4"
            >
              <div className="flex items-center justify-between mb-4 border-l-2 border-[#00f0ff] pl-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#00f0ff]" />
                  Tactical Analysis
                </h2>
                <span className="text-[10px] text-[#00f0ff] font-mono bg-[#00f0ff]/10 px-2 py-0.5 border border-[#00f0ff]/30">
                  {geoData.valid_parcels?.features?.length || 0} TGT
                </span>
              </div>
              
              <FeatureMetricsCard feature={activeFeature} />
            </motion.div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-6 mt-auto text-[10px] text-[#00f0ff]/50 font-mono text-center uppercase tracking-[0.3em]">
          Engine // SegFormer-ODPv2
        </div>
      </div>
    </div>
  );
}
