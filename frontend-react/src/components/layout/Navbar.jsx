import React from 'react';
import { motion } from 'framer-motion';
import { Scan, Cpu, Users, Home } from 'lucide-react';

export default function Navbar({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'engine', label: 'Neural Core', icon: Cpu },
    { id: 'team', label: 'Team', icon: Users },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 p-4 pointer-events-none flex justify-center">
      <div className="sci-fi-panel bg-[#050505]/80 backdrop-blur-md px-6 py-3 flex items-center gap-8 pointer-events-auto border-b border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
        
        <div className="flex items-center gap-2 mr-8">
          <Scan className="w-5 h-5 text-[#00f0ff] animate-pulse" />
          <span className="text-[#00f0ff] font-bold tracking-[0.2em] uppercase text-sm glitch-effect">
            AeroDristi
          </span>
        </div>

        <nav className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest transition-all duration-300 relative ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-[#00f0ff]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00f0ff]' : ''}`} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-4 left-0 right-0 h-[2px] bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
