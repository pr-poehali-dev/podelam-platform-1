interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'info';
  alertOnly?: boolean;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = 'Да',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  variant = 'danger',
  alertOnly = false
}: ConfirmDialogProps) => {
  if (!open) return null;

  const icon = variant === 'danger' ? '⚠️' : 'ℹ️';
  const confirmBg = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-blue-600 hover:bg-blue-700';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={onCancel}>
      <div className="bg-stone-900 rounded-xl border border-stone-700 p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className="text-3xl mb-3">{icon}</div>
          {title && <h2 className="text-lg font-bold text-stone-100 mb-2">{title}</h2>}
          <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-line">{message}</p>
        </div>
        <div className="flex gap-3">
          {!alertOnly && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg font-medium transition-colors text-sm"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 ${confirmBg} text-white rounded-lg font-medium transition-colors text-sm`}
          >
            {alertOnly ? 'Понятно' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;