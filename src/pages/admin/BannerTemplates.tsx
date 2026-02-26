import { useRef, useCallback, useState } from "react";
import { toCanvas } from "html-to-image";
import Icon from "@/components/ui/icon";
import funcUrls from "@/../backend/func2url.json";

const W = 240;
const H = 400;
const MAX_KB = 120;
const PROXY_URL = funcUrls["image-proxy"];

async function imgToBase64(url: string): Promise<string> {
  const proxyRes = await fetch(`${PROXY_URL}?url=${encodeURIComponent(url)}`);
  const json = await proxyRes.json();
  return json.dataUrl;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/jpeg", quality);
  });
}

async function compressToJpeg(canvas: HTMLCanvasElement): Promise<string> {
  let quality = 0.92;
  while (quality > 0.3) {
    const blob = await canvasToBlob(canvas, quality);
    if (blob.size <= MAX_KB * 1024) {
      return URL.createObjectURL(blob);
    }
    quality -= 0.05;
  }
  const blob = await canvasToBlob(canvas, 0.3);
  return URL.createObjectURL(blob);
}

function DownloadBtn({ nodeRef, filename }: { nodeRef: React.RefObject<HTMLDivElement>; filename: string }) {
  const [loading, setLoading] = useState(false);
  const [sizeKb, setSizeKb] = useState<number | null>(null);
  const handleDownload = useCallback(async () => {
    if (!nodeRef.current || loading) return;
    setLoading(true);
    setSizeKb(null);
    try {
      const imgs = nodeRef.current.querySelectorAll("img[src^='http']");
      const originals = new Map<HTMLImageElement, string>();
      for (const img of imgs) {
        const el = img as HTMLImageElement;
        originals.set(el, el.src);
        el.src = await imgToBase64(el.src);
      }
      const canvas = await toCanvas(nodeRef.current, { width: W, height: H, pixelRatio: 1 });
      for (const [el, src] of originals) el.src = src;
      const blobUrl = await compressToJpeg(canvas);
      const resp = await fetch(blobUrl);
      const blob = await resp.blob();
      setSizeKb(Math.round(blob.size / 1024));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename + ".jpg";
      a.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } finally {
      setLoading(false);
    }
  }, [nodeRef, filename, loading]);

  return (
    <div className="flex items-center gap-3 mt-3">
      <button onClick={handleDownload} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
        <Icon name={loading ? "Loader2" : "Download"} size={16} className={loading ? "animate-spin" : ""} />
        {loading ? "Сжатие..." : "Скачать JPG"}
      </button>
      {sizeKb !== null && (
        <span className={`text-xs font-medium ${sizeKb <= MAX_KB ? "text-green-600" : "text-red-500"}`}>
          {sizeKb} КБ {sizeKb <= MAX_KB ? "✓" : "⚠"}
        </span>
      )}
    </div>
  );
}

function BannerWrapper({ children, title, id }: { children: React.ReactNode; title: string; id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="border border-border rounded-2xl overflow-hidden inline-block">
        <div ref={ref} style={{ width: W, height: H }}>
          {children}
        </div>
      </div>
      <DownloadBtn nodeRef={ref} filename={id} />
    </div>
  );
}

function Banner1() {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #1a0a3e 0%, #3b1d8e 45%, #6c3fc7 75%, #9b6ff0 100%)", fontFamily: "'Golos Text', sans-serif" }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,111,240,0.45) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,60,200,0.35) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: 18, left: 16, right: 16, bottom: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 10px", marginBottom: 14 }}>
            <span style={{ color: "#e0d4ff", fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Бесплатный тест</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, lineHeight: 1.15, margin: 0, marginBottom: 10 }}>
            Какая профессия создана для тебя?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, lineHeight: 1.45, margin: 0 }}>
            Тест определит твои сильные стороны и подберёт направление
          </p>
        </div>
        <div>
          <div style={{ background: "#fff", borderRadius: 8, padding: "8px 0", textAlign: "center", marginBottom: 8 }}>
            <span style={{ color: "#3b1d8e", fontSize: 12, fontWeight: 800 }}>Пройти тест →</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 8, textAlign: "center", margin: 0 }}>2 минуты · Бесплатно</p>
        </div>
      </div>
    </div>
  );
}

