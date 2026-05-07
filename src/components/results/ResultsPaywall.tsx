import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { PLAN_30, MONETIZATION } from "@/components/psych-bot/psychBotData";

const OFFER_KEY = "pdd_offer_expires";
const OFFER_DURATION = 24 * 60 * 60 * 1000;

function useOfferTimer() {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    let expires = Number(localStorage.getItem(OFFER_KEY));
    if (!expires || expires < Date.now()) {
      expires = Date.now() + OFFER_DURATION;
      localStorage.setItem(OFFER_KEY, String(expires));
    }

    const tick = () => {
      const left = Math.max(0, Math.floor((expires - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const h = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const m = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const s = String(secondsLeft % 60).padStart(2, "0");
  return { h, m, s, expired: secondsLeft === 0 };
}

interface ResultsPaywallProps {
  payLoading: boolean;
  payError: string;
  onPayClick: () => void;
  topSeg: string;
}

export default function ResultsPaywall({ payLoading, payError, onPayClick, topSeg }: ResultsPaywallProps) {
  const { h, m, s, expired } = useOfferTimer();
  const plan = PLAN_30[topSeg] ?? PLAN_30["analytics"];
  const firstStep = plan[0];
  const monetization = MONETIZATION[topSeg] ?? MONETIZATION["analytics"];

  return (
    <div className="bg-white rounded-2xl border-2 border-violet-200 overflow-hidden">
      {/* Заблюренный превью */}
      <div className="relative">
        <div className="p-5 blur-[3px] pointer-events-none select-none opacity-60">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <Icon name="Lock" size={16} className="text-violet-400" />
            </div>
            <h2 className="font-bold text-foreground">Полная картина твоего состояния</h2>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
            <div className="h-4 bg-gray-200 rounded w-full mt-3" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-violet-600 text-white rounded-xl px-4 py-2 text-sm font-bold shadow-lg flex items-center gap-2">
            <Icon name="Lock" size={14} />
            Скрыто
          </div>
        </div>
      </div>

      {/* Таймер */}
      {!expired && (
        <div className="bg-amber-50 border-t border-amber-100 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Clock" size={15} className="text-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-amber-700">Цена 290 ₽ действует ещё:</span>
          </div>
          <div className="flex items-center gap-1 font-black text-amber-700 tabular-nums text-sm">
            <span className="bg-amber-100 rounded-lg px-2 py-0.5">{h}</span>
            <span>:</span>
            <span className="bg-amber-100 rounded-lg px-2 py-0.5">{m}</span>
            <span>:</span>
            <span className="bg-amber-100 rounded-lg px-2 py-0.5">{s}</span>
          </div>
        </div>
      )}

      {/* Оффер */}
      <div className="p-5 border-t border-violet-100 bg-violet-50/50">
        <p className="text-xs text-violet-500 font-semibold uppercase tracking-wide mb-2">Разбор готов — осталось открыть</p>
        <h3 className="text-lg font-black text-foreground mb-1">Что делать дальше — конкретно</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Ты уже видишь, что тебя тормозит. Теперь — пошаговый план: как зарабатывать в своей модели без выгорания и попыток «как все».
        </p>

        {/* Крючок — превью плана */}
        <div className="rounded-xl border border-violet-100 overflow-hidden mb-5">
          <div className="bg-violet-50 px-4 py-2 flex items-center gap-2 border-b border-violet-100">
            <Icon name="CalendarDays" size={14} className="text-violet-500" />
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wide">Твой план на 30 дней</span>
          </div>
          {/* Первый шаг — виден */}
          <div className="px-4 py-3 flex items-start gap-3 bg-white">
            <div className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</div>
            <p className="text-sm text-foreground leading-relaxed">{firstStep.replace(/^Неделя \d+ — /, "")}</p>
          </div>
          {/* Недели 2–4 — заблюрены */}
          <div className="relative">
            <div className="px-4 py-3 space-y-2.5 blur-[4px] select-none pointer-events-none bg-white border-t border-border/40">
              {plan.slice(1).map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 2}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.replace(/^Неделя \d+ — /, "")}</p>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 border border-violet-200 rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm">
                <Icon name="Lock" size={13} className="text-violet-500" />
                <span className="text-xs font-bold text-violet-600">Открывается после оплаты</span>
              </div>
            </div>
          </div>
        </div>

        {/* Крючок — превью монетизации */}
        <div className="rounded-xl border border-emerald-100 overflow-hidden mb-5">
          <div className="bg-emerald-50 px-4 py-2 flex items-center gap-2 border-b border-emerald-100">
            <Icon name="TrendingUp" size={14} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Стратегии монетизации</span>
          </div>
          {/* Старт — виден */}
          <div className="px-4 py-3 bg-white flex items-start gap-3">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 mt-0.5">Старт</span>
            <p className="text-sm text-foreground leading-relaxed">{monetization.start}</p>
          </div>
          {/* Рост и масштаб — заблюрены */}
          <div className="relative">
            <div className="px-4 py-3 space-y-2.5 blur-[4px] select-none pointer-events-none bg-white border-t border-border/40">
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full shrink-0 mt-0.5">Рост</span>
                <p className="text-sm text-muted-foreground leading-relaxed">{monetization.mid}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full shrink-0 mt-0.5">Масштаб</span>
                <p className="text-sm text-muted-foreground leading-relaxed">{monetization.scale}</p>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 border border-emerald-200 rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm">
                <Icon name="Lock" size={13} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">Открывается после оплаты</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {[
            "Как выстроить доход без постоянного выгорания",
            "Персональные тренажёры под твои задачи",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Icon name="CheckCircle" size={15} className="text-violet-600 shrink-0" />
              <span className="text-sm text-foreground">{item}</span>
            </div>
          ))}
        </div>

        {payError && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-3 border border-red-100">
            {payError}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-muted-foreground line-through text-sm">590 ₽</span>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">−50%</span>
          <span className="text-foreground font-black text-xl">290 ₽</span>
        </div>

        <button
          onClick={onPayClick}
          disabled={payLoading}
          className="w-full gradient-brand text-white font-black py-4 rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
        >
          {payLoading ? (
            <><Icon name="Loader2" size={18} className="animate-spin" /> Обработка...</>
          ) : (
            <><Icon name="Unlock" size={18} /> Открыть мой полный разбор</>
          )}
        </button>
        <p className="text-center text-xs text-muted-foreground mt-2">Разовый платёж · Доступ навсегда</p>
      </div>
    </div>
  );
}