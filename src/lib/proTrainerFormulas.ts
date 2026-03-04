import type {
  Factor,
  FactorLink,
  Scenario,
  Risk,
  StrategicResults,
  StrategicData,
} from "./proTrainerTypes";

export function calcKSZ(horizonMonths: number, errorCost: number, importance: number): number {
  return (horizonMonths * errorCost * importance) / 10;
}

export function calcStep1(factors: Factor[], links: FactorLink[]): Omit<Step1Data, "factors" | "links"> {
  const avgInfluence = factors.reduce((s, f) => s + f.influence, 0) / factors.length;
  const categories = new Set(factors.map((f) => f.category));
  const levelsUsed = categories.size;
  const linCount = links.length;
  const fCount = factors.length;
  const L = linCount < fCount ? 2 : 1;
  const isg = (levelsUsed * fCount * linCount) / L;
  return { avgInfluence: Math.round(avgInfluence * 100) / 100, levelsUsed, isg: Math.round(isg * 100) / 100 };
}

export function calcStep2(
  factors: Factor[],
  links: FactorLink[],
  pivotIds: string[]
): Omit<Step2Data, "pivotFactorIds"> {
  const pivotOutgoing = links.filter((l) => pivotIds.includes(l.from)).length;
  const suf = pivotOutgoing;
  const pivotFactors = factors.filter((f) => pivotIds.includes(f.id));
  const avgPivotInfluence = pivotFactors.reduce((s, f) => s + f.influence, 0) / (pivotFactors.length || 1);
  const blindSpots = factors
    .filter((f) => f.influence >= 4 && !pivotIds.includes(f.id))
    .map((f) => f.id);
  const sz = blindSpots.length;
  const kps = (suf * avgPivotInfluence) / (1 + sz);
  return { suf, blindSpots, kps: Math.round(kps * 100) / 100 };
}

export function calcStep3(scenarios: Scenario[]): Omit<Step3Data, "scenarios"> {
  const ev = scenarios.reduce((s, sc) => s + sc.revenue * (sc.probability / 100), 0);
  const opt = scenarios.find((s) => s.type === "optimistic");
  const neg = scenarios.find((s) => s.type === "negative");
  const spread = opt && neg ? Math.abs(opt.revenue - neg.revenue) : 0;
  const months = scenarios.map((s) => s.months);
  const uniqueMonths = new Set(months).size;
  const monthDifferences = uniqueMonths - 1;
  const ism = (spread * Math.max(monthDifferences, 1)) / 10;
  return {
    ev: Math.round(ev),
    spread: Math.round(spread),
    ism: Math.round(ism * 100) / 100,
  };
}

export function calcStep4(risks: Risk[]): Omit<Step4Data, "risks"> {
  const ir = risks.reduce((s, r) => s + r.probability * r.damage, 0);
  const iur = risks.reduce((s, r) => s + r.manageability, 0) / (risks.length || 1);
  return { ir: Math.round(ir * 100) / 100, iur: Math.round(iur * 100) / 100 };
}

export function applyStressTest(scenarios: Scenario[]): Scenario[] {
  return scenarios.map((s) => ({
    ...s,
    revenue: Math.round(s.revenue * 0.7),
    costs: Math.round(s.costs * 1.2),
    months: Math.round(s.months * 1.5),
    probability: Math.max(0, s.probability - 15),
  }));
}

export function calcIA(originalEv: number, stressedEv: number): number {
  if (originalEv === 0) return 0;
  return Math.round((stressedEv / originalEv) * 100) / 100;
}

export function calcIKG(revisedParams: number, totalParams: number): number {
  if (totalParams === 0) return 0;
  return Math.round((revisedParams / totalParams) * 100) / 100;
}

export function calcOSI(data: StrategicData): StrategicResults | null {
  if (!data.step1 || !data.step2 || !data.step3 || !data.step4 || !data.step5 || !data.step6)
    return null;

  const { isg } = data.step1;
  const { kps } = data.step2;
  const { ism } = data.step3;
  const { iur } = data.step4;
  const { ia } = data.step5;
  const { ikg } = data.step6;

  const skippedStress = !data.step5.revisedStrategy;
  const noRisks = !data.step4 || data.step4.risks.length < 3;
  const noChanges = data.step6.revisedParams === 0;
  const im = skippedStress && noChanges && noRisks ? 2 : 1;

  void ((isg * kps * ism * ia * ikg) / (1 + im));

  const normalizedISG = Math.min(isg / 100, 1);
  const normalizedKPS = Math.min(kps / 10, 1);
  const normalizedISM = Math.min(ism / 1000, 1);
  const normalizedIA = Math.min(ia, 1);
  const normalizedIKG = Math.min(ikg, 1);
  const normalizedIUR = Math.min(iur / 5, 1);

  const score = Math.round(
    ((normalizedISG + normalizedKPS + normalizedISM + normalizedIA + normalizedIKG + normalizedIUR) / 6) * 100
  );
  const clampedScore = Math.max(0, Math.min(100, score));

  let level = "Реактивное мышление";
  if (clampedScore >= 80) level = "Стратегический архитектор";
  else if (clampedScore >= 60) level = "Системное мышление";
  else if (clampedScore >= 40) level = "Ситуативное мышление";

  const indices = { isg: normalizedISG, kps: normalizedKPS, ism: normalizedISM, iur: normalizedIUR, ia: normalizedIA, ikg: normalizedIKG };
  const maxKey = Object.entries(indices).sort((a, b) => b[1] - a[1])[0][0];

  let profile = "Аналитик";
  if (maxKey === "isg") profile = "Архитектор системы";
  else if (maxKey === "kps") profile = "Аналитик";
  else if (maxKey === "ism") profile = "Тактик";
  else if (maxKey === "iur") profile = "Осторожный стратег";
  else if (maxKey === "ia") profile = "Риск-игрок";
  else if (maxKey === "ikg") profile = "Гибкий стратег";

  return {
    osi: clampedScore,
    profile,
    indices,
    level,
  };
}

export function getScoreGradient(score: number): string {
  if (score >= 80) return "from-emerald-500 to-emerald-700";
  if (score >= 60) return "from-blue-500 to-blue-700";
  if (score >= 40) return "from-amber-500 to-amber-700";
  return "from-red-500 to-red-700";
}