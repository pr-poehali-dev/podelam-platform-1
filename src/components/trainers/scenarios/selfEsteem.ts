import { TrainerScenario } from "../types";

export const selfEsteemScenario: TrainerScenario = {
  id: "self-esteem",
  resultCalculator: "self-esteem",
  steps: [
    {
      id: "se-intro",
      type: "intro",
      title: "Самооценка и внутренняя опора",
      description:
        "Здоровая самооценка — это не думать о себе хорошо всё время. Это устойчивое ощущение своей ценности, даже когда что-то не получается. В этом тренажёре вы исследуете внутреннего критика, свои реальные достижения и личные границы. Отвечайте так, как чувствуете — честность с собой и есть фундамент.",
    },
    {
      id: "se-rate",
      type: "scale",
      title: "Как бы вы оценили себя сегодня?",
      description:
        "Общее ощущение: насколько вы сейчас цените и уважаете себя?",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Совсем не ценю", max: "Полностью ценю и уважаю" },
      scoreCategory: "self-worth",
    },
    {
      id: "se-critic",
      type: "single-choice",
      title: "Что чаще всего говорит ваш внутренний критик?",
      description:
        "У каждого есть этот голос. Важно не избавиться от него, а научиться его замечать.",
      scoreCategory: "inner-critic",
      options: [
        { id: "se-cr-enough", label: "Ты недостаточно хорош(а)", score: 4 },
        { id: "se-cr-fail", label: "У тебя не получится", score: 5 },
        { id: "se-cr-deserve", label: "Ты не заслуживаешь хорошего", score: 5 },
        { id: "se-cr-compare", label: "Все вокруг лучше тебя", score: 4 },
        { id: "se-cr-harder", label: "Надо стараться ещё сильнее", score: 3 },
        { id: "se-cr-judge", label: "Тебя осудят, если узнают настоящего тебя", score: 5 },
        { id: "se-cr-quiet", label: "Мой критик обычно молчит", score: 1 },
      ],
    },
    {
      id: "se-compare",
      type: "single-choice",
      title: "Как часто вы сравниваете себя с другими?",
      description:
        "Сравнение — один из главных разрушителей самооценки. Даже если мы понимаем это умом.",
      scoreCategory: "inner-critic",
      options: [
        { id: "se-cmp-always", label: "Постоянно — почти в каждой ситуации", score: 5 },
        { id: "se-cmp-often", label: "Часто — особенно в соцсетях", score: 4 },
        { id: "se-cmp-sometimes", label: "Иногда — когда нервничаю или устаю", score: 3 },
        { id: "se-cmp-rarely", label: "Редко — научился(лась) замечать это", score: 2 },
        { id: "se-cmp-never", label: "Практически не сравниваю", score: 1 },
      ],
    },
    {
      id: "se-wins",
      type: "text-input",
      title: "Назовите 3 вещи, которые вы хорошо сделали на этой неделе",
      description:
        "Не обязательно великие дела. Приготовили ужин? Вовремя сдали задачу? Поддержали друга? Это всё считается.",
      placeholder: "1. ...\n2. ...\n3. ...",
      scoreCategory: "self-worth",
    },
    {
      id: "se-boundaries",
      type: "single-choice",
      title: "Можете ли вы сказать «нет», когда нужно?",
      description:
        "Умение отказывать — один из маркеров здоровой самооценки и личных границ.",
      scoreCategory: "boundaries",
      options: [
        { id: "se-bn-easy", label: "Да, без проблем — если мне не подходит, я отказываю", score: 5 },
        { id: "se-bn-mostly", label: "Чаще да, но иногда соглашаюсь из чувства вины", score: 4 },
        { id: "se-bn-hard", label: "Сложно — боюсь обидеть или разочаровать", score: 2 },
        { id: "se-bn-cant", label: "Почти всегда соглашаюсь, даже если не хочу", score: 1 },
      ],
    },
    {
      id: "se-self-first",
      type: "single-choice",
      title: "Когда вы в последний раз поставили себя на первое место?",
      description:
        "Забота о себе — не эгоизм, а необходимость. Вспомните, когда вы делали что-то именно для себя.",
      scoreCategory: "boundaries",
      options: [
        { id: "se-sf-today", label: "Сегодня или вчера", score: 5 },
        { id: "se-sf-week", label: "На этой неделе", score: 4 },
        { id: "se-sf-month", label: "Где-то в этом месяце", score: 2 },
        { id: "se-sf-long", label: "Давно — не помню когда", score: 1 },
        { id: "se-sf-never", label: "Кажется, я всегда ставлю других выше", score: 1 },
      ],
    },
    {
      id: "se-believe",
      type: "text-input",
      title: "Что изменилось бы, если бы вы по-настоящему поверили в себя?",
      description:
        "Представьте: внутренний критик замолчал, сомнения ушли. Что бы вы сделали? Как бы себя чувствовали?",
      placeholder: "Если бы я верил(а) в себя, я бы...",
    },
    {
      id: "se-compliments",
      type: "single-choice",
      title: "Как вы реагируете на комплименты?",
      description:
        "Способность принимать хорошее — важный маркер самооценки.",
      scoreCategory: "self-worth",
      options: [
        { id: "se-cm-accept", label: "Принимаю с благодарностью и удовольствием", score: 5 },
        { id: "se-cm-awkward", label: "Смущаюсь, но приятно", score: 3 },
        { id: "se-cm-deflect", label: "Отмахиваюсь: «Да ладно, ничего особенного»", score: 2 },
        { id: "se-cm-doubt", label: "Не верю — думаю, что льстят или вежливничают", score: 1 },
        { id: "se-cm-guilt", label: "Чувствую неловкость и даже вину", score: 1 },
      ],
    },
    {
      id: "se-proud",
      type: "text-input",
      title: "Одна вещь, которой вы гордитесь в себе",
      description:
        "Качество, поступок, привычка — что-то, за что вы можете сказать себе «молодец».",
      placeholder: "Я горжусь тем, что...",
      scoreCategory: "self-worth",
    },
    {
      id: "se-stability",
      type: "scale",
      title: "Оцените свою внутреннюю устойчивость прямо сейчас",
      description:
        "Насколько крепко вы стоите на ногах, когда внешний мир штормит?",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Шатает от любого ветра", max: "Стою крепко" },
      scoreCategory: "self-worth",
    },
    {
      id: "se-info",
      type: "info",
      title: "Вы заслуживаете хорошего отношения к себе",
      description:
        "Вы только что честно посмотрели на свою самооценку — и это требует мужества. Внутренний критик не исчезнет за одну сессию, но каждый раз, когда вы замечаете его голос, он теряет часть силы. Продолжайте: записывайте маленькие победы, тренируйте «нет» и напоминайте себе — вы достаточны уже сейчас, не «когда-нибудь потом».",
    },
    {
      id: "se-result",
      type: "result",
      title: "Ваш результат",
      resultTemplate: "self-esteem",
    },
  ],
};
