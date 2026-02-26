import { useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import Icon from "@/components/ui/icon";

const BANNER_SIZE = 1080;

function DownloadBtn({ nodeRef, filename }: { nodeRef: React.RefObject<HTMLDivElement>; filename: string }) {
  const handleDownload = useCallback(async () => {
    if (!nodeRef.current) return;
    const url = await toPng(nodeRef.current, { width: BANNER_SIZE, height: BANNER_SIZE, pixelRatio: 1 });
    const a = document.createElement("a");
    a.href = url;
    a.download = filename + ".png";
    a.click();
  }, [nodeRef, filename]);

  return (
    <button onClick={handleDownload} className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
      <Icon name="Download" size={16} />
      Скачать PNG
    </button>
  );
}

function BannerWrapper({ children, title, id }: { children: React.ReactNode; title: string; id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="border border-border rounded-2xl overflow-hidden" style={{ maxWidth: 540 }}>
        <div
          ref={ref}
          style={{ width: BANNER_SIZE, height: BANNER_SIZE, transform: "scale(0.5)", transformOrigin: "top left", marginBottom: -BANNER_SIZE / 2 }}
        >
          {children}
        </div>
      </div>
      <DownloadBtn nodeRef={ref} filename={id} />
    </div>
  );
}

function Banner1() {
  return (
    <div style={{ width: 1080, height: 1080, position: "relative", overflow: "hidden", background: "linear-gradient(150deg, #1a0a3e 0%, #3b1d8e 40%, #6c3fc7 70%, #9b6ff0 100%)", fontFamily: "'Golos Text', sans-serif" }}>
      <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,111,240,0.4) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,60,200,0.3) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: 60, left: 70, right: 70, bottom: 60, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", borderRadius: 50, padding: "12px 28px", marginBottom: 50 }}>
            <span style={{ color: "#e0d4ff", fontSize: 28, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>Бесплатный тест</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 82, fontWeight: 800, lineHeight: 1.1, margin: 0, marginBottom: 30 }}>
            Какая профессия<br />создана для тебя?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 36, lineHeight: 1.5, maxWidth: 700, margin: 0 }}>
            Научный тест определит твои сильные стороны и подберёт идеальное направление
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: "24px 52px", display: "inline-block" }}>
            <span style={{ color: "#3b1d8e", fontSize: 32, fontWeight: 800 }}>Пройти тест →</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 26 }}>2 минуты · Бесплатно</span>
        </div>
      </div>
    </div>
  );
}

function Banner2() {
  return (
    <div style={{ width: 1080, height: 1080, position: "relative", overflow: "hidden", background: "#0d0d0d", fontFamily: "'Golos Text', sans-serif" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 700, borderRadius: "50%", background: "conic-gradient(from 180deg, #6c3fc7, #ff6b6b, #ffd93d, #6c3fc7)", opacity: 0.15, filter: "blur(80px)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 80 }}>
        <div style={{ fontSize: 80, marginBottom: 30 }}>🎯</div>
        <h1 style={{ color: "#fff", fontSize: 74, fontWeight: 800, lineHeight: 1.15, margin: 0, marginBottom: 24 }}>
          Не знаешь,<br />чем заниматься?
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 34, lineHeight: 1.5, margin: 0, marginBottom: 50, maxWidth: 750 }}>
          Пройди бесплатный тест и узнай профессию, в которой ты раскроешь свой потенциал
        </p>
        <div style={{ background: "linear-gradient(135deg, #6c3fc7, #9b6ff0)", borderRadius: 24, padding: "28px 64px", display: "inline-block" }}>
          <span style={{ color: "#fff", fontSize: 34, fontWeight: 700 }}>Узнать свою профессию</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 24, marginTop: 24 }}>Результат мгновенно · Без регистрации</p>
      </div>
    </div>
  );
}

