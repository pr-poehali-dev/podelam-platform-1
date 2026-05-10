import Icon from "@/components/ui/icon";

const fitList = [
  "хочешь понять свои сильные стороны",
  "не понимаешь, какой формат реализации тебе подходит",
  "выгораешь от попыток двигаться вперёд",
  "хочешь больше ясности и внутренней опоры",
  "устал копировать чужие модели успеха",
  "чувствуешь потенциал, но не можешь собрать его в систему",
];

const notFitList = [
  "ищешь «волшебную кнопку» без усилий",
  "не готов смотреть на себя честно",
  "хочешь мотивацию вместо конкретики",
  "не собираешься ничего менять",
];

const resultCards = [
  { icon: "Zap", text: "В чём твои сильные стороны" },
  { icon: "Anchor", text: "Твоя внутренняя опора" },
  { icon: "TrendingUp", text: "Твой стиль роста" },
  { icon: "Banknote", text: "Твоя модель дохода" },
  { icon: "ShieldAlert", text: "Что тормозит твой потенциал" },
  { icon: "Target", text: "Конкретные рекомендации под тебя" },
];

export default function ForWhomFitSection() {
  return (
    <>
      {/* ПРОБЛЕМА */}
      <section className="py-16 sm:py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Icon name="AlertCircle" size={20} className="text-rose-600" />
              </div>
              <h2 className="text-xl font-black text-foreground">Проблема не в тебе</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
              Большинство людей не реализуют потенциал не потому, что недостаточно стараются. А потому что:
            </p>
            <ul className="space-y-3">
              {[
                "не понимают свои сильные стороны",
                "пытаются жить «как правильно», а не «как подходит им»",
                "выбирают неподходящий формат работы и нагрузки",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <Icon name="X" size={16} className="text-rose-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 bg-rose-50 border border-rose-100 rounded-xl p-4">
              <p className="text-sm font-medium text-foreground">
                👉 В результате — хаос, перегруз и постоянные сомнения
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-foreground">ПоДелам подойдёт, если ты:</h2>
            </div>
            <ul className="space-y-3">
              {fitList.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <Icon name="Check" size={16} className="text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                <Icon name="XCircle" size={20} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-black text-foreground">Сервис не подойдёт, если ты:</h2>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {notFitList.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Icon name="X" size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-muted-foreground border-t border-border pt-4">
              Честность — основа нашего подхода. Мы не обещаем магию, только конкретику.
            </p>
          </div>
        </div>
      </section>

      {/* ЧТО ПОЛУЧИШЬ */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Результат</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Не просто описание — а понимание себя и своего пути
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Разбор, который можно применять в жизни — без воды и абстрактных формулировок
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resultCards.map((card) => (
              <div
                key={card.text}
                className="flex items-center gap-4 rounded-2xl border border-border bg-background p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <Icon name={card.icon} fallback="Circle" size={20} className="text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">{card.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
