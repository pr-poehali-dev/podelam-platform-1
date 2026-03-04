import type {
  FinancialData,
  FinancialResults,
  FinancialStep0Data,
  FinancialStep1Data,
  FinancialStep4Data,
  FinancialStep5Data,
  FinancialStep6Data,
  FinancialDecisionResult,
  FinancialStressTestResult,
  FinancialGoalProjection,
  FinancialLevel,
} from "./financialTrainerTypes";

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function calcCashFlow(di: number, fe: number, ve: number, dp: number): number {
  return di - (fe + ve + dp);
}

export function calcDebtLoadRatio(dp: number, di: number): number {
  if (di === 0) return 1;
  return dp / di;
}

export function calcFinancialCushion(s: number, fe: number, ve: number): number {
  if (fe + ve === 0) return s > 0 ? 12 : 0;
  return s / (fe + ve);
}

export function calcIncomeDiversification(si: number): number {
  return Math.min(si / 5, 1);
}

export function calcExpenseStructure(
  categories: FinancialStep1Data["categories"]
): { ksr: number; iir: number } {
  const totalExpenses =
    categories.basic +
    categories.development +
    categories.investments +
    categories.impulse +
    categories.other;
  const ksr =
    totalExpenses === 0
      ? 0
      : (categories.development + categories.investments) / totalExpenses;
  const iir = categories.impulse / (totalExpenses || 1);
  return { ksr, iir };
}

export function calcStabilityIndex(cf: number, kfp: number, kdn: number): number {
  const raw = cf * kfp * (1 - kdn);
  return cf < 0 ? raw * 0.5 : raw;
}

export function calcStressTest(
  step0: FinancialStep0Data
): FinancialStressTestResult & { isu: number } {
  const originalCF = calcCashFlow(
    step0.monthlyIncome,
    step0.fixedExpenses,
    step0.variableExpenses,
    step0.monthlyDebtPayments
  );
  const originalKFP = calcFinancialCushion(
    step0.savings,
    step0.fixedExpenses,
    step0.variableExpenses
  );
  const originalKDN = calcDebtLoadRatio(step0.monthlyDebtPayments, step0.monthlyIncome);
  const originalIU = calcStabilityIndex(originalCF, originalKFP, originalKDN);

  const stressedIncome = step0.monthlyIncome * 0.8;
  const stressedFE = step0.fixedExpenses * 1.15;
  const stressedVE = step0.variableExpenses * 1.15;
  const stressedDP = step0.monthlyDebtPayments * 1.1;

  const stressedCF = calcCashFlow(stressedIncome, stressedFE, stressedVE, stressedDP);
  const stressedKFP = calcFinancialCushion(step0.savings, stressedFE, stressedVE);
  const stressedKDN = calcDebtLoadRatio(stressedDP, stressedIncome);
  const stressedIU = calcStabilityIndex(stressedCF, stressedKFP, stressedKDN);

  const isu = originalIU === 0 ? 0 : stressedIU / originalIU;

  return { originalCF, stressedCF, originalIU, stressedIU, isu };
}

export function calcGoalProjection(
  cf: number,
  goalAmount: number,
  goalMonths: number,
  expectedReturn: number
): FinancialGoalProjection {
  const r = expectedReturn / 100 / 12;
  let pmt: number;
  if (r === 0) {
    pmt = goalMonths === 0 ? goalAmount : goalAmount / goalMonths;
  } else {
    pmt = goalAmount / ((Math.pow(1 + r, goalMonths) - 1) / r);
  }
  const kdg = pmt === 0 ? 999 : cf / pmt;
  const monthsToGoal = cf > 0 ? Math.ceil(goalAmount / cf) : 999;
  return { pmt, kdg, monthsToGoal };
}

export function calcDecisionResult(
  original: { cf: number; iu: number; kdg: number },
  modified: { cf: number; iu: number; kdg: number },
  riskLevel: number
): { deltaCF: number; deltaIU: number; deltaKDG: number; ikr: number } {
  const deltaCF = modified.cf - original.cf;
  const deltaIU = modified.iu - original.iu;
  const deltaKDG = modified.kdg - original.kdg;
  const ikr = (deltaIU + deltaKDG) / Math.max(riskLevel, 1);
  return { deltaCF, deltaIU, deltaKDG, ikr };
}

