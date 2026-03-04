import type { StrategicData, StrategicResults } from "./proTrainerTypes";

export interface IndexInterpretation {
  key: string;
  name: string;
  fullName: string;
  value: number;
  percent: number;
  zone: "low" | "mid" | "high";
  zoneLabel: string;
  zoneColor: string;
  description: string;
  meaning: string;
  recommendation: string;
}

export interface LevelInterpretation {
  level: string;
  description: string;
  strengths: string[];
  growthAreas: string[];
}

export interface ProfileInterpretation {
  profile: string;
  description: string;
  traits: string[];
  blindSpot: string;
}

export interface ScenarioInterpretation {
  ev: number;
  spread: number;
  stressResistance: number;
  verdict: string;
  details: string;
}

export interface RiskInterpretation {
  totalRisks: number;
  avgManageability: number;
  highRisks: string[];
  verdict: string;
  details: string;
}

export interface FactorInterpretation {
  totalFactors: number;
  categoriesUsed: number;
  pivotCount: number;
  blindSpotCount: number;
  verdict: string;
  details: string;
}

export interface FullInterpretation {
  osi: number;
  level: LevelInterpretation;
  profile: ProfileInterpretation;
  indices: IndexInterpretation[];
  scenarios: ScenarioInterpretation | null;
  risks: RiskInterpretation | null;
  factors: FactorInterpretation | null;
  summary: string;
  topStrength: string;
  topWeakness: string;
}

function indexZone(pct: number): { zone: "low" | "mid" | "high"; zoneLabel: string; zoneColor: string } {
  if (pct >= 70) return { zone: "high", zoneLabel: "Сильная сторона", zoneColor: "text-emerald-600" };
  if (pct >= 40) return { zone: "mid", zoneLabel: "Средний уровень", zoneColor: "text-amber-600" };
  return { zone: "low", zoneLabel: "Зона роста", zoneColor: "text-red-500" };
}

