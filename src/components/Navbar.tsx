import React from 'react';
import { Route, Award, GraduationCap, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur px-6 py-3 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
          <Route className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-white uppercase m-0 leading-tight">
              Last-Mile Optimization Lab
            </h1>
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
              DAA v2.0
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium m-0">
            Deadline-Constrained Delivery Routing · Woxsen University
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
          <GraduationCap className="w-4 h-4 text-purple-400" />
          <span className="text-slate-300">School of Technology</span>
          <span className="text-slate-500">|</span>
          <span className="font-semibold text-purple-300">Team 7</span>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">Lexicographic Objective Engine</span>
        </div>
      </div>
    </header>
  );
};
