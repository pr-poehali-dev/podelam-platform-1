export interface FinancialStep0Data {
  monthlyIncome: number;
  fixedExpenses: number;
  variableExpenses: number;
  totalDebt: number;
  monthlyDebtPayments: number;
  savings: number;
  investments: number;
  incomeSources: number;
  goalAmount: number;
  goalMonths: number;
  cashFlow: number;
  debtLoadRatio: number;
  financialCushionRatio: number;
  incomeDiversification: number;
}

export interface ExpenseCategories {
  basic: number;
  development: number;
  investments: number;
  impulse: number;
  other: number;
}

export interface FinancialStep1Data {
  categories: ExpenseCategories;
  expenseStructureRatio: number;
  impulseExpenseIndex: number;
}

export interface FinancialStep2Data {
  stabilityIndex: number;
}

export interface FinancialStep3Data {
  stressedCashFlow: number;
  stressedStabilityIndex: number;
  stressResilienceIndex: number;
}

export interface FinancialStep4Data {
  expectedReturn: number;
  requiredMonthlyPayment: number;
  goalAchievabilityRatio: number;
}

export type FinancialDecisionType =
  | "increase_income"
  | "reduce_expenses"
  | "restructure_debt";

export interface FinancialScenario {
  type: FinancialDecisionType;
  description: string;
  newIncome: number;
  newFixedExpenses: number;
  newVariableExpenses: number;
  newDebtPayments: number;
  riskLevel: number;
}

export interface FinancialDecisionResult {
  type: FinancialDecisionType;
  deltaCF: number;
  deltaIU: number;
  deltaKDG: number;
  ikr: number;
}

export interface FinancialStep5Data {
  scenarios: FinancialScenario[];
  results: FinancialDecisionResult[];
}

export interface FinancialStep6Data {
  budgetExceedFreq: number;
  hasExpenseTracking: boolean;
  makesImpulsiveDecisions: boolean;
  hasBackupPlan: boolean;
  financialDisciplineIndex: number;
}

export interface FinancialData {
  step0: FinancialStep0Data | null;
  step1: FinancialStep1Data | null;
  step2: FinancialStep2Data | null;
  step3: FinancialStep3Data | null;
  step4: FinancialStep4Data | null;
  step5: FinancialStep5Data | null;
  step6: FinancialStep6Data | null;
}

export interface FinancialStressTestResult {
  originalCF: number;
  stressedCF: number;
  originalIU: number;
  stressedIU: number;
}

export interface FinancialGoalProjection {
  pmt: number;
  kdg: number;
  monthsToGoal: number;
}

export interface FinancialIndices {
  iu: number;
  isu: number;
  kdg: number;
  ifd: number;
  kdi: number;
  iir: number;
  kdn: number;
  kfp: number;
  ksr: number;
  cf: number;
}

export type FinancialLevel =
  | "Финансовая хаотичность"
  | "Нестабильность"
  | "Управляемость"
  | "Системность"
  | "Финансовая зрелость";

export interface FinancialResults {
  ifmp: number;
  level: FinancialLevel;
  indices: FinancialIndices;
  decisions: FinancialDecisionResult[];
  stressTest: FinancialStressTestResult;
  goalProjection: FinancialGoalProjection;
}

export interface FinancialSession {
  id: string;
  createdAt: string;
  completedAt?: string;
  currentStep: number;
  data: FinancialData;
  results?: FinancialResults;
}

export const IFMP_SCALE: { min: number; max: number; level: FinancialLevel }[] = [
  { min: 0, max: 30, level: "Финансовая хаотичность" },
  { min: 30, max: 50, level: "Нестабильность" },
  { min: 50, max: 70, level: "Управляемость" },
  { min: 70, max: 85, level: "Системность" },
  { min: 85, max: 100, level: "Финансовая зрелость" },
];

export const EMPTY_FINANCIAL_DATA: FinancialData = {
  step0: null,
  step1: null,
  step2: null,
  step3: null,
  step4: null,
  step5: null,
  step6: null,
};
