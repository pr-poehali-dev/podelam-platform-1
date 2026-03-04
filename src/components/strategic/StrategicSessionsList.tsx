import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { StrategicSession } from "@/lib/proTrainerTypes";

const TOTAL_STEPS = 7;

type Props = {
  trainerTitle: string;
  expiresLabel: string | null;
  sessions: StrategicSession[];
  onNewSession: () => void;
  onResumeSession: (s: StrategicSession) => void;
  onDeleteSession: (id: string) => void;
};

export default function StrategicSessionsList({
  trainerTitle,
  expiresLabel,
  sessions,
  onNewSession,
  onResumeSession,
  onDeleteSession,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">{trainerTitle}</h1>
          {expiresLabel && (
            <p className="text-xs text-slate-500">Доступ до {expiresLabel}</p>
          )}
        </div>
        <Button
          onClick={onNewSession}
          className="bg-slate-950 text-white hover:bg-slate-800 h-10"
        >
          <Icon name="Plus" size={16} />
          Новая стратегия
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="Brain" size={24} className="text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-2">Нет сессий</h3>
          <p className="text-sm text-slate-500 mb-6">
            Начните первую стратегическую сессию
          </p>
          <Button
            onClick={onNewSession}
            className="bg-slate-950 text-white hover:bg-slate-800"
          >
            Начать
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const isCompleted = s.currentStep >= 7;
            const stepLabel = isCompleted
              ? "Завершено"
              : `Этап ${s.currentStep} из 6`;
            const dateLabel = new Date(s.createdAt).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all cursor-pointer group"
                onClick={() => onResumeSession(s)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {s.data.step0?.name || "Без названия"}
                      </h3>
                      {isCompleted && s.results && (
                        <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                          {s.results.osi}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{dateLabel}</span>
                      <span
                        className={`${
                          isCompleted ? "text-emerald-600" : "text-slate-500"
                        }`}
                      >
                        {stepLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id);
                      }}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                    <Icon
                      name={isCompleted ? "Eye" : "ArrowRight"}
                      size={16}
                      className="text-slate-400"
                    />
                  </div>
                </div>
                {!isCompleted && (
                  <div className="mt-3">
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all"
                        style={{ width: `${(s.currentStep / TOTAL_STEPS) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
