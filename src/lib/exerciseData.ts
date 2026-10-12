import { Exercise, ExerciseKind } from "@/types/exercise.types";
import sampleExercisesRaw from "@/data/exercises/sampleA1Exercises.json";

export const SAMPLE_A1_EXERCISES: Exercise[] = sampleExercisesRaw as Exercise[];

export function getExerciseById(id: string): Exercise | undefined {
  return SAMPLE_A1_EXERCISES.find((ex) => ex.id === id);
}

export function getExercisesByType(type: ExerciseKind): Exercise[] {
  return SAMPLE_A1_EXERCISES.filter((ex) => ex.type === type);
}

export function getExercisesForLevel(level: string): Exercise[] {
  return SAMPLE_A1_EXERCISES.filter((ex) => ex.level.toLowerCase() === level.toLowerCase());
}
