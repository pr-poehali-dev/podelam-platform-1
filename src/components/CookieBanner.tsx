import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie_accepted");
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_accepted", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-2xl mx-auto bg-white border border-border rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-sm text-foreground/80 flex-1">
          Мы используем куки для корректной работы сайта и улучшения вашего опыта.{" "}
          <Link to="/privacy" className="text-primary underline underline-offset-2 hover:opacity-80">
            Политика конфиденциальности
          </Link>
        </p>
        <button
          onClick={accept}
          className="shrink-0 bg-primary text-white text-sm font-medium px-5 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          Понятно
        </button>
      </div>
    </div>
  );
}
