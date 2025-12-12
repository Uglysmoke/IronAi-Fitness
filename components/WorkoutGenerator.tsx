import React, { useState } from 'react';
import { generateWorkoutPlan } from '../services/geminiService';
import { Difficulty, WorkoutPlan } from '../types';
import { Loader2, Sparkles, ChevronRight, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onPlanCreated: (plan: WorkoutPlan) => void;
}

export const WorkoutGenerator: React.FC<Props> = ({ onPlanCreated }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form State
  const [goal, setGoal] = useState('Build Muscle');
  const [equipment, setEquipment] = useState('Full Gym');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Intermediate);
  const [duration, setDuration] = useState('45 mins');
  const [focus, setFocus] = useState('Full Body');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const plan = await generateWorkoutPlan(goal, equipment, difficulty, duration, focus);
      onPlanCreated(plan);
      navigate('/library');
    } catch (e) {
      alert("Failed to generate workout. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Primary Goal</label>
        <div className="grid grid-cols-2 gap-3">
          {['Build Muscle', 'Lose Fat', 'Improve Strength', 'Endurance'].map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                goal === g 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:border-slate-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          {Object.values(Difficulty).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                difficulty === d ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      
      <button 
        onClick={() => setStep(2)}
        className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
      >
        Next Step <ChevronRight size={18} />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Available Equipment</label>
        <select 
          value={equipment} 
          onChange={(e) => setEquipment(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        >
          <option>Full Gym</option>
          <option>Dumbbells Only</option>
          <option>Bodyweight Only</option>
          <option>Home Gym (Bands + DBs)</option>
          <option>Kettlebell</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
        <div className="grid grid-cols-3 gap-3">
          {['30 mins', '45 mins', '60+ mins'].map((t) => (
            <button
              key={t}
              onClick={() => setDuration(t)}
              className={`p-2 rounded-xl border text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                duration === t 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Clock size={16} />
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Target Focus</label>
        <input 
          type="text" 
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="e.g. Chest & Triceps, Legs, Cardio..."
        />
      </div>

      <div className="flex gap-3 mt-8">
        <button 
          onClick={() => setStep(1)}
          className="px-4 py-4 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
        >
          Back
        </button>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
          Generate Plan
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          AI Trainer
        </h1>
        <p className="text-slate-400 mt-2">Custom workouts in seconds.</p>
      </div>
      
      {/* Progress Dots */}
      <div className="flex gap-2 mb-8 justify-center">
        <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-blue-500' : 'w-2 bg-slate-800'}`} />
        <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-blue-500' : 'w-2 bg-slate-800'}`} />
      </div>

      <div className="bg-slate-900/50 rounded-3xl p-1 border border-slate-800/50">
        {step === 1 ? renderStep1() : renderStep2()}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Designing Your Workout...</h3>
          <p className="text-slate-400 max-w-xs">Analyzing {focus} exercises for {difficulty} level with {equipment}.</p>
        </div>
      )}
    </div>
  );
};