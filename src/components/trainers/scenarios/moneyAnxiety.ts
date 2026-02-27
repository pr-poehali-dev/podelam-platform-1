import { TrainerScenario } from "../types";

export const moneyAnxietyScenario: TrainerScenario = {
  id: "money-anxiety",
  resultCalculator: "money-anxiety",
  steps: [
    {
      id: "ma-intro",
      type: "intro",
      title: "Деньги без тревоги",
      description:
        "Отношение к деньгам формируется в детстве и часто работает на автопилоте: установки родителей, страхи, привычки. Этот тренажёр поможет осознать свои денежные паттерны, снизить тревогу и начать выстраивать здоровую финансовую стратегию. Без осуждения — только честный взгляд.",
    },
    {
      id: "ma-childhood",
      type: "single-choice",
      title: "Какую фразу о деньгах вы чаще всего слышали в детстве?",
      description:
        "Родительские установки формируют наш денежный сценарий. Вспомните, что звучало дома.",
      scoreCategory: "beliefs",
      options: [
        { id: "ma-ch-evil", label: "Деньги — это зло, от них все проблемы", score: 1 },
        { id: "ma-ch-trees", label: "Деньги на деревьях не растут", score: 2 },
        { id: "ma-ch-rich-bad", label: "Богатые — плохие люди", score: 1 },
        { id: "ma-ch-hard", label: "Деньги надо зарабатывать тяжёлым трудом", score: 2 },
        { id: "ma-ch-problems", label: "Большие деньги — большие проблемы", score: 1 },
        { id: "ma-ch-afford", label: "Мы не можем себе это позволить", score: 2 },
        { id: "ma-ch-positive", label: "Скорее позитивное: деньги — это возможности", score: 5 },
      ],
    },
    {
      id: "ma-anxiety-level",
      type: "scale",
      title: "Оцените уровень вашей финансовой тревоги",
      description:
        "Как сильно деньги (или их нехватка) влияют на ваше ежедневное эмоциональное состояние?",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Спокоен(на) насчёт денег", max: "Постоянная тревога" },
      scoreCategory: "anxiety",
    },
    {
      id: "ma-fears",
      type: "multiple-choice",
      title: "Что пугает вас в отношении денег?",
      description:
        "Выберите все страхи, которые откликаются. Осознание — первый шаг к свободе от них.",
      scoreCategory: "anxiety",
      options: [
        { id: "ma-f-notenough", label: "Что денег не хватит на жизнь", score: 2 },
        { id: "ma-f-lose", label: "Что потеряю то, что есть", score: 2 },
        { id: "ma-f-toomuch", label: "Что заработаю «слишком много» и изменюсь", score: 1 },
        { id: "ma-f-ask", label: "Просить деньги (зарплату, оплату, долг)", score: 2 },
        { id: "ma-f-spend", label: "Тратить на себя — чувство вины", score: 2 },
        { id: "ma-f-judged", label: "Что меня осудят за мои доходы или расходы", score: 1 },
      ],
    },
    {
      id: "ma-expenses",
      type: "single-choice",
      title: "Знаете ли вы свои ежемесячные расходы?",
      description:
        "Финансовая ясность — основа спокойствия. Знание цифр снижает тревогу.",
      scoreCategory: "strategy",
      options: [
        { id: "ma-e-exact", label: "Да, веду учёт — знаю до рубля", score: 5 },
        { id: "ma-e-approx", label: "Примерно знаю основные категории", score: 4 },
        { id: "ma-e-rough", label: "Имею общее представление", score: 2 },
        { id: "ma-e-no", label: "Нет, стараюсь не думать об этом", score: 1 },
      ],
    },
    {
      id: "ma-spending",
      type: "single-choice",
      title: "Что вы чувствуете, когда тратите деньги на себя?",
      description:
        "Не на «нужное», а именно на удовольствие, отдых, подарок себе.",
      scoreCategory: "beliefs",
      options: [
        { id: "ma-sp-joy", label: "Удовольствие и радость — заслужил(а)", score: 5 },
        { id: "ma-sp-ok", label: "Нормально, если в рамках бюджета", score: 4 },
        { id: "ma-sp-guilt", label: "Чувство вины — лучше бы отложил(а)", score: 2 },
        { id: "ma-sp-anxiety", label: "Тревогу — а вдруг потом не хватит", score: 1 },
        { id: "ma-sp-avoid", label: "Стараюсь вообще не тратить на себя", score: 1 },
      ],
    },
    {
      id: "ma-earning",
      type: "single-choice",
      title: "Как вы относитесь к зарабатыванию денег?",
      description:
        "Убеждения о заработке определяют ваш финансовый потолок.",
      scoreCategory: "beliefs",
      options: [
        { id: "ma-ea-love", label: "Мне нравится зарабатывать, это драйв и энергия", score: 5 },
        { id: "ma-ea-normal", label: "Нормальная часть жизни, без сильных эмоций", score: 4 },
        { id: "ma-ea-necessary", label: "Необходимость — работаю ради денег, не ради удовольствия", score: 2 },
        { id: "ma-ea-hard", label: "Тяжёлый труд, зарабатываю с усилием", score: 2 },
        { id: "ma-ea-shame", label: "Неловко просить за свою работу достойную оплату", score: 1 },
      ],
    },
    {
      id: "ma-goal",
      type: "single-choice",
      title: "Есть ли у вас финансовая цель?",
      description:
        "Цель создаёт направление. Без неё деньги просто «текут».",
      scoreCategory: "strategy",
      options: [
        { id: "ma-g-clear", label: "Да, конкретная цель с суммой и сроком", score: 5 },
        { id: "ma-g-vague", label: "Есть общее понимание, но без конкретики", score: 3 },
        { id: "ma-g-dream", label: "Скорее мечта, чем план", score: 2 },
        { id: "ma-g-no", label: "Нет — живу от зарплаты до зарплаты", score: 1 },
      ],
    },
    {
      id: "ma-double",
      type: "text-input",
      title: "Что изменится, если ваш доход вырастет вдвое?",
      description:
        "Представьте: завтра вы зарабатываете в 2 раза больше. Что конкретно изменится в вашей жизни?",
      placeholder: "Если мой доход удвоится, я...",
    },
    {
      id: "ma-planning",
      type: "scale",
      title: "Оцените свои навыки финансового планирования",
      description:
        "Бюджет, подушка безопасности, накопления — насколько уверенно вы ими управляете?",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Не планирую вообще", max: "Контролирую полностью" },
      scoreCategory: "strategy",
    },
    {
      id: "ma-one-step",
      type: "text-input",
      title: "Один шаг к финансовому спокойствию",
      description:
        "Что вы можете сделать на этой неделе, чтобы снизить денежную тревогу? Даже маленький шаг.",
      placeholder: "Например: посчитать расходы за прошлый месяц...",
      scoreCategory: "strategy",
    },
    {
      id: "ma-info",
      type: "info",
      title: "Вы начали менять отношение к деньгам",
      description:
        "Осознать свои денежные установки — значит перестать быть их заложником. Вы только что увидели, как детские фразы влияют на сегодняшние решения, и наметили конкретный шаг. Финансовое спокойствие — это не про сумму на счёте, а про отношение к деньгам. И оно уже меняется.",
    },
    {
      id: "ma-result",
      type: "result",
      title: "Ваш результат",
      resultTemplate: "money-anxiety",
    },
  ],
};
