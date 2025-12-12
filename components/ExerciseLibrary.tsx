import React, { useState, useMemo } from 'react';
import { WorkoutPlan, Exercise } from '../types';
import { Trash2, ChevronRight, Dumbbell, Youtube, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  plans: WorkoutPlan[];
  onSelectPlan: (plan: WorkoutPlan) => void;
  onDeletePlan: (id: string) => void;
}

export const ExerciseLibrary: React.FC<Props> = ({ plans, onSelectPlan, onDeletePlan }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'plans' | 'exercises'>('plans');

  const handleStart = (plan: WorkoutPlan) => {
    onSelectPlan(plan);
    navigate('/active');
  };

  // Extract unique exercises from all plans
  const uniqueExercises = useMemo(() => {
    const map = new Map<string, Exercise>();
    plans.forEach(plan => {
      plan.exercises.forEach(ex => {
        if (!map.has(ex.name)) {
          map.set(ex.name, ex);
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [plans]);

  return (
    <div className="p-6 pb-24 min-h-screen bg-slate-950">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Library</h1>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-900 rounded-xl mb-6 border border-slate-800">
        <button 
          onClick={() => setTab('plans')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            tab === 'plans' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'
          }`}
        >
          My Plans
        </button>
        <button 
           onClick={() => setTab('exercises')}
           className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
             tab === 'exercises' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'
           }`}
        >
          Exercises ({uniqueExercises.length})
        </button>
      </div>

      {tab === 'plans' ? (
        plans.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
               <Dumbbell className="text-slate-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Plans Yet</h3>
            <p className="text-slate-400 mb-6">Generate your first AI workout plan to get started.</p>
            <button 
              onClick={() => navigate('/generate')}
              className="px-6 py-2 bg-blue-600 rounded-lg text-white font-medium"
            >
              Create Plan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{plan.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-1">{plan.description}</p>
                  </div>
                  <button 
                    onClick={() => onDeletePlan(plan.id)}
                    className="text-slate-600 hover:text-red-400 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 font-mono">
                    {plan.estimatedDuration}
                  </span>
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                    {plan.exercises.length} Exercises
                  </span>
                </div>

                <button 
                  onClick={() => handleStart(plan)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  Start Workout <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Exercises Tab */
        <div className="space-y-4">
           {uniqueExercises.length === 0 && (
             <div className="text-center text-slate-500 py-8">
               Generate a plan to populate your exercise library.
             </div>
           )}
           {uniqueExercises.map((ex, i) => (
             <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4">
               {/* "Animated" Thumbnail Placeholder */}
               <div className="w-24 h-24 bg-slate-800 rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-slate-700 animate-pulse"></div>
                  <Play size={24} className="text-slate-600 relative z-10" />
               </div>
               
               <div className="flex-1">
                 <h3 className="font-bold text-white mb-1">{ex.name}</h3>
                 <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded mb-2 inline-block">
                   {ex.muscleGroup}
                 </span>
                 <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                   {ex.instructions}
                 </p>
                 <a 
                   href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.videoQuery || ex.name + " exercise form")}`}
                   target="_blank"
                   rel="noreferrer"
                   className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-400"
                 >
                   <Youtube size={14} /> Watch Demo
                 </a>
               </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};
