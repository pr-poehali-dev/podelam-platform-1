export type ProTrainerId = "strategic-thinking";

export interface ProTrainerDef {
  id: ProTrainerId;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  iconColor: string;
  bgGradient: string;
  pricing: ProTrainerPricing[];
}

export interface ProTrainerPricing {
  id: string;
  name: string;
  price: number;
  period: string;
  durationDays: number;
  features: string[];
  unlimited: boolean;
}

export const PRO_TRAINERS: ProTrainerDef[] = [
  {
    id: "strategic-thinking",
    icon: "Brain",
    title: "Стратегическое мышление PRO",
    subtitle: "Симулятор стратегических решений",
    description: "Пошаговый инструмент стратегического моделирования. Системный анализ, сценарное моделирование, стресс-тесты. Без ИИ — чистая математика.",
    color: "bg-slate-50",
    iconColor: "text-slate-700",
    bgGradient: "from-slate-800 to-slate-950",
    pricing: [
      {
        id: "single",
        name: "Разовый доступ",
        price: 1490,
        period: "30 дней",
        durationDays: 30,
        features: ["1 стратегическая сессия", "Полный отчёт", "PDF-экспорт"],
        unlimited: false,
      },
      {
        id: "pro",
        name: "PRO-доступ",
        price: 2990,
        period: "мес",
        durationDays: 30,
        features: ["Неограниченные сессии", "История решений", "Сравнение стратегий", "PDF-экспорт"],
        unlimited: true,
      },
    ],
  },
];

export function getProTrainerDef(id: ProTrainerId): ProTrainerDef | undefined {
  return PRO_TRAINERS.find((t) => t.id === id);
}

export interface StrategicSession {
  id: string;
  createdAt: string;
  completedAt?: string;
  currentStep: number;
  data: StrategicData;
  results?: StrategicResults;
}

export interface StrategicData {
  step0: Step0Data | null;
  step1: Step1Data | null;
  step2: Step2Data | null;
  step3: Step3Data | null;
  step4: Step4Data | null;
  step5: Step5Data | null;
  step6: Step6Data | null;
}

export interface Step0Data {
  name: string;
  goal: string;
  horizonMonths: number;
  errorCost: number;
  budget: number;
  resources: number;
  importance: number;
  ksz: number;
}

export interface Factor {
  id: string;
  name: string;
  category: "micro" | "meso" | "macro" | "hidden";
  influence: number;
  controllability: number;
  changeProb: number;
}

export interface FactorLink {
  from: string;
  to: string;
}

export interface Step1Data {
  factors: Factor[];
  links: FactorLink[];
  avgInfluence: number;
  levelsUsed: number;
  isg: number;
}

export interface Step2Data {
  pivotFactorIds: string[];
  suf: number;
  blindSpots: string[];
  kps: number;
}

export interface Scenario {
  type: "optimistic" | "realistic" | "negative";
  revenue: number;
  costs: number;
  months: number;
  probability: number;
}

export interface Step3Data {
  scenarios: Scenario[];
  ev: number;
  spread: number;
  ism: number;
}

export interface Risk {
  id: string;
  name: string;
  probability: number;
  damage: number;
  manageability: number;
}

export interface Step4Data {
  risks: Risk[];
  ir: number;
  iur: number;
}

export interface Step5Data {
  originalEv: number;
  stressedEv: number;
  ia: number;
  revisedStrategy: boolean;
  reactionTimeSec?: number;
}

export interface Step6Data {
  readyToChange: boolean;
  wrongAssumptions: string[];
  underestimatedFactors: string[];
  ikg: number;
  revisedParams: number;
  totalParams: number;
}

export interface StrategicResults {
  osi: number;
  profile: string;
  indices: {
    isg: number;
    kps: number;
    ism: number;
    iur: number;
    ia: number;
    ikg: number;
  };
  level: string;
}

export const EMPTY_STRATEGIC_DATA: StrategicData = {
  step0: null,
  step1: null,
  step2: null,
  step3: null,
  step4: null,
  step5: null,
  step6: null,
};
