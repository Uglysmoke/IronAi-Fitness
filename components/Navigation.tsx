import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Dumbbell, MessageSquare, PieChart, Plus } from 'lucide-react';

export const Navigation: React.FC = () => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors ${
      isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-slate-950/90 backdrop-blur-md border-t border-slate-900">
      <div className="grid grid-cols-5 h-full max-w-md mx-auto">
        <NavLink to="/" className={navClass}>
          <PieChart size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/generate" className={navClass}>
          <Plus size={20} />
          <span>Create</span>
        </NavLink>
        <NavLink to="/active" className={({ isActive }) => 
           `flex flex-col items-center justify-center w-full h-full -mt-6`
        }>
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 shadow-lg shadow-blue-900/40 text-white hover:bg-blue-500 transition-colors ring-4 ring-slate-950">
            <Activity size={24} />
          </div>
        </NavLink>
        <NavLink to="/library" className={navClass}>
          <Dumbbell size={20} />
          <span>Workouts</span>
        </NavLink>
        <NavLink to="/coach" className={navClass}>
          <MessageSquare size={20} />
          <span>Coach</span>
        </NavLink>
      </div>
    </nav>
  );
};