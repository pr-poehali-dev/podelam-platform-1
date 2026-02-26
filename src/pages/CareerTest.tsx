import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  CAREER_QUESTIONS,
  CAREER_TYPES,
  CareerType,
  calcCareerResult,
} from "@/lib/careerTestEngine";
import { saveCareerResult } from "@/lib/access";
import useToolSync from "@/hooks/useToolSync";
import SyncIndicator from "@/components/SyncIndicator";

export default function CareerTest() {
  const navigate = useNavigate();
  const { saveSession, syncing } = useToolSync<Record<string, unknown>>("career-test", "career_sessions");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<CareerType[]>([]);
  const [animating, setAnimating] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calcCareerResult> | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) navigate("/auth");
  }, [navigate]);

  const q = CAREER_QUESTIONS[current];
  const progress = Math.round(((current) / CAREER_QUESTIONS.length) * 100);

  const choose = async (type: CareerType) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (current === CAREER_QUESTIONS.length - 1) {
      const res = calcCareerResult(newAnswers);
      setResult(res);
      const topInfo = CAREER_TYPES[res.topType];
      const careerData = {
        id: "",
        date: "",
        topType: res.topType,
        topTypeName: topInfo.name,
        topTypeDesc: topInfo.desc,
        professions: res.professions,
        scores: Object.entries(res.scores).map(([k, v]) => ({
          type: k,
          name: CAREER_TYPES[k as CareerType].name,
          score: v,
        })),
      };
      saveCareerResult(careerData);
      await saveSession(careerData);
      window.ym?.(107022183, 'reachGoal', 'career_test_completed');
      setDone(true);
      return;
    }

    setAnimating(true);
    setTimeout(() => {
      setCurrent(current + 1);
      setAnimating(false);
    }, 250);
  };

  const goBack = () => {
    if (current === 0) { navigate("/cabinet"); return; }
    setAnimating(true);
    setTimeout(() => {
      setCurrent(current - 1);
      setAnswers(answers.slice(0, -1));
      setAnimating(false);
    }, 200);
  };

  if (done && result) {
    const top = CAREER_TYPES[result.topType];
    const second = CAREER_TYPES[result.secondType];
    return (
      <div className="min-h-screen font-golos gradient-soft">
        <header className="bg-white/80 backdrop-blur border-b border-border">
          <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
            <button onClick={() => navigate("/cabinet")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
              <Icon name="ChevronLeft" size={18} />
              Кабинет
            </button>
            <span className="font-bold text-foreground text-sm">ПоДелам</span>
            <div />
          </div>
        </header>

        <div className="max-w-xl mx-auto px-6 py-10 space-y-5 animate-fade-in-up">
          {/* Главный результат */}
          <div className="gradient-brand rounded-3xl p-6 text-white">
            <div className="text-4xl mb-3">{top.emoji}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Твой тип</div>
            <h1 className="text-2xl font-black mb-2">{top.name} тип</h1>
            <p className="text-white/85 text-sm leading-relaxed">{top.desc}</p>
            <div className="mt-4 bg-white/15 rounded-xl px-4 py-2 inline-flex items-center gap-2">
              <Icon name="BarChart2" size={14} />
              <span className="text-sm font-bold">{result.topScore}% совпадение</span>
            </div>
          </div>

          {/* Второй тип */}
          <div className="bg-white rounded-3xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{second.emoji}</span>
              <div>
                <div className="text-xs text-muted-foreground">Также выражен</div>
                <div className="font-bold text-foreground">{second.name} тип</div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">{second.desc}</p>
          </div>

          {/* Рекомендованные профессии */}
          <div className="bg-white rounded-3xl border border-border p-5">
            <h3 className="font-bold text-foreground mb-3">Подходящие профессии</h3>
            <div className="flex flex-wrap gap-2">
              {result.professions.map((p) => (
                <span key={p} className="bg-violet-50 text-violet-700 text-sm font-medium px-3 py-1.5 rounded-xl border border-violet-100">{p}</span>
              ))}
            </div>
          </div>

          {/* Важная оговорка */}
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
            <div className="flex items-start gap-3">
              <Icon name="Lightbulb" size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800 mb-1">Это рациональный взгляд</h4>
                <p className="text-amber-700 text-sm leading-relaxed">
                  {top.insight}
                </p>
                <p className="text-amber-700 text-sm leading-relaxed mt-2">
                  Пройди психологический анализ, чтобы узнать — что <strong>действительно</strong> принесёт тебе удовольствие и успех от деятельности.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/psych-bot")}
              className="w-full gradient-brand text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Icon name="Brain" size={18} />
              Пройти психологический анализ
            </button>
            <button
              onClick={() => navigate("/cabinet")}
              className="w-full bg-white border border-border text-muted-foreground font-medium py-3 rounded-2xl text-sm hover:bg-secondary transition-colors"
            >
              Вернуться в кабинет
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-golos gradient-soft flex flex-col">
      <header className="bg-white/80 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={goBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <Icon name="ChevronLeft" size={18} />
            {current === 0 ? "Кабинет" : "Назад"}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Icon name="Compass" size={13} className="text-white" />
            </div>
            <span className="font-bold text-foreground text-sm">ПоДелам</span>
          </div>
          <SyncIndicator syncing={syncing} />
          <div className="text-sm text-muted-foreground">{current + 1} / {CAREER_QUESTIONS.length}</div>
        </div>
        <div className="h-1 bg-secondary">
          <div
            className="h-full gradient-brand transition-all duration-500 ease-out"
            style={{ width: `${progress + (100 / CAREER_QUESTIONS.length)}%` }}
          />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className={`w-full max-w-xl transition-all duration-250 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
          <div className="mb-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Тест на профессию</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-foreground mb-8 leading-snug">{q.text}</h2>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => choose(opt.type)}
                className="w-full text-left px-6 py-4 rounded-2xl border border-border bg-white hover:border-primary/50 hover:bg-accent/30 transition-all duration-150 font-medium text-foreground text-[15px] group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-secondary text-muted-foreground text-xs font-bold flex items-center justify-center group-hover:gradient-brand group-hover:text-white transition-all shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}