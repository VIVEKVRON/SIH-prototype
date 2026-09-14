import React from 'react';
import { motion } from 'framer-motion';
import { Scan, Shield, Database, Crosshair } from 'lucide-react';

export default function LandingPage({ onEnter }) {
  return (
    <div className="w-full min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-y-auto overflow-x-hidden text-slate-200 py-12">
      {/* Background Grids & Orbs */}
      <div className="absolute inset-0 sci-fi-grid opacity-20 pointer-events-none fixed"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_#00f0ff_0%,_transparent_50%)] opacity-10 pointer-events-none mix-blend-screen fixed"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 flex flex-col items-center text-center max-w-4xl px-6 w-full"
      >
        <div className="relative mb-4">
          <Scan className="w-16 h-16 md:w-20 md:h-20 text-[#00f0ff] animate-pulse" strokeWidth={1} />
          <Crosshair className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-28 md:h-28 text-[#ff003c] opacity-20 animate-spin-slow" strokeWidth={1} />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-[0.2em] text-white uppercase drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] glitch-effect mb-2">
          AeroDristi
        </h1>
        <p className="text-[#00f0ff] font-mono tracking-widest text-xs md:text-sm mb-8 uppercase">
          Automated Cadastral Mapping // Neural Core v2.0
        </p>

        <p className="text-slate-400 text-base md:text-lg font-mono leading-relaxed mb-10 max-w-2xl mx-auto">
          AeroDristi ingests drone orthomosaics and deploys <span className="text-[#00f0ff]">SegFormer</span> models coupled with 
          <span className="text-[#ff003c]"> Douglas-Peucker</span> geometric regularization to instantly extract, classify, and assess building footprints and land boundaries.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 w-full max-w-3xl mx-auto">
          <div className="sci-fi-panel p-5 flex flex-col items-center text-center">
            <Scan className="w-6 h-6 text-[#00f0ff] mb-3" />
            <h3 className="font-bold text-white tracking-widest uppercase text-[11px] mb-2">Precision Scan</h3>
            <p className="text-[10px] text-slate-500 font-mono">Sub-meter autonomous extraction of infrastructure.</p>
          </div>
          <div className="sci-fi-panel p-5 flex flex-col items-center text-center">
            <Shield className="w-6 h-6 text-[#00f0ff] mb-3" />
            <h3 className="font-bold text-white tracking-widest uppercase text-[11px] mb-2">Automated Tax</h3>
            <p className="text-[10px] text-slate-500 font-mono">Real-time area computation and tax assessment.</p>
          </div>
          <div className="sci-fi-panel p-5 flex flex-col items-center text-center">
            <Database className="w-6 h-6 text-[#00f0ff] mb-3" />
            <h3 className="font-bold text-white tracking-widest uppercase text-[11px] mb-2">GeoJSON Ready</h3>
            <p className="text-[10px] text-slate-500 font-mono">Exports directly to standardized spatial formats.</p>
          </div>
        </div>

        <button 
          onClick={onEnter}
          className="sci-fi-button px-10 py-3 md:py-4 text-sm md:text-base drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] hover:scale-105 transition-transform"
        >
          Initialize Neural Core
        </button>
      </motion.div>
      
      {/* Corner decor */}
      <div className="fixed top-4 left-4 md:top-6 md:left-6 w-12 h-12 md:w-16 md:h-16 border-t-2 border-l-2 border-[#00f0ff]/50"></div>
      <div className="fixed top-4 right-4 md:top-6 md:right-6 w-12 h-12 md:w-16 md:h-16 border-t-2 border-r-2 border-[#00f0ff]/50"></div>
      <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 w-12 h-12 md:w-16 md:h-16 border-b-2 border-l-2 border-[#00f0ff]/50"></div>
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-16 md:h-16 border-b-2 border-r-2 border-[#00f0ff]/50"></div>
    </div>
  );
}
