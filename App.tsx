import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { WorkoutGenerator } from './components/WorkoutGenerator';
import { ActiveWorkout } from './components/ActiveWorkout';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { AICoach } from './components/AICoach';
import { WorkoutPlan, WorkoutSession } from './types';

// Mock initial data so the app isn't empty on first load (demo purposes)
const DEMO_PLANS: WorkoutPlan[] = [
  {
    id: 'beginner-wl-1',
    title: 'Beginner Weight Loss: Full Body A',
    description: 'High-energy full body circuit using dumbbells and bands to burn calories and build foundation.',
    estimatedDuration: '35 mins',
    createdAt: Date.now(),
    exercises: [
      { 
        name: 'Dumbbell Goblet Squats', 
        sets: 3, 
        reps: '12-15', 
        rest: '45s', 
        instructions: 'Hold dumbbell at chest level. Squat down keeping chest up and back straight. Push through heels.', 
        muscleGroup: 'Legs',
        videoQuery: 'Dumbbell Goblet Squat Form'
      },
      { 
        name: 'Resistance Band Rows', 
        sets: 3, 
        reps: '15', 
        rest: '45s', 
        instructions: 'Wrap band around anchor. Pull elbows back squeezing shoulder blades. Keep core tight.', 
        muscleGroup: 'Back',
        videoQuery: 'Resistance Band Standing Row Form' 
      },
      { 
        name: 'Dumbbell Floor Press', 
        sets: 3, 
        reps: '12', 
        rest: '45s', 
        instructions: 'Lie on floor. Press dumbbells up until arms are extended. Lower slowly.', 
        muscleGroup: 'Chest',
        videoQuery: 'Dumbbell Floor Press Form'
      },
      { 
        name: 'Dumbbell Lunges', 
        sets: 3, 
        reps: '10/leg', 
        rest: '60s', 
        instructions: 'Step forward dropping hips until both knees are 90 degrees. Push back to start.', 
        muscleGroup: 'Legs',
        videoQuery: 'Dumbbell Lunge Form' 
      },
      { 
        name: 'Plank', 
        sets: 3, 
        reps: '30-45s', 
        rest: '30s', 
        instructions: 'Maintain straight line from head to heels on forearms. Tighten abs.', 
        muscleGroup: 'Core',
        videoQuery: 'Perfect Plank Form'
      }
    ]
  },
  {
    id: 'demo-1',
    title: 'Full Body Blast (Demo)',
    description: 'A classic beginner routine to hit all major muscle groups.',
    estimatedDuration: '45 mins',
    createdAt: Date.now() - 10000,
    exercises: [
      { name: 'Push-Ups', sets: 3, reps: 'Failure', rest: '60s', instructions: 'Keep core tight, chest to floor.', muscleGroup: 'Chest' },
      { name: 'Dumbbell Rows', sets: 3, reps: '10/side', rest: '60s', instructions: 'Flat back, pull to hip.', muscleGroup: 'Back' },
    ]
  }
];

export default function App() {
  const [plans, setPlans] = useState<WorkoutPlan[]>(DEMO_PLANS);
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);

  // Load from local storage on mount (optional enhancement for persistence)
  useEffect(() => {
    const savedPlans = localStorage.getItem('ironai_plans');
    const savedHistory = localStorage.getItem('ironai_history');
    if (savedPlans) setPlans(JSON.parse(savedPlans));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem('ironai_plans', JSON.stringify(plans));
    localStorage.setItem('ironai_history', JSON.stringify(history));
  }, [plans, history]);

  const handlePlanCreated = (newPlan: WorkoutPlan) => {
    setPlans(prev => [newPlan, ...prev]);
  };

  const handleDeletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveSession = (session: WorkoutSession) => {
    setHistory(prev => [...prev, session]);
    setActivePlan(null); // Clear active plan
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
        <div className="max-w-md mx-auto min-h-screen relative bg-slate-950 shadow-2xl overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard history={history} />} />
            <Route path="/generate" element={<WorkoutGenerator onPlanCreated={handlePlanCreated} />} />
            <Route 
              path="/active" 
              element={
                <ActiveWorkout 
                  plan={activePlan} 
                  onSaveSession={handleSaveSession} 
                />
              } 
            />
            <Route 
              path="/library" 
              element={
                <ExerciseLibrary 
                  plans={plans} 
                  onSelectPlan={setActivePlan} 
                  onDeletePlan={handleDeletePlan}
                />
              } 
            />
            <Route path="/coach" element={<AICoach />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Navigation />
        </div>
      </div>
    </HashRouter>
  );
}