export function calcDisciplineIndex(step6: FinancialStep6Data): number {
  const trackingScore = step6.hasExpenseTracking ? 5 : 1;
  const controlScore = clamp(6 - step6.budgetExceedFreq, 1, 5);
  const planScore = !step6.makesImpulsiveDecisions ? 5 : 1;
  const reserveScore = step6.hasBackupPlan ? 5 : 1;
  return (trackingScore + controlScore + planScore + reserveScore) / 20;
}

export function calcIFMP(data: FinancialData): FinancialResults | null {
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

  const step0 = data.step0;
  const step1 = data.step1;
  const step4 = data.step4 as FinancialStep4Data;
  const step5 = data.step5 as FinancialStep5Data;
  const step6 = data.step6;

  const cf = calcCashFlow(
    step0.monthlyIncome,
    step0.fixedExpenses,
    step0.variableExpenses,
    step0.monthlyDebtPayments
  );
  const kdn = calcDebtLoadRatio(step0.monthlyDebtPayments, step0.monthlyIncome);
  const kfp = calcFinancialCushion(step0.savings, step0.fixedExpenses, step0.variableExpenses);
  const kdi = calcIncomeDiversification(step0.incomeSources);

  const { ksr, iir } = calcExpenseStructure(step1.categories);

  const iu = calcStabilityIndex(cf, kfp, kdn);

  const stressResult = calcStressTest(step0);
  const isu = stressResult.isu;

  const goalProjection = calcGoalProjection(
    cf,
    step0.goalAmount,
    step0.goalMonths,
    step4.expectedReturn
  );
  const kdg = goalProjection.kdg;

  const decisions: FinancialDecisionResult[] = step5.scenarios.map((scenario) => {
    const modifiedCF = calcCashFlow(
      scenario.newIncome,
      scenario.newFixedExpenses,
      scenario.newVariableExpenses,
      scenario.newDebtPayments
    );
    const modifiedKDN = calcDebtLoadRatio(scenario.newDebtPayments, scenario.newIncome);
    const modifiedIU = calcStabilityIndex(modifiedCF, kfp, modifiedKDN);
    const modifiedGoal = calcGoalProjection(
      modifiedCF,
      step0.goalAmount,
      step0.goalMonths,
      step4.expectedReturn
    );
    const result = calcDecisionResult(
      { cf, iu, kdg },
      { cf: modifiedCF, iu: modifiedIU, kdg: modifiedGoal.kdg },
      scenario.riskLevel
    );
    return { type: scenario.type, ...result };
  });

  const ifd = calcDisciplineIndex(step6);

  const referenceIU = step0.monthlyIncome * 3;
  const iuNorm = clamp(referenceIU === 0 ? 0 : iu / referenceIU, 0, 1);
  const isuNorm = clamp(isu, 0, 1);
  const kdgNorm = clamp(kdg / 2, 0, 1);

  const rawIFMP =
    ((iuNorm * 0.25 + isuNorm * 0.2 + kdgNorm * 0.2 + ifd * 0.2 + kdi * 0.15) /
      (1 + iir)) *
    100;
  const ifmp = clamp(Math.round(rawIFMP * 100) / 100, 0, 100);

  let level: FinancialLevel;
  if (ifmp >= 85) {
    level = "Финансовая зрелость";
  } else if (ifmp >= 70) {
    level = "Системность";
  } else if (ifmp >= 50) {
    level = "Управляемость";
  } else if (ifmp >= 30) {
    level = "Нестабильность";
  } else {
    level = "Финансовая хаотичность";
  }

  const stressTest: FinancialStressTestResult = {
    originalCF: stressResult.originalCF,
    stressedCF: stressResult.stressedCF,
    originalIU: stressResult.originalIU,
    stressedIU: stressResult.stressedIU,
  };

  return {
    ifmp,
    level,
    indices: { iu, isu, kdg, ifd, kdi, iir, kdn, kfp, ksr, cf },
    decisions,
    stressTest,
    goalProjection,
  };
}