function Banner2() {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#0d0d0d", fontFamily: "'Golos Text', sans-serif" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 200, height: 200, borderRadius: "50%", background: "conic-gradient(from 180deg, #6c3fc7, #ff6b6b, #ffd93d, #6c3fc7)", opacity: 0.15, filter: "blur(40px)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px 16px" }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>🎯</div>
        <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 800, lineHeight: 1.2, margin: 0, marginBottom: 10 }}>
          Не знаешь, чем заниматься?
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, lineHeight: 1.45, margin: 0, marginBottom: 20 }}>
          Пройди тест и узнай профессию, в которой раскроешь потенциал
        </p>
        <div style={{ background: "linear-gradient(135deg, #6c3fc7, #9b6ff0)", borderRadius: 8, padding: "8px 20px", width: "100%" }}>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>Узнать профессию</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 8, marginTop: 8 }}>Без регистрации · Мгновенно</p>
      </div>
    </div>
  );
}

function Banner3() {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #faf8ff 0%, #ede5ff 100%)", fontFamily: "'Golos Text', sans-serif" }}>
      <div style={{ position: "absolute", top: -50, right: -30, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,63,199,0.12) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: 18, left: 16, right: 16, bottom: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["💼", "🎨", "💻", "📊"].map((e, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: 7, background: "#fff", boxShadow: "0 2px 8px rgba(108,63,199,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{e}</div>
            ))}
          </div>
          <h1 style={{ color: "#1a0a3e", fontSize: 21, fontWeight: 800, lineHeight: 1.15, margin: 0, marginBottom: 10 }}>
            Найди профессию мечты за 2 минуты
          </h1>
          <p style={{ color: "#6b5b8a", fontSize: 10, lineHeight: 1.5, margin: 0 }}>
            Психологический тест покажет, в какой сфере ты добьёшься успеха
          </p>
        </div>
        <div>
          <div style={{ background: "linear-gradient(135deg, #3b1d8e, #6c3fc7)", borderRadius: 8, padding: "8px 0", textAlign: "center", marginBottom: 8 }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>Пройти бесплатно →</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <span style={{ color: "#3b1d8e", fontSize: 8, fontWeight: 700 }}>12 000+ прошли</span>
            <span style={{ color: "#9b8ab5", fontSize: 8 }}>Результат сразу</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Banner4() {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#1a0a3e", fontFamily: "'Golos Text', sans-serif" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(108,63,199,0.1) 19px, rgba(108,63,199,0.1) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(108,63,199,0.1) 19px, rgba(108,63,199,0.1) 20px)" }} />
      <div style={{ position: "absolute", top: 18, left: 16, right: 16, bottom: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
            {["Маркетолог", "Дизайнер", "Психолог", "Аналитик"].map((p, i) => (
              <div key={i} style={{ background: "rgba(108,63,199,0.3)", border: "1px solid rgba(155,111,240,0.3)", borderRadius: 5, padding: "3px 7px" }}>
                <span style={{ color: "#c4b0f0", fontSize: 8, fontWeight: 500 }}>{p}</span>
              </div>
            ))}
          </div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, lineHeight: 1.1, margin: 0, marginBottom: 10 }}>
            Кем тебе работать?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, lineHeight: 1.4, margin: 0 }}>
            Ответь на вопросы — и мы покажем идеальное направление
          </p>
        </div>
        <div>
          <div style={{ background: "#fff", borderRadius: 8, padding: "8px 0", textAlign: "center", marginBottom: 8 }}>
            <span style={{ color: "#1a0a3e", fontSize: 12, fontWeight: 800 }}>Пройти тест</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 2 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} style={{ color: "#ffd93d", fontSize: 10 }}>★</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Banner5() {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "linear-gradient(145deg, #667eea 0%, #764ba2 100%)", fontFamily: "'Golos Text', sans-serif" }}>
      <div style={{ position: "absolute", top: 30, right: 20, width: 90, height: 90, border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", top: 10, right: 0, width: 140, height: 140, border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: -30, left: -20, width: 100, height: 100, border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", top: 18, left: 16, right: 16, bottom: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 6, padding: "4px 10px", display: "inline-block", marginBottom: 14 }}>
            <span style={{ color: "#fff", fontSize: 8, fontWeight: 600 }}>⚡ Бесплатно · 2 мин</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, lineHeight: 1.15, margin: 0, marginBottom: 10 }}>
            Узнай свою идеальную профессию
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 10, lineHeight: 1.45, margin: 0 }}>
            Тест определит таланты и покажет, где зарабатывать больше
          </p>
        </div>
        <div>
          <div style={{ background: "#fff", borderRadius: 8, padding: "8px 0", textAlign: "center", marginBottom: 10 }}>
            <span style={{ color: "#764ba2", fontSize: 12, fontWeight: 800 }}>Начать тест →</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>50+</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 7 }}>профессий</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>12K+</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 7 }}>прошли</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>95%</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 7 }}>точность</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const IMG1 = "https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/25c5ded1-c9fe-4ab9-9890-aa6eaa927d2f.jpg";
