import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    const android = /android/i.test(ua);
    setIsIOS(ios);
    setIsAndroid(android);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    } else {
      setShowHint(true);
    }
  };

  const handleClick = () => {
    if (isIOS) {
      setShowHint(true);
    } else {
      handleInstall();
    }
  };

  if (installed) return null;
  if (!isIOS && !isAndroid) return null;

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        title="Установить приложение"
      >
        <div className="w-6 h-6 rounded-md gradient-brand flex items-center justify-center shrink-0">
          <Icon name="Compass" size={12} className="text-white" />
        </div>
        <span>Установить приложение</span>
      </button>

      {showHint && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" onClick={() => setShowHint(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                <Icon name="Compass" size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-foreground">Установить ПоДелам</p>
                <p className="text-xs text-muted-foreground">
                  {isIOS ? "на главный экран iPhone" : "на главный экран Android"}
                </p>
              </div>
            </div>

            {isIOS ? (
              <ol className="space-y-3 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <span>Нажмите кнопку <strong>«Поделиться»</strong> ⬆️ внизу браузера Safari</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <span>Выберите <strong>«На экран «Домой»»</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <span>Нажмите <strong>«Добавить»</strong></span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-3 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <span>Нажмите <strong>⋮</strong> (три точки) в правом верхнем углу Chrome</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <span>Выберите <strong>«Добавить на главный экран»</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <span>Нажмите <strong>«Добавить»</strong></span>
                </li>
              </ol>
            )}

            <button
              onClick={() => setShowHint(false)}
              className="mt-5 w-full gradient-brand text-white font-bold py-3 rounded-xl text-sm"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </>
  );
}
