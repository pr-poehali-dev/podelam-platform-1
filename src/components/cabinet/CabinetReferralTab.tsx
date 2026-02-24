import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { User } from "./cabinetTypes";

const REFERRAL_API = "https://functions.poehali.dev/e12a9bfa-2323-4049-a1be-90316b4d432e";

type RefInfo = {
  ref_code: string;
  ref_balance: number;
  referrals_count: number;
  total_earned: number;
  history: { amount: number; date: string; referral_name: string; tariff: string }[];
};

export default function CabinetReferralTab({ user }: { user: User }) {
  const [info, setInfo] = useState<RefInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    fetch(`${REFERRAL_API}?action=info&email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((data) => {
        setInfo(data);
        if (data.ref_code) localStorage.setItem(`pdd_ref_code_${user.email}`, data.ref_code);
      })
      .finally(() => setLoading(false));
  }, [user.email]);

  const copyLink = async () => {
    if (!info?.ref_code) return;
    const url = `https://podelam.su/blog?ref=${info.ref_code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Скопируйте ссылку:", url);
    }
  };

  const useBonus = async () => {
    if (!info || info.ref_balance <= 0) return;
    setTransferring(true);
    const res = await fetch(REFERRAL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "use_bonus", email: user.email, amount: info.ref_balance }),
    });
    const data = await res.json();
    if (data.ok) {
      localStorage.setItem(`pdd_balance_${user.email}`, String(data.balance));
      window.dispatchEvent(new CustomEvent("pdd_balance_change"));
      setInfo((prev) => prev ? { ...prev, ref_balance: data.ref_balance } : prev);
    }
    setTransferring(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Реферальная программа</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Делитесь ссылкой — получайте 20% от каждой оплаты приглашённого
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Icon name="Users" size={15} />
            Приглашено
          </div>
          <div className="text-2xl font-black text-foreground">{info?.referrals_count ?? 0}</div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Icon name="TrendingUp" size={15} />
            Заработано всего
          </div>
          <div className="text-2xl font-black text-foreground">{info?.total_earned ?? 0} ₽</div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Icon name="Wallet" size={15} />
            Бонусный баланс
          </div>
          <div className="text-2xl font-black text-violet-700">{info?.ref_balance ?? 0} ₽</div>
          {(info?.ref_balance ?? 0) > 0 && (
            <button
              onClick={useBonus}
              disabled={transferring}
              className="mt-2 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors disabled:opacity-50"
            >
              {transferring ? "Переводим..." : "Перевести на основной баланс →"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="text-sm font-semibold text-foreground mb-3">Ваша реферальная ссылка</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-muted-foreground truncate font-mono">
            {info?.ref_code ? `https://podelam.su/blog?ref=${info.ref_code}` : "Загрузка..."}
          </div>
          <button
            onClick={copyLink}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl gradient-brand text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all"
          >
            <Icon name={copied ? "Check" : "Copy"} size={15} />
            {copied ? "Скопировано" : "Скопировать"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Также в каждой статье блога есть кнопка «Поделиться» — она автоматически подставит вашу реферальную ссылку.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="text-sm font-semibold text-foreground mb-3">Как это работает</div>
        <div className="space-y-3">
          {[
            { icon: "Link", text: "Вы делитесь ссылкой на статью или главную блога" },
            { icon: "UserPlus", text: "Человек переходит, регистрируется по вашей ссылке" },
            { icon: "CreditCard", text: "Когда он оплачивает любой инструмент или подписку" },
            { icon: "Gift", text: "Вам начисляется 20% от суммы оплаты на бонусный баланс" },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-violet-50 flex items-center justify-center">
                <Icon name={step.icon} size={15} className="text-violet-600" />
              </div>
              <p className="text-sm text-foreground pt-1">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {info?.history && info.history.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="text-sm font-semibold text-foreground mb-3">История начислений</div>
          <div className="space-y-2">
            {info.history.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div>
                  <div className="text-sm font-medium text-foreground">{h.referral_name}</div>
                  <div className="text-xs text-muted-foreground">{h.tariff} · {new Date(h.date).toLocaleDateString("ru-RU")}</div>
                </div>
                <div className="text-sm font-bold text-green-600">+{h.amount} ₽</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}