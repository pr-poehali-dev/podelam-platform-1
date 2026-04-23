import Icon from "@/components/ui/icon";
import BalanceTopUpModal from "@/components/BalanceTopUpModal";
import { SIMULATOR_PRICE, SIMULATOR_DAYS } from "@/lib/access";

interface SimulatorProPaymentModalProps {
  showPayment: boolean;
  paying: boolean;
  balance: number;
  showTopUp: boolean;
  onPaymentConfirm: () => void;
  onPaymentClose: () => void;
  onTopUpClose: () => void;
  onTopUpSuccess: () => void;
}

export default function SimulatorProPaymentModal({
  showPayment,
  paying,
  balance,
  showTopUp,
  onPaymentConfirm,
  onPaymentClose,
  onTopUpClose,
  onTopUpSuccess,
}: SimulatorProPaymentModalProps) {
  return (
    <>
      {/* PAYMENT MODAL */}
      {showPayment && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onPaymentClose}
        >
          <div
            className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="Cpu" size={30} className="text-slate-700" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Симулятор решений</h3>
              <p className="text-sm text-slate-500 mt-1">Полный доступ на {SIMULATOR_DAYS} дней</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-center">
              <div className="flex items-end justify-center gap-1 mb-1">
                <span className="text-4xl font-black text-slate-900">{SIMULATOR_PRICE}</span>
                <span className="text-xl font-bold text-slate-400 mb-1">₽</span>
              </div>
              <p className="text-xs text-slate-400">/ {SIMULATOR_DAYS} дней · отдельно от подписки</p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {["До 20 сценариев", "До 3 вариантов", "PDF-отчёт"].map((t) => (
                  <span key={t} className="text-[11px] bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>

            {balance > 0 && (
              <p className="text-center text-xs text-slate-500 mb-3">
                На балансе: <span className="font-semibold text-slate-700">{balance} ₽</span>
                {balance < SIMULATOR_PRICE && (
                  <span className="text-orange-500"> · не хватает {SIMULATOR_PRICE - balance} ₽</span>
                )}
              </p>
            )}

            <button
              onClick={onPaymentConfirm}
              disabled={paying}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl text-sm transition-colors disabled:opacity-60 mb-2"
            >
              {paying ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Оплачиваем...
                </span>
              ) : balance >= SIMULATOR_PRICE ? (
                `Списать ${SIMULATOR_PRICE} ₽ с баланса`
              ) : (
                "Пополнить баланс"
              )}
            </button>
            <button
              onClick={onPaymentClose}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {showTopUp && (
        <BalanceTopUpModal
          onClose={onTopUpClose}
          onSuccess={onTopUpSuccess}
        />
      )}
    </>
  );
}
