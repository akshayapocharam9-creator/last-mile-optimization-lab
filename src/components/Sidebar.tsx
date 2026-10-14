import React from 'react';
import { ActiveSection } from '../types';
import {
  PlayCircle,
  GitCompare,
  BarChart3,
  TrendingUp,
  BookOpen,
  FileSpreadsheet,
  Presentation,
  Info,
} from 'lucide-react';

interface SidebarProps {
  activeSection: ActiveSection;
  onSelectSection: (section: ActiveSection) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSelectSection }) => {
  const navItems: { id: ActiveSection; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'simulation',
      label: 'Live Simulation',
      icon: <PlayCircle className="w-4 h-4" />,
      badge: 'Interactive',
    },
    {
      id: 'comparison',
      label: 'Algorithm Comparison',
      icon: <GitCompare className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'Performance Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'scalability',
      label: 'Scalability Laboratory',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'explorer',
      label: 'Algorithm Explorer',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'results',
      label: 'Experimental Results',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: 'PPT Data',
    },
    {
      id: 'presentation',
      label: 'Presentation Mode',
      icon: <Presentation className="w-4 h-4" />,
      badge: '8 Stages',
    },
    {
      id: 'about',
      label: 'About the Project',
      icon: <Info className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-3 select-none flex-shrink-0">
      <div>
        <div className="px-3 py-2 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Navigation</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info in Sidebar */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="font-semibold text-slate-300">Woxsen University</span>
          <span className="text-[10px] text-slate-400 font-mono">B.Tech DAA</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Lexicographic Optimization: 1° Max On-Time, 2° Min Distance
        </p>
      </div>
    </aside>
  );
};
