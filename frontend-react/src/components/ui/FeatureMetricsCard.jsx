import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, SquareAsterisk, Hash, CheckCircle2, AlertTriangle } from 'lucide-react';

const MetricRow = ({ icon: Icon, label, value, unit, highlight = false }) => (
  <div className={`flex items-center justify-between p-2.5 border-b border-white/5 bg-gradient-to-r from-transparent hover:to-white/5 transition-all ${highlight ? 'via-[#00f0ff]/5' : ''}`}>
    <div className="flex items-center gap-3">
      <Icon className={`w-3.5 h-3.5 ${highlight ? 'text-[#00f0ff]' : 'text-slate-500'}`} />
      <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`text-sm font-mono font-bold ${highlight ? 'text-[#00f0ff] drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]' : 'text-slate-200'}`}>
        {value}
      </span>
      {unit && <span className="text-[10px] text-slate-500 font-mono">{unit}</span>}
    </div>
  </div>
);

export default function FeatureMetricsCard({ feature }) {
  if (!feature) return null;
  const props = feature.properties;
  const isBuilding = props.feature_type === "Building Footprint";
  const color = isBuilding ? "#00f0ff" : "#ff003c";
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={feature.id}
        initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-3"
      >
        {/* Identity Block */}
        <div 
          className="sci-fi-panel p-4 overflow-hidden group"
          style={{ borderColor: `${color}40` }}
        >
          <div className="absolute top-0 right-0 p-2 opacity-10 transform translate-x-4 -translate-y-2 group-hover:scale-110 transition-transform">
            <Scan className="w-24 h-24" style={{ color }} />
          </div>
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono tracking-[0.2em]">{props.parcel_id}</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-mono text-green-500 uppercase tracking-widest">Locked</span>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white uppercase tracking-wider mt-1 glitch-effect">
              {props.feature_type}
            </h3>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="h-[1px] flex-grow bg-gradient-to-r from-white/20 to-transparent"></div>
              <span className="text-[9px] font-mono text-slate-500">CLASS-A</span>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="bg-[#090a0f] border border-slate-800 p-1">
          <MetricRow 
            icon={SquareAsterisk} 
            label="Area Scope" 
            value={props.area_sqm} 
            unit="SQ.M" 
            highlight={true}
          />
          <MetricRow 
            icon={Scan} 
            label="Perimeter" 
            value={props.perimeter_m} 
            unit="M" 
          />
          <MetricRow 
            icon={Hash} 
            label="Reg. Index" 
            value={props.regularity_score}
          />
        </div>
        
        {/* Tax Block */}
        <div className="sci-fi-button p-3 mt-1 flex justify-between items-center group cursor-crosshair">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 group-hover:animate-spin" />
            <span className="text-[11px] text-amber-500/80 uppercase font-bold tracking-[0.2em]">Tax Assessment</span>
          </div>
          <span className="text-sm font-mono font-bold text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">
            ₹{props.assessed_tax_inr.toLocaleString()}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
