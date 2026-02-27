export type StepType = "intro" | "single-choice" | "multiple-choice" | "scale" | "text-input" | "info" | "result";

export interface ScenarioStep {
  id: string;
  type: StepType;
  title: string;
  description?: string;
  options?: StepOption[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  placeholder?: string;
  nextStep?: string; // default next step ID
  resultTemplate?: string; // for result steps - template key
  scoreCategory?: string; // which category this step scores into
}

export interface StepOption {
  id: string;
  label: string;
  score?: number;
  scoreCategory?: string;
  nextStep?: string; // for branching - override default next
  tags?: string[];
}

export interface TrainerScenario {
  id: string;
  steps: ScenarioStep[];
  resultCalculator: string; // key to result calculation function
}

export interface TrainerDef {
  id: TrainerId;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  iconColor: string;
  bgGradient: string;
  accessPlans: AccessPlan[];
  stepsCount: number;
  estimatedMinutes: number;
  tags: string[];
}

export type TrainerId =
  | "conscious-choice"
  | "emotions-in-action"
  | "anti-procrastination"
  | "self-esteem"
  | "money-anxiety";

export interface AccessPlan {
  duration: "1month" | "3months" | "1year";
  label: string;
  price: number;
  features: string[];
}

export interface TrainerSession {
  id: string;
  trainerId: TrainerId;
  startedAt: string;
  completedAt?: string;
  currentStepIndex: number;
  answers: Record<string, SessionAnswer>;
  scores: Record<string, number>;
  result?: TrainerResult;
}

export interface SessionAnswer {
  stepId: string;
  type: StepType;
  value: string | string[] | number;
  timestamp: string;
}

export interface TrainerResult {
  title: string;
  summary: string;
  scores: Record<string, number>;
  recommendations: string[];
  insights: string[];
  level?: string;
  nextActions?: string[];
}

export interface TrainerStats {
  trainerId: TrainerId;
  totalSessions: number;
  completedSessions: number;
  lastSessionDate?: string;
  averageScores: Record<string, number>;
  trend: "up" | "down" | "stable";
}
