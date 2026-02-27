import { TrainerScenario } from "../types";

export const emotionsScenario: TrainerScenario = {
  id: "emotions-in-action",
  resultCalculator: "emotions-in-action",
  steps: [
    {
      id: "em-intro",
      type: "intro",
      title: "Эмоции в действии",
      description:
        "Этот тренажёр поможет вам лучше понять свои эмоции: распознать, что вы чувствуете, найти причину и научиться реагировать осознанно. Чем чаще вы проходите его, тем точнее становится ваш эмоциональный радар.",
    },
    {
      id: "em-current",
      type: "single-choice",
      title: "Что вы чувствуете прямо сейчас?",
      description:
        "Выберите эмоцию, которая ближе всего к вашему текущему состоянию. Если сложно определить — это тоже важная информация.",
      scoreCategory: "awareness",
      options: [
        { id: "em-c-joy", label: "Радость, воодушевление", score: 4 },
        { id: "em-c-sadness", label: "Грусть, печаль", score: 3 },
        { id: "em-c-anger", label: "Злость, раздражение", score: 3 },
        { id: "em-c-anxiety", label: "Тревога, беспокойство", score: 2 },
        { id: "em-c-calm", label: "Спокойствие, умиротворение", score: 5 },
        { id: "em-c-confusion", label: "Растерянность, непонимание", score: 2 },
        { id: "em-c-irritation", label: "Раздражительность, напряжение", score: 2 },
        { id: "em-c-emptiness", label: "Пустота, безразличие", score: 1 },
      ],
    },
    {
      id: "em-intensity",
      type: "scale",
      title: "Насколько интенсивна эта эмоция?",
      description:
        "Оцените силу того, что вы чувствуете. Даже слабая эмоция заслуживает внимания.",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Едва заметна", max: "Захлёстывает полностью" },
      scoreCategory: "awareness",
    },
    {
      id: "em-body",
      type: "multiple-choice",
      title: "Где в теле вы ощущаете эту эмоцию?",
      description:
        "Эмоции всегда отражаются в теле. Выберите все зоны, которые откликаются.",
      scoreCategory: "awareness",
      options: [
        { id: "em-b-chest", label: "Грудная клетка (сжатие, тяжесть, тепло)", score: 1 },
        { id: "em-b-throat", label: "Горло (ком, сдавленность)", score: 1 },
        { id: "em-b-stomach", label: "Живот (бабочки, тяжесть, тошнота)", score: 1 },
        { id: "em-b-head", label: "Голова (напряжение, туман, давление)", score: 1 },
        { id: "em-b-shoulders", label: "Плечи и шея (зажатость)", score: 1 },
        { id: "em-b-hands", label: "Руки (дрожь, холод, потливость)", score: 1 },
        { id: "em-b-none", label: "Не могу определить конкретное место", score: 0 },
      ],
    },
    {
      id: "em-trigger",
      type: "single-choice",
      title: "Что вызвало эту эмоцию?",
      description:
        "Попробуйте найти причину. Иногда триггер очевиден, иногда эмоция «накопилась».",
      scoreCategory: "triggers",
      options: [
        { id: "em-t-person", label: "Общение с конкретным человеком", score: 3 },
        { id: "em-t-future", label: "Мысли о будущем", score: 4 },
        { id: "em-t-memory", label: "Воспоминание о прошлом", score: 3 },
        { id: "em-t-work", label: "Рабочая ситуация", score: 3 },
        { id: "em-t-health", label: "Беспокойство о здоровье", score: 4 },
        { id: "em-t-money", label: "Финансовые переживания", score: 4 },
        { id: "em-t-relationship", label: "Отношения с близкими", score: 3 },
        { id: "em-t-unclear", label: "Не могу определить причину", score: 5 },
      ],
    },
    {
      id: "em-reaction",
      type: "single-choice",
      title: "Как вы обычно реагируете на эту эмоцию?",
      description:
        "Нет плохих ответов — это наблюдение за своими паттернами.",
      scoreCategory: "regulation",
      options: [
        { id: "em-r-suppress", label: "Подавляю, стараюсь не чувствовать", score: 1 },
        { id: "em-r-express", label: "Выражаю открыто (иногда чрезмерно)", score: 2 },
        { id: "em-r-analyze", label: "Анализирую, пытаюсь понять причину", score: 4 },
        { id: "em-r-distract", label: "Отвлекаюсь (еда, соцсети, сериалы)", score: 1 },
        { id: "em-r-physical", label: "Направляю в физическую активность", score: 5 },
        { id: "em-r-talk", label: "Говорю с кем-то о своих чувствах", score: 4 },
      ],
    },
    {
      id: "em-frequency",
      type: "single-choice",
      title: "Как часто эта эмоция вас посещает?",
      description:
        "Повторяющиеся эмоции могут указывать на важный паттерн.",
      scoreCategory: "triggers",
      options: [
        { id: "em-freq-rare", label: "Это редкость — впервые или очень давно", score: 1 },
        { id: "em-freq-sometimes", label: "Иногда — раз в несколько недель", score: 2 },
        { id: "em-freq-often", label: "Довольно часто — несколько раз в неделю", score: 4 },
        { id: "em-freq-daily", label: "Почти каждый день", score: 5 },
      ],
    },
    {
      id: "em-help",
      type: "multiple-choice",
      title: "Что могло бы помочь вам прямо сейчас?",
      description: "Выберите всё, что кажется подходящим. Доверяйте себе.",
      scoreCategory: "regulation",
      options: [
        { id: "em-h-breath", label: "Несколько глубоких вдохов", score: 2 },
        { id: "em-h-walk", label: "Прогулка или движение", score: 2 },
        { id: "em-h-talk", label: "Поговорить с кем-то", score: 2 },
        { id: "em-h-write", label: "Записать свои мысли", score: 2 },
        { id: "em-h-rest", label: "Просто отдохнуть", score: 1 },
        { id: "em-h-music", label: "Послушать музыку", score: 1 },
        { id: "em-h-nothing", label: "Ничего — я справлюсь сам(а)", score: 1 },
      ],
    },
    {
      id: "em-manage",
      type: "scale",
      title: "Оцените свою способность управлять этой эмоцией",
      description:
        "Насколько вы чувствуете контроль, а не она контролирует вас?",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Эмоция управляет мной", max: "Я управляю эмоцией" },
      scoreCategory: "regulation",
    },
    {
      id: "em-desired",
      type: "single-choice",
      title: "Что бы вы хотели чувствовать вместо этого?",
      description:
        "Выбор желаемого состояния — первый шаг к нему.",
      scoreCategory: "awareness",
      options: [
        { id: "em-d-calm", label: "Спокойствие и равновесие", score: 3 },
        { id: "em-d-joy", label: "Радость и лёгкость", score: 3 },
        { id: "em-d-confidence", label: "Уверенность и силу", score: 3 },
        { id: "em-d-clarity", label: "Ясность и понимание", score: 4 },
        { id: "em-d-connection", label: "Близость и тепло", score: 3 },
        { id: "em-d-same", label: "Меня устраивает то, что я чувствую", score: 5 },
      ],
    },
    {
      id: "em-step",
      type: "text-input",
      title: "Один маленький шаг к желаемому состоянию",
      description:
        "Что вы можете сделать прямо сейчас или в ближайший час, чтобы сдвинуться к нужному состоянию?",
      placeholder: "Например: выйти на 10 минут прогуляться...",
    },
    {
      id: "em-info",
      type: "info",
      title: "Вы уже работаете с эмоциями",
      description:
        "Вы только что назвали эмоцию, нашли её в теле, определили триггер и выбрали способ регуляции. Это и есть эмоциональный интеллект в действии. Каждый раз, проходя этот тренажёр, вы укрепляете связь с собой. Со временем вы начнёте замечать паттерны — и реагировать осознанно, а не на автопилоте.",
    },
    {
      id: "em-result",
      type: "result",
      title: "Ваш результат",
      resultTemplate: "emotions-in-action",
    },
  ],
};
