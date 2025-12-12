import React, { useMemo, useState } from 'react';
import { WorkoutSession } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Flame, Trophy, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';

interface Props {
  history: WorkoutSession[];
}

export const Dashboard: React.FC<Props> = ({ history }) => {
  // Process data for Activity Volume Chart
  const chartData = useMemo(() => history.slice(-7).map((h, i) => ({
    name: `W${i + 1}`,
    duration: Math.round(h.durationSeconds / 60),
    volume: h.volume
  })), [history]);

  // Logic for Strength Chart
  const allExerciseNames = useMemo(() => {
    const names = new Set<string>();
    history.forEach(h => h.completedExercises.forEach(e => names.add(e.name)));
    return Array.from(names);
  }, [history]);

  const [selectedExercise, setSelectedExercise] = useState<string>(allExerciseNames[0] || '');
  
  // If no exercise selected yet but we have data, select first one
  if (!selectedExercise && allExerciseNames.length > 0) {
    setSelectedExercise(allExerciseNames[0]);
  }

  const strengthData = useMemo(() => {
    if (!selectedExercise) return [];
    return history
      .filter(h => h.completedExercises.some(e => e.name === selectedExercise))
      .map(h => {
        const ex = h.completedExercises.find(e => e.name === selectedExercise);
        // Find max weight lifted in any completed set
        const maxWeight = ex ? Math.max(...ex.sets.filter(s => s.completed).map(s => s.weight), 0) : 0;
        return {
          date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          weight: maxWeight
        };
      })
      .slice(-10); // Last 10 sessions for this exercise
  }, [history, selectedExercise]);

  const totalWorkouts = history.length;
  const totalMinutes = Math.round(history.reduce((acc, curr) => acc + curr.durationSeconds, 0) / 60);
  const streak = totalWorkouts > 0 ? Math.floor(Math.random() * 5) + 1 : 0; 

  return (
    <div className="p-6 pb-24 max-w-2xl mx-auto animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Hello, Athlete</h1>
          <p className="text-slate-400">Ready to crush it today?</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
          A
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm">
          <Flame className="text-orange-500" size={24} />
          <div className="text-center">
            <span className="block text-2xl font-bold text-white">{streak}</span>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Streak</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm">
          <Trophy className="text-yellow-500" size={24} />
          <div className="text-center">
            <span className="block text-2xl font-bold text-white">{totalWorkouts}</span>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Sessions</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm">
          <Calendar className="text-blue-500" size={24} />
          <div className="text-center">
            <span className="block text-2xl font-bold text-white">{totalMinutes}</span>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Mins</span>
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 relative overflow-hidden shadow-md">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div> 
           Activity Volume
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#60a5fa' }}
                cursor={{ stroke: '#334155', strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="duration" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDuration)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strength Progress Chart */}
      {allExerciseNames.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 relative overflow-hidden shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" />
              Max Lift
            </h3>
            <select 
              value={selectedExercise} 
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-slate-800 text-xs text-white p-2 rounded-lg border border-slate-700 outline-none max-w-[150px] focus:ring-1 focus:ring-green-500"
            >
              {allExerciseNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strengthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  width={30} 
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#4ade80' }}
                  cursor={{ stroke: '#334155', strokeWidth: 1 }}
                />
                <Line type="monotone" dataKey="weight" stroke="#4ade80" strokeWidth={3} dot={{r: 4, fill: '#0f172a', stroke: '#4ade80', strokeWidth: 2}} activeDot={{ r: 6, fill: '#4ade80' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <h3 className="text-lg font-bold text-white mb-4 px-2">Recent History</h3>
      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500">
            No workouts recorded yet. Start training!
          </div>
        ) : (
          history.slice().reverse().slice(0, 5).map((session) => (
            <div key={session.id} className="bg-slate-900 p-4 rounded-2xl flex justify-between items-center border border-slate-800 hover:bg-slate-800/80 transition-colors shadow-sm">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Workout Completed</h4>
                  <p className="text-xs text-slate-500">
                    {new Date(session.date).toLocaleDateString()} • {Math.round(session.volume)} kg Vol
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-bold text-blue-400 text-sm">Done</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};