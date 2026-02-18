export interface WorkoutExercise {
  exerciseId?: number;
  name: string;
  sets: number;
  reps: number;
  duration: number | null;
  rest_seconds: number;
  rpe: number;
  description: string;
}

export interface RecommendResponseData {
  recommendationId: number;
  targetFitnessType: string;
  totalDuration: number;
  rpe: number;
  focus: string;
  warm_up: string;
  cool_down: string;
  exercises: WorkoutExercise[];
  notes: string;
  createdAt: string;
}