const INDEX_META: Record<string, { name: string; fullName: string; descHigh: string; descMid: string; descLow: string; meaning: string; recLow: string; recMid: string }> = {
  isg: {
    name: "Системность",
    fullName: "Индекс системного графа (ИСГ)",
    meaning: "Показывает, насколько полно вы видите систему факторов, влияющих на решение. Учитывает количество факторов, связей между ними и охват уровней (микро, мезо, макро, скрытые).",
    descHigh: "Вы строите полную карту влияний. Видите связи между факторами на разных уровнях — от внутренних процессов до внешних трендов. Это позволяет принимать решения с учётом всей картины.",
    descMid: "Вы учитываете основные факторы, но часть связей и уровней может оставаться за кадром. Решения работают, но могут не учитывать неочевидные зависимости.",
    descLow: "Анализ ограничен узким набором факторов. Вы рискуете принять решение, не увидев важные влияния. Это типичная ловушка — фокус на очевидном.",
    recLow: "Добавьте факторы с уровней, которые вы не рассматривали. Попробуйте найти хотя бы 2 скрытых фактора, которые могут проявиться через 6–12 месяцев.",
    recMid: "Проверьте, нет ли пробелов в связях. Каждый фактор должен быть связан хотя бы с одним другим — изолированный фактор часто означает недосмотр.",
  },
  kps: {
    name: "Структура",
    fullName: "Коэффициент приоритетной структуры (КПС)",
    meaning: "Оценивает точность выделения ключевых факторов. Узловые факторы — это те, через которые проходит максимум влияния. Также учитывает наличие слепых зон.",
    descHigh: "Вы точно определяете точки максимального рычага. Ваши приоритеты выстроены правильно — усилия направлены туда, где они дают наибольший эффект.",
    descMid: "Ключевые факторы определены, но есть слепые зоны — влиятельные факторы, которые вы не отнесли к приоритетным. Это может привести к сюрпризам.",
    descLow: "Приоритеты расставлены неточно. Вероятно, вы фокусируетесь на факторах с низким влиянием, упуская те, которые реально определяют результат.",
    recLow: "Пересмотрите выбор узловых факторов. Ориентируйтесь на количество исходящих связей и уровень влияния, а не на «привычность» фактора.",
    recMid: "Обратите внимание на факторы в слепой зоне (высокое влияние, но не в приоритетах). Даже один такой фактор может перевернуть стратегию.",
  },
  ism: {
    name: "Сценарность",
    fullName: "Индекс сценарного моделирования (ИСМ)",
    meaning: "Измеряет качество проработки сценариев. Учитывает разброс между оптимистичным и негативным исходом, а также разнообразие временных горизонтов.",
    descHigh: "Сценарии хорошо проработаны — вы видите разные варианты развития и готовы к каждому из них. Высокий разброс означает, что вы не прячете риски за «средними» цифрами.",
    descMid: "Базовые сценарии есть, но они могут быть слишком похожи друг на друга. Если разница между «хорошо» и «плохо» невелика — вы, возможно, недооцениваете неопределённость.",
    descLow: "Сценарии однотипны или слишком оптимистичны. Без проработки негативного варианта вы не готовы к неблагоприятному развитию событий.",
    recLow: "Создайте по-настоящему негативный сценарий. Что будет, если всё пойдёт не так? Какие потери? За какой срок? Это не пессимизм — это подготовка.",
    recMid: "Увеличьте разброс временных горизонтов между сценариями. Реальность редко укладывается в одинаковые сроки для всех вариантов.",
  },
  iur: {
    name: "Управление рисками",
    fullName: "Индекс управляемости рисков (ИУР)",
    meaning: "Показывает, насколько выявленные риски поддаются управлению. Высокий индекс означает, что вы нашли способы влиять на риски, а не просто их перечислили.",
    descHigh: "Риски не только выявлены, но и управляемы. Вы знаете, как снизить вероятность или ущерб от каждого из них. Это признак зрелого стратегического подхода.",
    descMid: "Часть рисков управляема, но некоторые остаются «неприкасаемыми». Стоит разделить их на те, где можно действовать, и те, к которым нужен план Б.",
    descLow: "Большинство рисков воспринимаются как неуправляемые. Это может означать либо недостаток инструментов, либо фаталистический подход к рискам.",
    recLow: "Для каждого риска определите хотя бы одно конкретное действие, снижающее его вероятность или ущерб. Даже частичное управление лучше, чем ничего.",
    recMid: "Сфокусируйтесь на рисках с высокой вероятностью и ущербом. Разработайте для них конкретные триггеры — при каком сигнале запускается план действий.",
  },
  ia: {
    name: "Адаптивность",
    fullName: "Индекс адаптивности (ИА)",
    meaning: "Отношение ожидаемой ценности после стресс-теста к исходной. Показывает, насколько стратегия устойчива к внешним шокам (падение доходов на 30%, рост расходов на 20%).",
    descHigh: "Стратегия устойчива к стрессу. Даже при ухудшении условий она сохраняет значительную часть ценности. Вы не строите планы на идеальную погоду.",
    descMid: "Стратегия частично устойчива. Стресс-тест показал заметное снижение, но не катастрофу. Есть пространство для повышения устойчивости.",
    descLow: "Стратегия хрупкая. При неблагоприятных условиях она теряет большую часть ценности. Нужна подушка безопасности или альтернативный план.",
    recLow: "Пересмотрите структуру доходов и расходов. Снижайте зависимость от одного источника. Заложите буфер в 20–30% на непредвиденные расходы.",
    recMid: "Определите, какой именно компонент «ломается» при стрессе. Часто это один конкретный риск — его и нужно закрыть первым.",
  },
  ikg: {
    name: "Когнитивная гибкость",
    fullName: "Индекс когнитивной гибкости (ИКГ)",
    meaning: "Готовность менять начальные предположения после получения новых данных. Показывает, пересмотрели ли вы свои параметры после стресс-теста и анализа рисков.",
    descHigh: "Вы готовы менять решения при изменении данных. Это ключевое качество стратега — не цепляться за первоначальный план, а адаптироваться.",
    descMid: "Вы частично пересмотрели параметры. Некоторые предположения остались нетронутыми — стоит проверить, не по инерции ли.",
    descLow: "Начальные параметры не пересмотрены. Это может означать либо чрезмерную уверенность, либо сопротивление изменениям. И то, и другое опасно для стратегии.",
    recLow: "После стресс-теста вернитесь к начальным параметрам и измените хотя бы 2–3 из них. Если данные изменились, а план — нет, это тревожный знак.",
    recMid: "Проверьте, какие параметры вы оставили без изменений. Спросите себя: «Я оставил это, потому что уверен, или потому что не хочу менять?»",
  },
};

