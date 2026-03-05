export type ArgumentType = "fact" | "assumption" | "opinion";

export interface Argument {
  id: string;
  text: string;
  side: "for" | "against";
  type: ArgumentType;
  strength: number;
  verifiability: number;
}

export interface LogicStep0Data {
  statement: string;
  isCustom: boolean;
  initialDecision: string;
  initialConfidence: number;
}

export interface LogicStep1Data {
  thesis: string;
  arguments: Argument[];
  ia: number;
  ba: number;
}

export interface CausalChain {
  id: string;
  factorA: string;
  consequenceB: string;
  resultC: string;
  probability: number;
  hasData: boolean;
  hasAlternative: boolean;
}

export interface LogicStep2Data {
  chains: CausalChain[];
  icl: number;
}

export interface AlternativeHypothesis {
  id: string;
  description: string;
  probability: number;
}

export interface LogicStep3Data {
  hypotheses: AlternativeHypothesis[];
  ial: number;
}

export interface LogicStep4Data {
  confirmedFacts: number;
  assumptions: number;
  unknowns: number;
  kf: number;
  inu: number;
}

export type LogicalFallacy =
  | "generalization"
  | "emotional"
  | "reverse_cause"
  | "black_white"
  | "ignore_alternatives"
  | "survivorship";

export const FALLACY_LABELS: Record<LogicalFallacy, string> = {
  generalization: "Обобщение",
  emotional: "Эмоциональный вывод",
  reverse_cause: "Подмена причины следствием",
  black_white: "Чёрно-белое мышление",
  ignore_alternatives: "Игнорирование альтернатив",
  survivorship: "Ошибка выжившего",
};

export interface LogicStep5Data {
  fallacies: LogicalFallacy[];
  iki: number;
}

export interface LogicStep6Data {
  revisedDecision: string;
  revisedConfidence: number;
  ilc: number;
}

export interface LogicData {
  step0: LogicStep0Data | null;
  step1: LogicStep1Data | null;
  step2: LogicStep2Data | null;
  step3: LogicStep3Data | null;
  step4: LogicStep4Data | null;
  step5: LogicStep5Data | null;
  step6: LogicStep6Data | null;
}

export interface LogicIndices {
  ia: number;
  ba: number;
  icl: number;
  ial: number;
  kf: number;
  inu: number;
  iki: number;
  ilc: number;
}

export type LogicLevel =
  | "Интуитивное мышление"
  | "Частичная логика"
  | "Аналитическое"
  | "Системное"
  | "Стратегический аналитик";

export interface LogicResults {
  ilmp: number;
  level: LogicLevel;
  indices: LogicIndices;
  warnings: string[];
}

export interface LogicSession {
  id: string;
  createdAt: string;
  completedAt?: string;
  currentStep: number;
  data: LogicData;
  results?: LogicResults;
}

export const ILMP_SCALE: { min: number; max: number; level: LogicLevel }[] = [
  { min: 0, max: 30, level: "Интуитивное мышление" },
  { min: 30, max: 50, level: "Частичная логика" },
  { min: 50, max: 70, level: "Аналитическое" },
  { min: 70, max: 85, level: "Системное" },
  { min: 85, max: 100, level: "Стратегический аналитик" },
];

export const EMPTY_LOGIC_DATA: LogicData = {
  step0: null,
  step1: null,
  step2: null,
  step3: null,
  step4: null,
  step5: null,
  step6: null,
};

export const EXAMPLE_CASES = [
  "Этот проект нужно запускать",
  "Сотрудника нужно уволить",
  "Инвестиция выгодна",
  "Нужно менять профессию",
  "Стоит переехать в другой город",
  "Нужно брать кредит на бизнес",
];
