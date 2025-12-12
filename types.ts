export enum Difficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced'
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // String to allow ranges like "8-12"
  rest: string; // e.g., "60s"
  instructions: string;
  muscleGroup: string;
  videoQuery?: string; // Search term for video finding
}

export interface SetLog {
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseLog {
  name: string;
  sets: SetLog[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  exercises: Exercise[];
  createdAt: number;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  date: number;
  durationSeconds: number;
  volume: number; // Total weight lifted estimate
  completedExercises: ExerciseLog[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