function Banner3() {
  return (
    <div style={{ width: 1080, height: 1080, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #faf8ff 0%, #ede5ff 100%)", fontFamily: "'Golos Text', sans-serif" }}>
      <div style={{ position: "absolute", top: -200, right: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,63,199,0.12) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -150, left: -50, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,111,240,0.1) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: 70, left: 70, right: 70, bottom: 70, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", gap: 16, marginBottom: 50 }}>
            {["💼", "🎨", "💻", "📊", "🏥"].map((e, i) => (
              <div key={i} style={{ width: 72, height: 72, borderRadius: 20, background: "#fff", boxShadow: "0 4px 20px rgba(108,63,199,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{e}</div>
            ))}
          </div>
          <h1 style={{ color: "#1a0a3e", fontSize: 76, fontWeight: 800, lineHeight: 1.12, margin: 0, marginBottom: 28 }}>
            Найди профессию<br />мечты за 2 минуты
          </h1>
          <p style={{ color: "#6b5b8a", fontSize: 34, lineHeight: 1.5, margin: 0, maxWidth: 700 }}>
            Тест на основе психологических методик покажет, в какой сфере ты добьёшься успеха
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ background: "linear-gradient(135deg, #3b1d8e, #6c3fc7)", borderRadius: 22, padding: "24px 50px" }}>
            <span style={{ color: "#fff", fontSize: 32, fontWeight: 700 }}>Пройти бесплатно →</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
            <span style={{ color: "#3b1d8e", fontSize: 22, fontWeight: 700 }}>12 000+ прошли</span>
            <span style={{ color: "#9b8ab5", fontSize: 20 }}>Результат сразу</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Banner4() {
  return (
    <div style={{ width: 1080, height: 1080, position: "relative", overflow: "hidden", background: "#1a0a3e", fontFamily: "'Golos Text', sans-serif" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 53px, rgba(108,63,199,0.08) 53px, rgba(108,63,199,0.08) 54px), repeating-linear-gradient(90deg, transparent, transparent 53px, rgba(108,63,199,0.08) 53px, rgba(108,63,199,0.08) 54px)" }} />
      <div style={{ position: "absolute", top: 70, left: 70, right: 70, bottom: 70, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: 14, marginBottom: 40, flexWrap: "wrap" as const }}>
            {["Маркетолог", "Дизайнер", "Психолог", "Разработчик", "Массажист"].map((p, i) => (
              <div key={i} style={{ background: "rgba(108,63,199,0.25)", border: "1px solid rgba(155,111,240,0.3)", borderRadius: 14, padding: "10px 22px" }}>
                <span style={{ color: "#c4b0f0", fontSize: 24, fontWeight: 500 }}>{p}</span>
              </div>
            ))}
          </div>
          <h1 style={{ color: "#fff", fontSize: 80, fontWeight: 800, lineHeight: 1.1, margin: 0, marginBottom: 24 }}>
            Кем тебе работать?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 36, lineHeight: 1.45, margin: 0, maxWidth: 750 }}>
            Ответь на несколько вопросов —<br />и мы покажем твоё идеальное направление
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ background: "#fff", borderRadius: 22, padding: "24px 52px" }}>
            <span style={{ color: "#1a0a3e", fontSize: 32, fontWeight: 800 }}>Пройти тест бесплатно</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} style={{ width: 36, height: 36, color: "#ffd93d", fontSize: 28, lineHeight: "36px" }}>★</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Banner5() {
  return (
    <div style={{ width: 1080, height: 1080, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", fontFamily: "'Golos Text', sans-serif" }}>
      <div style={{ position: "absolute", top: 100, right: 80, width: 320, height: 320, border: "2px solid rgba(255,255,255,0.12)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", top: 40, right: 20, width: 480, height: 480, border: "2px solid rgba(255,255,255,0.06)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: -100, left: -60, width: 400, height: 400, border: "2px solid rgba(255,255,255,0.08)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", top: 70, left: 70, right: 70, bottom: 70, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 16, padding: "14px 30px", display: "inline-block", marginBottom: 44 }}>
            <span style={{ color: "#fff", fontSize: 26, fontWeight: 600 }}>⚡ Бесплатно · 2 минуты</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 78, fontWeight: 800, lineHeight: 1.12, margin: 0, marginBottom: 28 }}>
            Узнай свою<br />идеальную<br />профессию
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 34, lineHeight: 1.5, margin: 0, maxWidth: 650 }}>
            Тест определит твои таланты и покажет, где ты можешь зарабатывать больше всего
          </p>
        </div>
        <div>
          <div style={{ background: "#fff", borderRadius: 24, padding: "26px 56px", display: "inline-block", marginBottom: 20 }}>
            <span style={{ color: "#764ba2", fontSize: 34, fontWeight: 800 }}>Начать тест →</span>
          </div>
          <div style={{ display: "flex", gap: 40 }}>
            <div style={{ display: "flex", flexDirection: "column" as const }}>
              <span style={{ color: "#fff", fontSize: 38, fontWeight: 800 }}>50+</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 22 }}>профессий</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const }}>
              <span style={{ color: "#fff", fontSize: 38, fontWeight: 800 }}>12K+</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 22 }}>прошли тест</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const }}>
              <span style={{ color: "#fff", fontSize: 38, fontWeight: 800 }}>95%</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 22 }}>точность</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const BANNERS = [
  { id: "career-test-dark-purple", title: "Баннер 1 — Тёмный фиолетовый", component: Banner1 },
  { id: "career-test-black-minimal", title: "Баннер 2 — Чёрный минимализм", component: Banner2 },
  { id: "career-test-light-soft", title: "Баннер 3 — Светлый мягкий", component: Banner3 },
  { id: "career-test-grid-dark", title: "Баннер 4 — Тёмный с сеткой", component: Banner4 },
  { id: "career-test-gradient-vivid", title: "Баннер 5 — Яркий градиент", component: Banner5 },
];

export { BannerWrapper };