const LEVEL_DATA: Record<string, Omit<LevelInterpretation, "level">> = {
  "Реактивное мышление": {
    description: "Решения принимаются преимущественно реактивно — в ответ на текущие события. Системный анализ и долгосрочное планирование пока не стали привычкой. Это нормальная стартовая точка.",
    strengths: ["Быстрая реакция на изменения", "Практичность в краткосрочных решениях"],
    growthAreas: ["Системный анализ перед принятием решений", "Сценарное моделирование", "Работа с рисками до их наступления"],
  },
  "Ситуативное мышление": {
    description: "Вы начинаете учитывать контекст и различные факторы, но анализ пока фрагментарный. Часть аспектов прорабатывается хорошо, часть — остаётся без внимания.",
    strengths: ["Учёт контекста при принятии решений", "Базовое понимание рисков", "Способность видеть несколько вариантов"],
    growthAreas: ["Полнота системного анализа", "Проработка негативных сценариев", "Готовность менять план при новых данных"],
  },
  "Системное мышление": {
    description: "Вы видите целостную картину и умеете работать с факторами на разных уровнях. Решения обоснованы, риски просчитаны. Следующий шаг — повышение гибкости и стрессоустойчивости стратегий.",
    strengths: ["Целостный анализ ситуации", "Качественное сценарное моделирование", "Работа с приоритетами и рисками"],
    growthAreas: ["Повышение адаптивности стратегий", "Работа с когнитивными искажениями", "Стресс-тестирование предположений"],
  },
  "Стратегический архитектор": {
    description: "Максимальный уровень. Вы строите стратегии как архитектор — с учётом всех факторов, рисков, сценариев. При этом сохраняете гибкость и готовность к пересмотру. Это редкий навык.",
    strengths: ["Полная системная картина", "Высокая адаптивность", "Управление рисками на всех уровнях", "Когнитивная гибкость"],
    growthAreas: ["Передача навыков команде", "Масштабирование стратегического подхода", "Работа с «чёрными лебедями»"],
  },
};

const PROFILE_DATA: Record<string, Omit<ProfileInterpretation, "profile">> = {
  "Архитектор системы": {
    description: "Ваша сильная сторона — построение полной системной картины. Вы видите факторы, связи, уровни. Вы строите стратегию «от структуры», а не от интуиции.",
    traits: ["Системный подход", "Видение связей", "Многоуровневый анализ"],
    blindSpot: "Можете увлечься анализом и затянуть с принятием решения. Не все связи одинаково важны — ищите точки рычага.",
  },
  "Аналитик": {
    description: "Вы точно определяете ключевые факторы и расставляете приоритеты. Ваши решения основаны на данных, а не на впечатлениях.",
    traits: ["Точные приоритеты", "Структурированность", "Фокус на главном"],
    blindSpot: "Можете упустить «мягкие» факторы — настроения, культуру, скрытые зависимости. Не всё измеряется цифрами.",
  },
  "Тактик": {
    description: "Ваша сила — в проработке сценариев. Вы видите разные варианты развития и готовите план для каждого из них.",
    traits: ["Сценарное мышление", "Подготовка к вариативности", "Практичность планов"],
    blindSpot: "Можете недооценивать системные связи, фокусируясь на «что будет». Добавьте анализ «почему это произойдёт».",
  },
  "Осторожный стратег": {
    description: "Вы хорошо работаете с рисками — видите угрозы и знаете, как ими управлять. Это ценное качество, особенно в нестабильных условиях.",
    traits: ["Управление рисками", "Осторожность", "Готовность к угрозам"],
    blindSpot: "Чрезмерная осторожность может мешать видеть возможности. Не все риски стоит избегать — некоторые стоит принять ради роста.",
  },
  "Риск-игрок": {
    description: "Ваши стратегии устойчивы к стрессу. Вы не боитесь турбулентности и умеете сохранять курс при неблагоприятных условиях.",
    traits: ["Стрессоустойчивость", "Устойчивые стратегии", "Работа под давлением"],
    blindSpot: "Устойчивость к стрессу не заменяет системного анализа. Убедитесь, что ваша «устойчивость» — не просто игнорирование проблем.",
  },
  "Гибкий стратег": {
    description: "Ваша главная сила — готовность менять решения при изменении данных. Вы не цепляетесь за первоначальный план и адаптируетесь к реальности.",
    traits: ["Когнитивная гибкость", "Адаптивность", "Открытость новым данным"],
    blindSpot: "Избыточная гибкость может выглядеть как нерешительность. Важно различать «я адаптируюсь» от «я не могу определиться».",
  },
};

