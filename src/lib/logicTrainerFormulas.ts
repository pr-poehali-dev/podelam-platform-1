import type {
  LogicData,
  LogicResults,
  LogicLevel,
  LogicStep1Data,
  LogicStep2Data,
  LogicStep3Data,
  LogicStep4Data,
  LogicStep5Data,
  LogicStep6Data,
  LogicStep0Data,
} from "./logicTrainerTypes";

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function calcIA(step1: LogicStep1Data): number {
  if (step1.arguments.length === 0) return 0;
  const sum = step1.arguments.reduce(
    (acc, a) => acc + a.strength * a.verifiability,
    0
  );
  return sum / step1.arguments.length;
}

export function calcBA(step1: LogicStep1Data): number {
  const forArgs = step1.arguments.filter((a) => a.side === "for").length;
  const againstArgs = step1.arguments.filter((a) => a.side === "against").length;
  if (forArgs === 0) return 1;
  return againstArgs / forArgs;
}

export function calcICL(step2: LogicStep2Data): number {
  if (step2.chains.length === 0) return 0;
  const sum = step2.chains.reduce(
    (acc, c) => acc + c.probability * (c.hasData ? 1 : 0),
    0
  );
  let icl = sum / step2.chains.length;

  const allLinear = step2.chains.every((c) => !c.hasAlternative);
  if (allLinear) {
    icl *= 0.8;
  }

  return icl;
}

export function calcIAL(step3: LogicStep3Data): number {
  if (step3.hypotheses.length === 0) return 0;

  const totalProb = step3.hypotheses.reduce((s, h) => s + h.probability, 0);
  const normalized = step3.hypotheses.map((h) => ({
    ...h,
    probability: totalProb > 0 ? (h.probability / totalProb) * 100 : 0,
  }));

  const avgProb =
    normalized.reduce((s, h) => s + h.probability, 0) / normalized.length;
  return (normalized.length * avgProb) / 100;
}

export function calcKF(step4: LogicStep4Data): number {
  const total =
    step4.confirmedFacts + step4.assumptions + step4.unknowns;
  if (total === 0) return 0;
  return step4.confirmedFacts / total;
}

export function calcINU(step4: LogicStep4Data): number {
  const total =
    step4.confirmedFacts + step4.assumptions + step4.unknowns;
  if (total === 0) return 0;
  return step4.unknowns / total;
}

export function calcIKI(step5: LogicStep5Data): number {
  return step5.fallacies.length / 6;
}

export function calcILC(
  step0: LogicStep0Data,
  step6: LogicStep6Data
): number {
  return Math.abs(step6.revisedConfidence - step0.initialConfidence) / 100;
}

export function calcILMP(data: LogicData): LogicResults | null {
  if (
    !data.step0 ||
    !data.step1 ||
    !data.step2 ||
    !data.step3 ||
    !data.step4 ||
    !data.step5 ||
    !data.step6
  ) {
    return null;
  }

  const ia = calcIA(data.step1);
  const ba = calcBA(data.step1);
  const icl = calcICL(data.step2);
  const ial = calcIAL(data.step3);
  const kf = calcKF(data.step4);
  const inu = calcINU(data.step4);
  const iki = calcIKI(data.step5);
  const ilc = calcILC(data.step0, data.step6);

  const iaNorm = clamp(ia / 25, 0, 1);
  const iclNorm = clamp(icl / 5, 0, 1);
  const ialNorm = clamp(ial / 3, 0, 1);
  const kfNorm = clamp(kf, 0, 1);
  const ilcNorm = clamp(ilc, 0, 1);
  const ikiPenalty = 1 - iki;
  const inuPenalty = 1 + inu;

  const raw =
    (iaNorm * iclNorm * ialNorm * kfNorm * ikiPenalty * ilcNorm) / inuPenalty;

  const ilmp = clamp(Math.round(raw * 100), 0, 100);

  const warnings: string[] = [];
  if (ba < 0.3)
    warnings.push("Перекос подтверждения — слишком мало аргументов «против»");
  if (ba > 0.8) warnings.push("Гиперкритичность — слишком много контраргументов");
  if (data.step3.hypotheses.length < 3)
    warnings.push("Недостаток альтернатив — менее 3 гипотез");
  if (kf < 0.3) warnings.push("Низкая фактичность — мало подтверждённых фактов");
  if (iki > 0.5)
    warnings.push("Эмоциональное давление — много когнитивных искажений");
  if (ilc === 0)
    warnings.push("Логическая ригидность — уверенность не изменилась");

  let level: LogicLevel;
  if (ilmp < 30) level = "Интуитивное мышление";
  else if (ilmp < 50) level = "Частичная логика";
  else if (ilmp < 70) level = "Аналитическое";
  else if (ilmp < 85) level = "Системное";
  else level = "Стратегический аналитик";

  return {
    ilmp,
    level,
    indices: { ia, ba, icl, ial, kf, inu, iki, ilc },
    warnings,
  };
}