const IMG2 = "https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/f272fce1-5f3f-4503-8c5b-61478ffb7a2a.jpg";
const IMG3 = "https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/e145ad77-8800-43e5-b12e-c6ac7f8abff9.jpg";
const IMG4 = "https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/fe745baf-95a2-418b-bc9a-28791e81c5ec.jpg";
const IMG5 = "https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/1bf75a76-d583-49f6-bdde-fe08621edeff.jpg";

function Banner6() {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", fontFamily: "'Golos Text', sans-serif" }}>
      <img src={IMG1} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(180deg, rgba(26,10,62,0.3) 0%, rgba(26,10,62,0.6) 50%, rgba(26,10,62,0.95) 80%)" }} />
      <div style={{ position: "absolute", bottom: 18, left: 16, right: 16 }}>
        <div style={{ display: "inline-block", background: "rgba(108,63,199,0.6)", borderRadius: 5, padding: "3px 8px", marginBottom: 10 }}>
          <span style={{ color: "#fff", fontSize: 8, fontWeight: 600 }}>Бесплатный тест</span>
        </div>
        <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 800, lineHeight: 1.15, margin: 0, marginBottom: 8 }}>
          Найди работу, которая вдохновляет
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 9, lineHeight: 1.4, margin: 0, marginBottom: 14 }}>
          Определим твои сильные стороны за 2 минуты
        </p>
        <div style={{ background: "#fff", borderRadius: 8, padding: "8px 0", textAlign: "center" }}>
          <span style={{ color: "#3b1d8e", fontSize: 12, fontWeight: 800 }}>Пройти тест →</span>
        </div>
      </div>
    </div>
  );
}

function Banner7() {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", fontFamily: "'Golos Text', sans-serif" }}>
      <img src={IMG2} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.92) 85%)" }} />
      <div style={{ position: "absolute", top: 16, left: 16, right: 16 }}>
        <div style={{ background: "rgba(255,200,50,0.9)", borderRadius: 5, padding: "3px 8px", display: "inline-block" }}>
          <span style={{ color: "#1a0a3e", fontSize: 8, fontWeight: 700 }}>⚡ 2 минуты</span>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 18, left: 16, right: 16 }}>
        <h1 style={{ color: "#fff", fontSize: 21, fontWeight: 800, lineHeight: 1.15, margin: 0, marginBottom: 8 }}>
          Кем стать? Ответ ближе, чем кажется
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, lineHeight: 1.4, margin: 0, marginBottom: 14 }}>
          Научный тест покажет, в какой сфере раскроется твой потенциал
        </p>
        <div style={{ background: "linear-gradient(135deg, #6c3fc7, #9b6ff0)", borderRadius: 8, padding: "8px 0", textAlign: "center", marginBottom: 6 }}>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>Узнать профессию</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 7, textAlign: "center", margin: 0 }}>12 000+ уже прошли</p>
      </div>
    </div>
  );
}

