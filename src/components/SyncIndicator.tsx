import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

type Props = { syncing: boolean };

export default function SyncIndicator({ syncing }: Props) {
  const [visible, setVisible] = useState(false);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    if (syncing) {
      setVisible(true);
      setShowDone(false);
    } else if (visible) {
      setShowDone(true);
      const t = setTimeout(() => setVisible(false), 1600);
      return () => clearTimeout(t);
    }
  }, [syncing]);

  if (!visible) return null;

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground animate-in fade-in duration-300">
      {showDone ? (
        <>
          <Icon name="CheckCircle" size={13} className="text-emerald-500" />
          <span className="text-emerald-600">Сохранено</span>
        </>
      ) : (
        <>
          <Icon name="RefreshCw" size={13} className="animate-spin" />
          <span>Синхронизация…</span>
        </>
      )}
    </div>
  );
}
