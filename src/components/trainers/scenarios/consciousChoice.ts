import { TrainerScenario } from "../types";

export const consciousChoiceScenario: TrainerScenario = {
  id: "conscious-choice",
  resultCalculator: "conscious-choice",
  steps: [
    {
      id: "cc-intro",
      type: "intro",
      title: "Осознанный выбор",
      description:
        "Этот тренажер поможет вам разобраться в текущей ситуации выбора. Вы исследуете свои ценности, страхи и интуицию — и подойдёте к решению осознанно, а не на автопилоте. Отвечайте честно — здесь нет правильных и неправильных ответов.",
    },
    {
      id: "cc-decision",
      type: "text-input",
      title: "Какое решение вы сейчас обдумываете?",
      description:
        "Опишите ситуацию выбора, которая вас занимает. Это может быть что угодно — от смены работы до бытового решения.",
      placeholder: "Например: думаю, стоит ли менять работу...",
    },
    {
      id: "cc-clarity",
      type: "scale",
      title: "Насколько вам ясна ситуация?",
      description:
        "Оцените, насколько хорошо вы понимаете все аспекты этого выбора: последствия, варианты, ограничения.",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Полный туман", max: "Кристальная ясность" },
      scoreCategory: "clarity",
    },
    {
      id: "cc-values",
      type: "multiple-choice",
      title: "Какие ценности важны для вас в этом решении?",
      description: "Выберите все, что откликается. Это ваш внутренний компас.",
      scoreCategory: "values",
      options: [
        { id: "cc-v-freedom", label: "Свобода и независимость", score: 2, tags: ["autonomy"] },
        { id: "cc-v-security", label: "Стабильность и безопасность", score: 2, tags: ["security"] },
        { id: "cc-v-growth", label: "Развитие и рост", score: 2, tags: ["growth"] },
        { id: "cc-v-family", label: "Семья и близкие", score: 2, tags: ["family"] },
        { id: "cc-v-creativity", label: "Творчество и самовыражение", score: 2, tags: ["creativity"] },
        { id: "cc-v-money", label: "Деньги и материальное благополучие", score: 2, tags: ["money"] },
        { id: "cc-v-health", label: "Здоровье и энергия", score: 2, tags: ["health"] },
        { id: "cc-v-recognition", label: "Признание и уважение", score: 1, tags: ["recognition"] },
      ],
    },
    {
      id: "cc-fear",
      type: "single-choice",
      title: "Что пугает вас больше всего в этом выборе?",
      description: "Выберите главный страх — тот, который сильнее остальных тормозит решение.",
      scoreCategory: "fear",
      options: [
        { id: "cc-f-mistake", label: "Совершить ошибку и пожалеть", score: 4 },
        { id: "cc-f-money", label: "Потерять деньги или доход", score: 3 },
        { id: "cc-f-disappoint", label: "Разочаровать близких или коллег", score: 4 },
        { id: "cc-f-miss", label: "Упустить лучшую возможность", score: 3 },
        { id: "cc-f-change", label: "Сами перемены — выход из зоны комфорта", score: 5 },
        { id: "cc-f-none", label: "Ничего особенно не пугает", score: 1 },
      ],
    },
    {
      id: "cc-others",
      type: "scale",
      title: "Насколько мнение окружающих влияет на ваш выбор?",
      description:
        "Оцените честно: вы выбираете для себя — или чтобы соответствовать ожиданиям?",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Решаю сам(а)", max: "Сильно завишу от мнения" },
      scoreCategory: "fear",
    },
    {
      id: "cc-intuition",
      type: "text-input",
      title: "Какой вариант кажется правильным интуитивно?",
      description:
        "Не думайте долго. Что первое приходит на ум, когда вы представляете, что решение уже принято?",
      placeholder: "Моя интуиция говорит...",
    },
    {
      id: "cc-friend",
      type: "text-input",
      title: "Что бы вы посоветовали другу в такой же ситуации?",
      description:
        "Представьте, что близкий человек пришёл с точно такой же проблемой выбора. Что бы вы ему сказали?",
      placeholder: "Я бы сказал(а) другу...",
    },
    {
      id: "cc-no-fear",
      type: "text-input",
      title: "Если бы страха не существовало — что бы вы выбрали?",
      description:
        "Уберите из уравнения все «а вдруг». Что остаётся, когда страх исчезает?",
      placeholder: "Без страха я бы выбрал(а)...",
    },
    {
      id: "cc-readiness",
      type: "scale",
      title: "Насколько вы готовы принять решение прямо сейчас?",
      description:
        "Оцените свою внутреннюю готовность. Не торопитесь — иногда нужно ещё время.",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Совсем не готов(а)", max: "Полностью готов(а)" },
      scoreCategory: "clarity",
    },
    {
      id: "cc-info",
      type: "info",
      title: "Вы проделали важную работу",
      description:
        "Вы только что честно посмотрели на свой выбор с разных сторон: ценности, страхи, интуиция, взгляд со стороны. Даже если решение ещё не принято — осознанность уже изменила ваше отношение к нему. Настоящий выбор — это не отсутствие сомнений, а готовность действовать, несмотря на них.",
    },
    {
      id: "cc-result",
      type: "result",
      title: "Ваш результат",
      resultTemplate: "conscious-choice",
    },
  ],
};