function Banner8() {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", fontFamily: "'Golos Text', sans-serif" }}>
      <img src={IMG3} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(180deg, rgba(59,29,142,0.85) 0%, rgba(59,29,142,0.4) 35%, rgba(59,29,142,0.4) 60%, rgba(26,10,62,0.95) 85%)" }} />
      <div style={{ position: "absolute", top: 16, left: 16, right: 16 }}>
        <h1 style={{ color: "#fff", fontSize: 19, fontWeight: 800, lineHeight: 1.2, margin: 0, marginBottom: 6 }}>
          Они нашли своё призвание
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, lineHeight: 1.4, margin: 0 }}>
          Пройди тест — и узнай, какая профессия создана для тебя
        </p>
      </div>
      <div style={{ position: "absolute", bottom: 18, left: 16, right: 16 }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 12, justifyContent: "center" }}>
          {["Дизайнер", "Аналитик", "Маркетолог"].map((p, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 4, padding: "2px 6px" }}>
              <span style={{ color: "#e0d4ff", fontSize: 7, fontWeight: 600 }}>{p}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: 8, padding: "8px 0", textAlign: "center" }}>
          <span style={{ color: "#3b1d8e", fontSize: 12, fontWeight: 800 }}>Пройти бесплатно</span>
        </div>
      </div>
    </div>
  );
}

function Banner9() {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", fontFamily: "'Golos Text', sans-serif" }}>
      <img src={IMG4} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.95) 70%)" }} />
      <div style={{ position: "absolute", bottom: 18, left: 16, right: 16 }}>
        <div style={{ display: "inline-block", background: "#6c3fc7", borderRadius: 5, padding: "3px 8px", marginBottom: 10 }}>
          <span style={{ color: "#fff", fontSize: 8, fontWeight: 600 }}>Результат сразу</span>
        </div>
        <h1 style={{ color: "#1a0a3e", fontSize: 20, fontWeight: 800, lineHeight: 1.15, margin: 0, marginBottom: 8 }}>
          Узнай профессию мечты прямо сейчас!
        </h1>
        <p style={{ color: "#6b5b8a", fontSize: 9, lineHeight: 1.4, margin: 0, marginBottom: 14 }}>
          Бесплатный тест определит идеальное направление карьеры
        </p>
        <div style={{ background: "linear-gradient(135deg, #3b1d8e, #6c3fc7)", borderRadius: 8, padding: "8px 0", textAlign: "center" }}>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>Начать тест →</span>
        </div>
      </div>
    </div>
  );
}

function Banner10() {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", fontFamily: "'Golos Text', sans-serif" }}>
      <img src={IMG5} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.93) 80%)" }} />
      <div style={{ position: "absolute", top: 16, left: 16 }}>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 5, padding: "3px 8px", display: "inline-block" }}>
          <span style={{ color: "#fff", fontSize: 8, fontWeight: 600 }}>🎯 Профориентация</span>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 18, left: 16, right: 16 }}>
        <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 800, lineHeight: 1.15, margin: 0, marginBottom: 8 }}>
          На перепутье? Мы поможем выбрать
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, lineHeight: 1.4, margin: 0, marginBottom: 14 }}>
          Пройди тест и получи персональную карту карьеры бесплатно
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 1, background: "#fff", borderRadius: 8, padding: "8px 0", textAlign: "center" }}>
            <span style={{ color: "#1a0a3e", fontSize: 11, fontWeight: 800 }}>Пройти тест</span>
          </div>
          <div style={{ width: 36, background: "rgba(255,255,255,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14 }}>→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const BANNERS = [
  { id: "rsy-career-dark-purple", title: "Баннер 1 — Тёмный фиолетовый", component: Banner1 },
  { id: "rsy-career-black-minimal", title: "Баннер 2 — Чёрный минимализм", component: Banner2 },
  { id: "rsy-career-light-soft", title: "Баннер 3 — Светлый мягкий", component: Banner3 },
  { id: "rsy-career-grid-dark", title: "Баннер 4 — Тёмный с сеткой", component: Banner4 },
  { id: "rsy-career-gradient-vivid", title: "Баннер 5 — Яркий градиент", component: Banner5 },
  { id: "rsy-photo-woman-desk", title: "Баннер 6 — Фото: девушка за работой", component: Banner6 },
  { id: "rsy-photo-man-window", title: "Баннер 7 — Фото: парень у окна", component: Banner7 },
  { id: "rsy-photo-team", title: "Баннер 8 — Фото: команда профессионалов", component: Banner8 },
  { id: "rsy-photo-woman-tablet", title: "Баннер 9 — Фото: девушка с планшетом", component: Banner9 },
  { id: "rsy-photo-man-crossroads", title: "Баннер 10 — Фото: парень на перепутье", component: Banner10 },
];

export { BannerWrapper };