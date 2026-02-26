import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { CourseOffer } from "./courseOffers";

const LS_PREFIX = "course_promo_";

function getPromoState(courseId: string): { revealed: boolean; expiredAt: number | null; dismissed: boolean } {
  const raw = localStorage.getItem(LS_PREFIX + courseId);
  if (!raw) return { revealed: false, expiredAt: null, dismissed: false };
  return JSON.parse(raw);
}

function savePromoState(courseId: string, state: { revealed: boolean; expiredAt: number | null; dismissed: boolean }) {
  localStorage.setItem(LS_PREFIX + courseId, JSON.stringify(state));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Props = {
  course: CourseOffer;
};

export default function CourseRecommendation({ course }: Props) {
  const [promoRevealed, setPromoRevealed] = useState(false);
  const [expiredAt, setExpiredAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [expired, setExpired] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const state = getPromoState(course.id);
    if (state.dismissed) {
      setDismissed(true);
      return;
    }
    if (state.revealed && state.expiredAt) {
      const now = Date.now();
      if (now >= state.expiredAt) {
        setExpired(true);
        setDismissed(true);
        savePromoState(course.id, { ...state, dismissed: true });
      } else {
        setPromoRevealed(true);
        setExpiredAt(state.expiredAt);
        setSecondsLeft(Math.ceil((state.expiredAt - now) / 1000));
      }
    }
  }, [course.id]);

  useEffect(() => {
    if (!expiredAt) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const left = Math.ceil((expiredAt - now) / 1000);
      if (left <= 0) {
        setSecondsLeft(0);
        setExpired(true);
        setDismissed(true);
        savePromoState(course.id, { revealed: true, expiredAt, dismissed: true });
        clearInterval(interval);
      } else {
        setSecondsLeft(left);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiredAt, course.id]);

  const handleRevealPromo = useCallback(() => {
    const deadline = Date.now() + course.promoTtlMinutes * 60 * 1000;
    setPromoRevealed(true);
    setExpiredAt(deadline);
    setSecondsLeft(course.promoTtlMinutes * 60);
    savePromoState(course.id, { revealed: true, expiredAt: deadline, dismissed: false });
  }, [course]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(course.promoCode);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = course.promoCode;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [course.promoCode]);

  if (dismissed || expired) return null;

  return (
    <div className="mt-6 mb-2 rounded-2xl overflow-hidden border border-amber-200/60 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 shadow-lg shadow-amber-100/40">
      <div className="relative">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <span className="inline-block bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-1.5">
            Рекомендация по вашему профилю
          </span>
          <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">{course.title}</h3>
          <p className="text-white/80 text-xs mt-0.5">{course.subtitle}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {course.description}
        </p>

        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="flex items-center gap-1.5 text-amber-700 text-sm font-medium hover:text-amber-800 transition-colors"
        >
          <Icon name={showFeatures ? "ChevronUp" : "ChevronDown"} size={14} />
          {showFeatures ? "Скрыть программу" : "Что входит в курс"}
        </button>

        {showFeatures && (
          <div className="bg-white/70 rounded-xl p-3 space-y-1.5 border border-amber-100">
            {course.features.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <Icon name="Check" size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3 pt-1">
          <div>
            <span className="text-xs text-gray-400 line-through">{course.priceOriginal.toLocaleString("ru-RU")} &#8381;</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">{course.priceDiscount.toLocaleString("ru-RU")} &#8381;</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">-{course.discountPercent}%</span>
            </div>
          </div>
        </div>

        <a
          href={course.linkDetails}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-amber-700 text-sm font-medium hover:text-amber-800 transition-colors underline underline-offset-2"
        >
          <Icon name="ExternalLink" size={14} />
          Подробнее о курсе
        </a>

        {!promoRevealed ? (
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-4 border border-amber-200/60">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                <Icon name="Gift" size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">Получите промокод на скидку {course.discountPercent}%</p>
                <p className="text-xs text-gray-600 mt-1">
                  Скидка <span className="font-semibold">{(course.priceOriginal - course.priceDiscount).toLocaleString("ru-RU")} &#8381;</span>.
                  Промокод разовый и действует <span className="font-semibold">{course.promoTtlMinutes} минут</span> с момента получения.
                </p>
                <p className="text-xs text-red-500 mt-1.5 font-medium">
                  После истечения времени предложение исчезнет навсегда
                </p>
              </div>
            </div>
            <button
              onClick={handleRevealPromo}
              className="mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all text-sm shadow-md shadow-amber-200/50 active:scale-[0.98]"
            >
              Получить промокод
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Icon name="Ticket" size={16} className="text-white" />
                </div>
                <span className="font-bold text-gray-900 text-sm">Ваш промокод:</span>
              </div>
              <div className="flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                <Icon name="Clock" size={12} className="text-red-500" />
                <span className={`text-xs font-bold ${secondsLeft < 300 ? "text-red-600" : "text-red-500"}`}>
                  {formatTime(secondsLeft)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border-2 border-dashed border-emerald-300 rounded-lg px-4 py-2.5 text-center">
                <span className="font-mono font-extrabold text-xl tracking-widest text-gray-900">{course.promoCode}</span>
              </div>
              <button
                onClick={handleCopy}
                className={`p-2.5 rounded-lg transition-all ${copied ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                title="Скопировать"
              >
                <Icon name={copied ? "Check" : "Copy"} size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Введите промокод при оформлении заказа на сайте курса
            </p>

            <a
              href={course.linkBuy}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all text-sm text-center shadow-md shadow-emerald-200/50 active:scale-[0.98]"
            >
              Оформить заказ со скидкой
            </a>

            <p className="text-[11px] text-red-400 text-center font-medium">
              Промокод разовый. После истечения таймера предложение исчезнет и повторно не появится.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}