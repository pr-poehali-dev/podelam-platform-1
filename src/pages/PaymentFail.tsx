import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function PaymentFail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-golos flex items-center justify-center p-4" style={{ background: "hsl(248, 50%, 98%)" }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-red-200 shadow-lg overflow-hidden animate-scale-in">
          <div className="bg-gradient-to-br from-red-500 to-rose-600 p-8 text-center text-white">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Icon name="XCircle" size={42} className="text-white" />
            </div>
            <h1 className="text-2xl font-black mb-1">Оплата не прошла</h1>
            <p className="text-red-100">Деньги не были списаны с вашей карты</p>
          </div>
          <div className="p-6">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5">
              <p className="text-sm text-red-700 leading-relaxed">
                Возможные причины: недостаточно средств, ограничения банка или карта не поддерживает онлайн-оплату. Попробуйте другую карту или обратитесь в банк.
              </p>
            </div>
            <div className="space-y-3">
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
        </div>
      </div>
    </div>
  );
}
