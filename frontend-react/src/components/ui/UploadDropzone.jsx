import React, { useCallback, useState } from 'react';
import { UploadCloud, FileImage, Loader2, Crosshair } from 'lucide-react';

export default function UploadDropzone({ onUpload, isProcessing }) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  }, [onUpload]);

  const handleChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  }, [onUpload]);

  return (
    <div
      onDragEnter={(e) => { e.preventDefault(); setIsDragActive(true); }}
      onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
      onDrop={handleDrop}
      className={`
        relative overflow-hidden group sci-fi-panel p-[1px]
        ${isDragActive ? 'bg-[#00f0ff]' : 'bg-slate-800 hover:bg-[#00f0ff]/50'}
        ${isProcessing ? 'pointer-events-none opacity-50' : 'cursor-crosshair'}
        transition-colors duration-300
      `}
    >
      <div className="bg-[#050505] w-full h-full p-6 flex flex-col items-center justify-center text-center gap-3 relative z-10" style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair z-20" 
        />
        
        {/* Scanning reticle effect in background */}
        <div className="absolute inset-0 sci-fi-grid opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 border border-[#00f0ff]/10 m-2 pointer-events-none"></div>
        
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#00f0ff]/50"></div>
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#00f0ff]/50"></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#00f0ff]/50"></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#00f0ff]/50"></div>

        {isProcessing ? (
          <>
            <div className="relative">
              <Crosshair className="w-10 h-10 text-[#00f0ff] animate-spin-slow opacity-50" />
              <Loader2 className="w-5 h-5 text-[#00f0ff] animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-[#00f0ff] uppercase tracking-widest glitch-effect">Uplink Active</p>
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em]">Transmitting data...</p>
            </div>
          </>
        ) : (
          <>
            <div className={`relative transition-all duration-300 ${isDragActive ? 'scale-110 text-[#00f0ff]' : 'text-slate-500 group-hover:text-[#00f0ff]'}`}>
              <UploadCloud className="w-8 h-8 relative z-10" />
              <Crosshair className={`absolute -inset-2 w-12 h-12 opacity-0 group-hover:opacity-30 group-hover:animate-spin-slow transition-opacity ${isDragActive ? 'opacity-50' : ''}`} />
            </div>
            <div className="space-y-1 z-10">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                <span className="text-[#00f0ff]">Engage</span> Uplink
              </p>
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest flex items-center justify-center gap-1">
                <FileImage className="w-3 h-3" />
                IMG / TIF (MAX 15M)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
