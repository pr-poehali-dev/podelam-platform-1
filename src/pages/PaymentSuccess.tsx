import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";

const YOOKASSA_URL = "https://functions.poehali.dev/1b07c03c-bee7-4b25-aeee-836e7331e044";

type PaymentStatus = "checking" | "paid" | "pending" | "failed";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  const [status, setStatus] = useState<PaymentStatus>("checking");
  const [amount, setAmount] = useState(0);
  const pollCount = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!paymentId) {
      setStatus("failed");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(YOOKASSA_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "status", payment_id: parseInt(paymentId) }),
        });
        const data = await res.json();

        if (data.status === "paid") {
          setStatus("paid");
          setAmount(data.amount || 0);

          try {
            const u = JSON.parse(localStorage.getItem("pdd_user") || "{}");
            if (u.email) {
              const key = `pdd_balance_${u.email}`;
              const current = parseFloat(localStorage.getItem(key) || "0");
              localStorage.setItem(key, String(current + (data.amount || 0)));
              window.dispatchEvent(new CustomEvent("pdd_balance_change"));
            }
          } catch (e) { console.log("sync", e); }

          return;
        }

        if (data.status === "failed") {
          setStatus("failed");
          return;
        }

        pollCount.current += 1;
        if (pollCount.current < 12) {
          timerRef.current = setTimeout(checkStatus, 3000);
        } else {
          setStatus("pending");
        }
      } catch {
        pollCount.current += 1;
        if (pollCount.current < 12) {
          timerRef.current = setTimeout(checkStatus, 3000);
        } else {
          setStatus("pending");
        }
      }
    };

    checkStatus();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paymentId]);

  return (
    <div className="min-h-screen font-golos flex items-center justify-center p-4" style={{ background: "hsl(248, 50%, 98%)" }}>
      <div className="w-full max-w-md">
        {status === "checking" && (
          <div className="bg-white rounded-3xl border border-border shadow-lg p-8 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-violet-50 flex items-center justify-center">
              <Icon name="Loader2" size={36} className="text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-foreground mb-2">Проверяем оплату...</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Подождите, мы подтверждаем ваш платёж. Обычно это занимает несколько секунд.
            </p>
          </div>
        )}

        {status === "paid" && (
          <div className="bg-white rounded-3xl border border-green-200 shadow-lg overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center text-white">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Icon name="CheckCircle" size={42} className="text-white" />
              </div>
              <h1 className="text-2xl font-black mb-1">Оплата прошла!</h1>
              {amount > 0 && (
                <p className="text-green-100 text-lg font-bold">+{amount} ₽ на ваш баланс</p>
              )}
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => navigate("/cabinet?tab=tools")}
                className="w-full gradient-brand text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
              >
                <Icon name="Compass" size={17} />
                Перейти к инструментам
              </button>
              <button
                onClick={() => navigate("/cabinet")}
                className="w-full border-2 border-border text-foreground font-bold py-3.5 rounded-2xl hover:bg-secondary transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Icon name="User" size={17} />
                В личный кабинет
              </button>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-lg overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-center text-white">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Icon name="Clock" size={42} className="text-white" />
              </div>
              <h1 className="text-2xl font-black mb-1">Платёж обрабатывается</h1>
              <p className="text-amber-100">Это может занять до 5 минут</p>
            </div>
            <div className="p-6">
              <p className="text-muted-foreground text-sm text-center mb-5 leading-relaxed">
                Деньги спишутся, и баланс обновится автоматически. Можете пока вернуться в кабинет.
              </p>
              <button
                onClick={() => navigate("/cabinet")}
                className="w-full gradient-brand text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
              >
                <Icon name="ArrowLeft" size={17} />
                Вернуться в кабинет
              </button>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="bg-white rounded-3xl border border-red-200 shadow-lg overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-br from-red-500 to-rose-600 p-8 text-center text-white">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Icon name="XCircle" size={42} className="text-white" />
              </div>
              <h1 className="text-2xl font-black mb-1">Оплата не прошла</h1>
              <p className="text-red-100">Деньги не списаны</p>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-muted-foreground text-sm text-center mb-2 leading-relaxed">
                Платёж был отклонён или отменён. Попробуйте ещё раз или используйте другую карту.
              </p>
              <button
                onClick={() => navigate("/cabinet?tab=tools")}
                className="w-full gradient-brand text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
              >
                <Icon name="RefreshCw" size={17} />
                Попробовать снова
              </button>
              <button
                onClick={() => navigate("/cabinet")}
                className="w-full border-2 border-border text-foreground font-bold py-3.5 rounded-2xl hover:bg-secondary transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Icon name="ArrowLeft" size={17} />
                В личный кабинет
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}