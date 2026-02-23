export type Message = { id: number; from: "bot" | "user"; text: string };

export type DiaryEntry = {
  date: string;
  situation: string;
  thoughts: string;
  emotions: string;
  body: string;
  action: string;
  emotion_tags: string[];
  pattern_tags: string[];
  intensity_score: number;
  reflectionAnswers?: string[];
  supportText?: string;
};

export type Templates = {
  steps: { key: string; question: string }[];
  emotion_labels: Record<string, string>;
  pattern_labels: Record<string, string>;
  summary: string;
  emotions_found: string;
  emotions_none: string;
  patterns_new: string;
  patterns_repeat: string;
  dynamic_up: string;
  dynamic_down: string;
  dynamic_same: string;
  questions: string[];
  start_message: string;
};

function getUserEmail(): string {
  try { return JSON.parse(localStorage.getItem("pdd_user") || "{}").email || ""; } catch { return ""; }
}
export function CHAT_KEY() { return `diary_chat_${getUserEmail()}`; }
export function ENTRIES_KEY() { return `diary_entries_${getUserEmail()}`; }

function matchKeywords(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw));
}

export function detectEmotions(
  texts: string[],
  dict: Record<string, string[]>
): { tags: string[]; score: number } {
  const combined = texts.join(" ");
  const tags: string[] = [];
  let score = 0;
  for (const [cat, keywords] of Object.entries(dict)) {
    const hits = matchKeywords(combined, keywords);
    if (hits.length > 0) {
      tags.push(cat);
      if (hits.length >= 4) score += 2;
      else if (hits.length >= 2) score += 1;
    }
  }
  return { tags, score };
}

export function detectPatterns(
  texts: string[],
  rules: Record<string, string[]>
): string[] {
  const combined = texts.join(" ");
  const tags: string[] = [];
  for (const [pat, phrases] of Object.entries(rules)) {
    if (matchKeywords(combined, phrases).length > 0) tags.push(pat);
  }
  return tags;
}

function pickQuestions(all: string[], count = 3): string[] {
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function buildResult(
  entry: DiaryEntry,
  history: DiaryEntry[],
  tpl: Templates
): { analysis: string; questions: string[] } {
  const lines: string[] = [];

  lines.push(tpl.summary.replace("{situation}", entry.situation));

  if (entry.emotion_tags.length > 0) {
    const list = entry.emotion_tags
      .map((t) => tpl.emotion_labels[t] ?? t)
      .join(", ");
    lines.push(tpl.emotions_found.replace("{emotion_list}", list));
  } else {
    lines.push(tpl.emotions_none);
  }

  if (entry.pattern_tags.length > 0) {
    const list = entry.pattern_tags
      .map((t) => tpl.pattern_labels[t] ?? t)
      .join(", ");
    lines.push(tpl.patterns_new.replace("{pattern_list}", list));
    const repeatCount = history.filter((e) =>
      entry.pattern_tags.some((p) => e.pattern_tags.includes(p))
    ).length;
    if (repeatCount >= 2) lines.push(tpl.patterns_repeat);
  }

  if (history.length > 0) {
    const prev = history[history.length - 1];
    if (entry.intensity_score > prev.intensity_score) lines.push(tpl.dynamic_up);
    else if (entry.intensity_score < prev.intensity_score) lines.push(tpl.dynamic_down);
    else lines.push(tpl.dynamic_same);
  }

  const qs = pickQuestions(tpl.questions);
  return { analysis: lines.join("\n\n"), questions: qs };
}

const SUPPORT_TEMPLATES = [
  {
    keywords: ["тревога", "страх", "нервничаю", "переживаю", "волнуюсь", "паника", "беспокоюсь"],
    texts: [
      "Тревога — это сигнал, а не приговор. Ты уже делаешь важный шаг — наблюдаешь за ней вместо того, чтобы убегать.",
      "Когда мы признаём тревогу, она теряет часть своей силы. Ты справляешься — и это видно по твоим ответам.",
    ],
  },
  {
    keywords: ["злость", "раздражение", "бесит", "злюсь", "агрессия", "ненавижу"],
    texts: [
      "Злость — это энергия. Вопрос не в том, чтобы её подавить, а в том, куда её направить. Ты уже начал разбираться.",
      "Раздражение часто говорит о нарушенных границах. Это здоровая реакция — и важно, что ты её заметил.",
    ],
  },
  {
    keywords: ["грусть", "печаль", "тоска", "пустота", "одиночество", "одинок", "плачу"],
    texts: [
      "Грусть — это часть жизни, и она не делает тебя слабым. Наоборот, способность чувствовать — это твоя сила.",
      "Ты не один в этом. Само решение записать свои мысли — уже акт заботы о себе.",
    ],
  },
  {
    keywords: ["устал", "нет сил", "выгорание", "выдохся", "истощён", "не могу"],
    texts: [
      "Усталость — это тело говорит: «Нужна пауза». Ты не ленишься — ты заслуживаешь восстановления.",
      "Когда энергии мало, даже маленькие шаги считаются. И эта запись — один из них.",
    ],
  },
  {
    keywords: ["вина", "виноват", "стыдно", "стыд", "должен был"],
    texts: [
      "Чувство вины часто значит, что тебе не всё равно. Но самокритика без действия только отнимает силы. Ты уже на пути.",
      "Ты не обязан быть идеальным. Достаточно быть честным с собой — и ты это делаешь прямо сейчас.",
    ],
  },
];

export function generateSupport(answers: string[], entry: DiaryEntry): string {
  const combined = [...answers, entry.situation, entry.thoughts, entry.emotions].join(" ").toLowerCase();

  for (const tpl of SUPPORT_TEMPLATES) {
    const matched = tpl.keywords.some((kw) => combined.includes(kw));
    if (matched) {
      return tpl.texts[Math.floor(Math.random() * tpl.texts.length)];
    }
  }

  const generic = [
    "Ты проделал важную работу сегодня. Само наблюдение за собой — это уже шаг к изменениям.",
    "Каждый раз, когда ты останавливаешься и рефлексируешь — ты становишься чуть ближе к себе. Это ценно.",
    "Ты не просто записал мысли — ты дал себе пространство подумать. Это больше, чем кажется.",
  ];
  return generic[Math.floor(Math.random() * generic.length)];
}