export function buildFullInterpretation(data: StrategicData, results: StrategicResults): FullInterpretation {
  const indices: IndexInterpretation[] = Object.entries(results.indices).map(([key, value]) => {
    const pct = Math.round(value * 100);
    const meta = INDEX_META[key];
    const { zone, zoneLabel, zoneColor } = indexZone(pct);
    const description = zone === "high" ? meta.descHigh : zone === "mid" ? meta.descMid : meta.descLow;
    const recommendation = zone === "low" ? meta.recLow : zone === "mid" ? meta.recMid : "";
    return {
      key,
      name: meta.name,
      fullName: meta.fullName,
      value,
      percent: pct,
      zone,
      zoneLabel,
      zoneColor,
      description,
      meaning: meta.meaning,
      recommendation,
    };
  });

  const levelData = LEVEL_DATA[results.level] || LEVEL_DATA["Реактивное мышление"];
  const level: LevelInterpretation = { level: results.level, ...levelData };

  const profileData = PROFILE_DATA[results.profile] || PROFILE_DATA["Аналитик"];
  const profile: ProfileInterpretation = { profile: results.profile, ...profileData };

  let scenarios: ScenarioInterpretation | null = null;
  if (data.step3 && data.step5) {
    const stressResistance = data.step5.ia;
    const stressPct = Math.round(stressResistance * 100);
    let verdict = "Стратегия требует серьёзной доработки";
    if (stressPct >= 70) verdict = "Стратегия устойчива к стрессу";
    else if (stressPct >= 50) verdict = "Стратегия умеренно устойчива";
    else if (stressPct >= 30) verdict = "Стратегия уязвима к стрессу";

    const spread = data.step3.spread;
    let spreadComment = "Крайне узкий — возможно, негативный сценарий недооценён.";
    if (spread > 500000) spreadComment = "Широкий разброс — вы честно оцениваете неопределённость.";
    else if (spread > 100000) spreadComment = "Умеренный разброс. Проверьте, не занижен ли негативный вариант.";

    scenarios = {
      ev: data.step3.ev,
      spread,
      stressResistance: stressPct,
      verdict,
      details: `Ожидаемая ценность: ${data.step3.ev.toLocaleString("ru-RU")} ₽. Разброс между лучшим и худшим сценарием: ${spread.toLocaleString("ru-RU")} ₽. ${spreadComment} После стресс-теста стратегия сохраняет ${stressPct}% ценности.`,
    };
  }

  let risks: RiskInterpretation | null = null;
  if (data.step4) {
    const totalRisks = data.step4.risks.length;
    const avgManageability = Math.round((data.step4.risks.reduce((s, r) => s + r.manageability, 0) / (totalRisks || 1)) * 10) / 10;
    const highRisks = data.step4.risks
      .filter((r) => r.probability * r.damage > 15)
      .map((r) => r.name);

    let verdict = "Управление рисками требует внимания";
    if (avgManageability >= 4) verdict = "Риски хорошо управляемы";
    else if (avgManageability >= 2.5) verdict = "Управляемость рисков на среднем уровне";

    risks = {
      totalRisks,
      avgManageability,
      highRisks,
      verdict,
      details: `Выявлено ${totalRisks} рисков. Средняя управляемость: ${avgManageability}/5. ${highRisks.length > 0 ? `Критические риски: ${highRisks.join(", ")}.` : "Критических рисков не обнаружено."} Совокупный индекс риска: ${data.step4.ir.toLocaleString("ru-RU")}.`,
    };
  }

  let factors: FactorInterpretation | null = null;
  if (data.step1 && data.step2) {
    const totalFactors = data.step1.factors.length;
    const categoriesUsed = data.step1.levelsUsed;
    const pivotCount = data.step2.pivotFactorIds.length;
    const blindSpotCount = data.step2.blindSpots.length;

    let verdict = "Анализ факторов требует расширения";
    if (categoriesUsed >= 3 && blindSpotCount === 0) verdict = "Отличный анализ факторов";
    else if (categoriesUsed >= 2 && blindSpotCount <= 2) verdict = "Хороший анализ с небольшими пробелами";

    const categoryNames: Record<string, string> = { micro: "микро", meso: "мезо", macro: "макро", hidden: "скрытые" };
    const usedCategories = [...new Set(data.step1.factors.map((f) => f.category))].map((c) => categoryNames[c] || c);
    const allCategories = ["микро", "мезо", "макро", "скрытые"];
    const missingCategories = allCategories.filter((c) => !usedCategories.includes(c));

    factors = {
      totalFactors,
      categoriesUsed,
      pivotCount,
      blindSpotCount,
      verdict,
      details: `${totalFactors} факторов на ${categoriesUsed} из 4 уровней (${usedCategories.join(", ")}). ${missingCategories.length > 0 ? `Не охвачены: ${missingCategories.join(", ")}.` : "Все уровни охвачены."} Узловых факторов: ${pivotCount}. ${blindSpotCount > 0 ? `В слепой зоне: ${blindSpotCount} — это влиятельные факторы, которые вы не отметили как приоритетные.` : "Слепых зон нет."}`,
    };
  }

  const sorted = [...indices].sort((a, b) => b.percent - a.percent);
  const topStrength = `${sorted[0].name} (${sorted[0].percent}%) — ваша самая сильная компетенция в этой сессии.`;
  const topWeakness = `${sorted[sorted.length - 1].name} (${sorted[sorted.length - 1].percent}%) — основная зона роста. ${sorted[sorted.length - 1].recommendation || "Обратите внимание на эту область."}`;

  const summary = `Ваш стратегический индекс — ${results.osi} из 100 (${results.level}). Профиль мышления: ${results.profile}. ${level.description}`;

  return { osi: results.osi, level, profile, indices, scenarios, risks, factors, summary, topStrength, topWeakness };
}
