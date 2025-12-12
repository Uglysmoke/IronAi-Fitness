import React, { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutSession, SetLog, Exercise } from '../types';
import { Timer, CheckCircle2, Play, ChevronRight, Save, Youtube, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  plan: WorkoutPlan | null;
  onSaveSession: (session: WorkoutSession) => void;
}

export const ActiveWorkout: React.FC<Props> = ({ plan, onSaveSession }) => {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [active, setActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
  // State for detailed logs: key = "exerciseIndex-setIndex", value = SetLog
  const [logs, setLogs] = useState<Record<string, SetLog>>({});
  
  // State for video modal
  const [showVideo, setShowVideo] = useState<Exercise | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (active) {
      interval = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [active]);

  // Initialize logs when plan changes
  useEffect(() => {
    if (plan) {
      const initialLogs: Record<string, SetLog> = {};
      plan.exercises.forEach((ex, exIdx) => {
        for (let i = 0; i < ex.sets; i++) {
          initialLogs[`${exIdx}-${i}`] = { weight: 0, reps: 0, completed: false };
        }
      });
      setLogs(initialLogs);
    }
  }, [plan]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateLog = (exIdx: number, setIdx: number, field: keyof SetLog, value: number | boolean) => {
    const key = `${exIdx}-${setIdx}`;
    setLogs(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const finishWorkout = () => {
    if (!plan) return;
    setActive(false);
    
    // Aggregate logs
    const completedExercises = plan.exercises.map((ex, exIdx) => {
      const sets: SetLog[] = [];
      for (let i = 0; i < ex.sets; i++) {
        const log = logs[`${exIdx}-${i}`] || { weight: 0, reps: 0, completed: false };
        if (log.completed) sets.push(log);
      }
      return {
        name: ex.name,
        sets
      };
    }).filter(e => e.sets.length > 0);

    const totalVolume = completedExercises.reduce((vol, ex) => {
      return vol + ex.sets.reduce((sVol, s) => sVol + (s.weight * s.reps), 0);
    }, 0);

    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      planId: plan.id,
      date: Date.now(),
      durationSeconds: elapsed,
      volume: totalVolume,
      completedExercises
    };
    
    onSaveSession(session);
    navigate('/');
  };

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-6 text-center">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-700">
          <Play size={32} className="text-slate-400 ml-1" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Active Workout</h2>
        <p className="text-slate-400 mb-8 max-w-xs">Select a workout from your library or generate a new one to get started.</p>
        <button 
          onClick={() => navigate('/library')}
          className="px-8 py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
        >
          Go to Library
        </button>
      </div>
    );
  }

  const currentExercise = plan.exercises[currentExerciseIndex];

  return (
    <div className="pb-24 min-h-screen bg-slate-950">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-900 p-4 shadow-xl">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold truncate text-white max-w-[200px]">{plan.title}</h2>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            <Timer size={16} className={active ? "text-green-400 animate-pulse" : "text-slate-400"} />
            <span className="font-mono font-medium text-slate-200">{formatTime(elapsed)}</span>
          </div>
        </div>
        <div className="flex gap-2">
           {!active ? (
             <button 
               onClick={() => setActive(true)} 
               className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-green-900/20"
             >
               Start Timer
             </button>
           ) : (
             <button 
               onClick={() => setActive(false)} 
               className="flex-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20 py-2 rounded-lg font-bold text-sm transition-colors"
             >
               Pause
             </button>
           )}
           <button 
             onClick={finishWorkout}
             className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-900/20"
           >
             <Save size={16} /> Finish
           </button>
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="p-4 space-y-4">
        {plan.exercises.map((exercise, idx) => {
          const isCurrent = idx === currentExerciseIndex;
          
          return (
            <div 
              key={idx} 
              id={`exercise-${idx}`}
              className={`rounded-2xl transition-all duration-500 overflow-hidden border ${
                isCurrent 
                  ? 'bg-slate-900 border-blue-500/50 shadow-lg shadow-blue-900/10' 
                  : 'bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100'
              }`}
              onClick={() => setCurrentExerciseIndex(idx)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                      {exercise.name}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mt-1">{exercise.instructions}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowVideo(exercise);
                    }}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg ml-2 transition-colors"
                  >
                    <Youtube size={24} />
                  </button>
                </div>
                
                {isCurrent && (
                  <div className="flex gap-2 mt-2 mb-4">
                     <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                      Rest: {exercise.rest}
                    </span>
                    <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                      Target: {exercise.reps} reps
                    </span>
                  </div>
                )}
                
                <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">
                  <div>Set</div>
                  <div>kg/lbs</div>
                  <div>Reps</div>
                  <div>Done</div>
                </div>

                <div className="space-y-2">
                  {Array.from({ length: exercise.sets }).map((_, sIdx) => {
                    const logKey = `${idx}-${sIdx}`;
                    const log = logs[logKey] || { weight: 0, reps: 0, completed: false };
                    
                    return (
                      <div key={sIdx} className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 items-center">
                        <div className="flex items-center justify-center h-10 bg-slate-800 rounded-lg text-slate-400 font-bold text-sm border border-slate-700">
                          {sIdx + 1}
                        </div>
                        <input
                          type="number"
                          placeholder="0"
                          value={log.weight || ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateLog(idx, sIdx, 'weight', parseFloat(e.target.value))}
                          className="h-10 bg-slate-950 rounded-lg text-center text-white text-sm outline-none focus:ring-1 focus:ring-blue-500 border border-slate-800 placeholder-slate-600 focus:border-blue-500 transition-all"
                        />
                         <input
                          type="number"
                          placeholder="0"
                          value={log.reps || ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateLog(idx, sIdx, 'reps', parseFloat(e.target.value))}
                          className="h-10 bg-slate-950 rounded-lg text-center text-white text-sm outline-none focus:ring-1 focus:ring-blue-500 border border-slate-800 placeholder-slate-600 focus:border-blue-500 transition-all"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLog(idx, sIdx, 'completed', !log.completed);
                          }}
                          className={`h-10 rounded-lg flex items-center justify-center transition-all ${
                            log.completed
                              ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' 
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-500 border border-slate-700'
                          }`}
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Quick Navigation Footer */}
      <div className="fixed bottom-20 right-4 flex gap-2">
         <button 
           disabled={currentExerciseIndex === 0}
           onClick={() => setCurrentExerciseIndex(i => i - 1)}
           className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white disabled:opacity-30 hover:bg-slate-700 transition-colors"
         >
           <ChevronRight size={20} className="rotate-180" />
         </button>
         <button 
           disabled={currentExerciseIndex === plan.exercises.length - 1}
           onClick={() => setCurrentExerciseIndex(i => i + 1)}
           className="w-10 h-10 rounded-full bg-blue-600 shadow-lg shadow-blue-900/50 flex items-center justify-center text-white disabled:opacity-30 hover:bg-blue-500 transition-colors"
         >
           <ChevronRight size={20} />
         </button>
      </div>

      {/* Video "Modal" */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-slate-950/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-lg">{showVideo.name}</h3>
              <button onClick={() => setShowVideo(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Simulated Animated Description */}
            <div className="w-full aspect-video bg-slate-800 rounded-xl mb-4 relative overflow-hidden flex flex-col items-center justify-center group border border-slate-700">
               <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-slate-800 animate-pulse"></div>
               <Play size={48} className="text-slate-600 z-10 opacity-70" />
               <p className="z-10 text-xs text-slate-500 mt-2 font-medium uppercase tracking-widest">Visual Demonstration</p>
            </div>

            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              {showVideo.instructions}
            </p>

            <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(showVideo.videoQuery || showVideo.name + " exercise form")}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-900/20"
            >
              <Youtube size={20} />
              Watch on YouTube
            </a>
          </div>
        </div>
      )}
    </div>
  );
};