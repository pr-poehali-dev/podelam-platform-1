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
  rules_accepted: boolean;
};

export default function CabinetReferralTab({ user }: { user: User }) {
  const [info, setInfo] = useState<RefInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [accepting, setAccepting] = useState(false);

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

  const acceptRules = async () => {
    setAccepting(true);
    const res = await fetch(REFERRAL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept_rules", email: user.email }),
    });
    const data = await res.json();
    if (data.ok) {
      setInfo((prev) => prev ? { ...prev, rules_accepted: true } : prev);
      setShowRules(false);
    }
    setAccepting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  const rulesAccepted = info?.rules_accepted ?? false;

  if (showRules) {
    return <PartnerRules onAccept={acceptRules} accepting={accepting} onBack={() => setShowRules(false)} />;
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
          {(info?.ref_balance ?? 0) > 0 && rulesAccepted && (
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

      {!rulesAccepted ? (
        <div className="bg-white rounded-2xl border border-border p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-50 flex items-center justify-center">
            <Icon name="FileText" size={24} className="text-violet-600" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Примите правила партнёрской программы</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Чтобы получить доступ к реферальной ссылке и начать зарабатывать, ознакомьтесь и примите правила программы.
          </p>
          <button
            onClick={() => setShowRules(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all"
          >
            <Icon name="BookOpen" size={16} />
            Ознакомиться с правилами
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-foreground">Ваша реферальная ссылка</div>
              <button
                onClick={() => setShowRules(true)}
                className="text-xs text-muted-foreground hover:text-violet-600 transition-colors flex items-center gap-1"
              >
                <Icon name="FileText" size={12} />
                Правила программы
              </button>
            </div>
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
        </>
      )}

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

function PartnerRules({
  onAccept,
  accepting,
  onBack,
}: {
  onAccept: () => void;
  accepting: boolean;
  onBack: () => void;
}) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) {
      setScrolledToBottom(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeft" size={16} />
          Назад
        </button>
        <h2 className="text-xl font-extrabold text-foreground">Правила партнёрской программы</h2>
      </div>

      <div
        onScroll={handleScroll}
        className="bg-white rounded-2xl border border-border p-6 md:p-8 max-h-[60vh] overflow-y-auto text-[15px] leading-relaxed text-foreground space-y-5"
      >
        <h3 className="text-base font-bold">1. Общие положения</h3>
        <p>1.1. Партнёрская программа проекта «ПоДелам» предоставляет пользователям возможность получать вознаграждение за привлечение новых клиентов в проект.</p>
        <p>1.2. Участие в программе является добровольным и осуществляется на условиях, изложенных в настоящих Правилах.</p>
        <p>1.3. Участником программы может стать зарегистрированный пользователь проекта.</p>

        <h3 className="text-base font-bold">2. Реферальная ссылка</h3>
        <p>2.1. Каждому пользователю в личном кабинете автоматически предоставляется персональная реферальная ссылка.</p>
        <p>2.2. Реферальная ссылка ведёт на статьи и материалы проекта.</p>
        <p>2.3. Пользователь вправе самостоятельно размещать и передавать свою ссылку любым законным способом, не нарушающим законодательство РФ и права третьих лиц.</p>
        <p>2.4. Запрещается:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>использовать спам-рассылки;</li>
          <li>вводить пользователей в заблуждение;</li>
          <li>давать ложные гарантии дохода или результатов;</li>
          <li>использовать запрещённые способы рекламы.</li>
        </ul>

        <h3 className="text-base font-bold">3. Начисление партнёрского вознаграждения</h3>
        <p>3.1. Если привлечённый по реферальной ссылке пользователь оплачивает продукты проекта, партнёру начисляется вознаграждение в размере 20% от фактически оплаченной суммы.</p>
        <p>3.2. Вознаграждение начисляется на партнёрский счёт в личном кабинете.</p>
        <p>3.3. Начисление производится только за фактически оплаченные и не возвращённые заказы.</p>
        <p>3.4. В случае возврата денежных средств привлечённому пользователю начисленное вознаграждение аннулируется.</p>

        <h3 className="text-base font-bold">4. Использование партнёрских средств</h3>
        <p>4.1. Начисленные средства партнёр может:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>перевести на внутренний баланс проекта;</li>
          <li>использовать для оплаты продуктов проекта.</li>
        </ul>
        <p>4.2. Перевод средств с партнёрского счёта на баланс осуществляется через личный кабинет.</p>

        <h3 className="text-base font-bold">5. Вывод денежных средств</h3>
        <p>5.1. Партнёр вправе подать заявку на вывод средств при соблюдении следующих условий:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>сумма начисленного вознаграждения за один календарный месяц составляет не менее 50 000 (пятидесяти тысяч) рублей;</li>
          <li>заключён партнёрский договор с проектом.</li>
        </ul>
        <p>5.2. Выплата производится не ранее чем через 1 календарный месяц с даты подачи заявки на вывод.</p>
        <p className="text-sm text-muted-foreground italic">Пример: если заявка подана 5 марта, выплата производится не ранее 5 апреля.</p>
        <p>5.3. Выплаты осуществляются за вычетом налогов и обязательных платежей в соответствии с законодательством РФ.</p>
        <p>5.4. Проект вправе запросить документы, необходимые для заключения договора и проведения выплаты.</p>

        <h3 className="text-base font-bold">6. Налогообложение</h3>
        <p>6.1. Порядок налогообложения определяется в рамках заключаемого партнёрского договора и в соответствии с действующим законодательством РФ.</p>
        <p>6.2. Партнёр несёт ответственность за соблюдение своих налоговых обязательств в случае, если это предусмотрено договором.</p>

        <h3 className="text-base font-bold">7. Ограничения и право приостановки участия</h3>
        <p>7.1. Проект вправе приостановить начисление вознаграждения или исключить участника из партнёрской программы в случае:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>нарушения настоящих Правил;</li>
          <li>выявления мошеннических действий;</li>
          <li>попыток искусственного создания оплат;</li>
          <li>злоупотребления системой.</li>
        </ul>
        <p>7.2. В случае выявления нарушений начисленные средства могут быть аннулированы.</p>

        <h3 className="text-base font-bold">8. Заключительные положения</h3>
        <p>8.1. Проект вправе вносить изменения в настоящие Правила. Актуальная версия публикуется на сайте.</p>
        <p>8.2. Участие в партнёрской программе означает согласие пользователя с настоящими Правилами.</p>
      </div>

      {!scrolledToBottom && (
        <p className="text-xs text-center text-muted-foreground animate-pulse">
          Прокрутите до конца, чтобы принять правила
        </p>
      )}

      <button
        onClick={onAccept}
        disabled={!scrolledToBottom || accepting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl gradient-brand text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Icon name="CheckCircle" size={16} />
        {accepting ? "Сохраняем..." : "Я ознакомился и принимаю правила"}
      </button>
    </div>
  );
}
