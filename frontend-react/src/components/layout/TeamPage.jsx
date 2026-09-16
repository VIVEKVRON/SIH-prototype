import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Terminal, Mail, GraduationCap } from 'lucide-react';

const TEAM_MEMBERS = [
  { name: 'VIVEK V RON', email: '1me23cs158@gmail.com', role: 'Lead Architect // AI Ops' },
  { name: 'VIVEK Tubaki', email: '1me23cs157@gmail.com', role: 'Systems Engineer' },
  { name: 'VISWANATH REDDY', email: '1me23cs154@gmail.com', role: 'Backend Operations' },
  { name: 'VARSHA V', email: '1me23cs146@gmail.com', role: 'UI/UX Specialist' },
  { name: 'SHINDE RITESH', email: '1me23cs119@gmail.com', role: 'Data Pipeline Ops' },
  { name: 'SAINATH', email: '1me23cs114@gmail.com', role: 'Infrastructure' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 100 } }
};

export default function TeamPage() {
  return (
    <div className="w-full min-h-screen bg-[#050505] flex flex-col items-center py-32 relative overflow-y-auto overflow-x-hidden text-slate-200">
      {/* Background FX */}
      <div className="absolute inset-0 sci-fi-grid opacity-20 pointer-events-none fixed"></div>
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_#ff003c_0%,_transparent_50%)] opacity-5 pointer-events-none mix-blend-screen fixed"></div>

      <div className="z-10 w-full max-w-5xl px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-8 h-8 text-[#ff003c]" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-[0.2em] text-white uppercase drop-shadow-[0_0_10px_rgba(255,0,60,0.5)]">
              Core Team
            </h1>
          </div>
          <p className="text-[#00f0ff] font-mono tracking-widest text-sm uppercase">
            7th Semester // C Section Operatives
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {TEAM_MEMBERS.map((member, index) => (
            <motion.div 
              key={index}
              variants={cardVariants}
              className="sci-fi-panel p-6 relative overflow-hidden group hover:border-[#ff003c]/50 transition-colors duration-500"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Terminal className="w-16 h-16 text-[#00f0ff]" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white tracking-widest uppercase mb-1">
                  {member.name}
                </h3>
                <p className="text-[10px] text-[#ff003c] font-mono tracking-widest uppercase mb-6 drop-shadow-[0_0_5px_rgba(255,0,60,0.8)]">
                  {member.role}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 border-t border-white/10 pt-3">
                    <GraduationCap className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-400 font-mono">7th Sem / Sec C</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <a href={`mailto:${member.email}`} className="text-xs text-[#00f0ff] hover:text-white font-mono transition-colors">
                      {member.email}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Corner decor */}
      <div className="fixed top-4 left-4 md:top-6 md:left-6 w-12 h-12 md:w-16 md:h-16 border-t-2 border-l-2 border-[#ff003c]/30 pointer-events-none"></div>
      <div className="fixed top-4 right-4 md:top-6 md:right-6 w-12 h-12 md:w-16 md:h-16 border-t-2 border-r-2 border-[#ff003c]/30 pointer-events-none"></div>
      <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 w-12 h-12 md:w-16 md:h-16 border-b-2 border-l-2 border-[#ff003c]/30 pointer-events-none"></div>
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-16 md:h-16 border-b-2 border-r-2 border-[#ff003c]/30 pointer-events-none"></div>
    </div>
  );
}
