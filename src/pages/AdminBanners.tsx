import { useState, useRef, useCallback } from "react";
import { toCanvas } from "html-to-image";
import Icon from "@/components/ui/icon";
import { BANNERS, BannerWrapper } from "./admin/BannerTemplates";

const ADMIN_TOKEN_KEY = "admin_token";
const LOGO_SIZE = 512;

function LogoIcon({ size }: { size: number }) {
  const r = Math.round(size * 0.22);
  const iconSize = Math.round(size * 0.52);
  const strokeW = size * 0.04;
  return (
    <div style={{ width: size, height: size, background: "linear-gradient(145deg, #3b1d8e 0%, #6c3fc7 60%, #9b6ff0 100%)", borderRadius: r, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#fff" stroke="#fff" />
      </svg>
    </div>
  );
}

function LogoDownloadSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!ref.current || loading) return;
    setLoading(true);
    try {
      const canvas = await toCanvas(ref.current, { width: LOGO_SIZE, height: LOGO_SIZE, pixelRatio: 1 });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "podelam-logo.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, "image/png");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return (
    <div className="mb-12 p-6 bg-white rounded-2xl border border-border">
      <h2 className="text-lg font-bold text-foreground mb-1">Логотип для соцсетей</h2>
      <p className="text-muted-foreground text-sm mb-5">512×512 px — подходит для аватарки</p>
      <div className="flex items-start gap-6">
        <div className="border border-border rounded-2xl overflow-hidden inline-block" style={{ width: LOGO_SIZE / 2, height: LOGO_SIZE / 2 }}>
          <div ref={ref} style={{ width: LOGO_SIZE, height: LOGO_SIZE, transform: "scale(0.5)", transformOrigin: "top left" }}>
            <LogoIcon size={LOGO_SIZE} />
          </div>
        </div>
        <div className="pt-2">
          <button onClick={handleDownload} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            <Icon name={loading ? "Loader2" : "Download"} size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "..." : "Скачать PNG"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBanners() {
  const [token] = useState(() => sessionStorage.getItem(ADMIN_TOKEN_KEY) || "");

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Сначала войдите в админку</p>
          <a href="/admin" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
            <Icon name="ArrowLeft" size={16} />
            Перейти в админку
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <Icon name="Image" size={16} className="text-white" />
            </div>
            <span className="font-bold text-foreground">Баннеры</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-sm font-semibold hover:bg-violet-100 transition-colors">
              <Icon name="LayoutDashboard" size={14} />
              Панель
            </a>
            <a href="/admin/articles" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-sm font-semibold hover:bg-violet-100 transition-colors">
              <Icon name="BookOpen" size={14} />
              Статьи
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Рекламные баннеры</h1>
          <p className="text-muted-foreground text-sm">
            240×400 px — формат для РСЯ (Яндекс Директ). Нажмите «Скачать PNG» под баннером.
          </p>
        </div>

        <LogoDownloadSection />

        <div className="space-y-12">
          {BANNERS.map((b) => (
            <BannerWrapper key={b.id} id={b.id} title={b.title}>
              <b.component />
            </BannerWrapper>
          ))}
        </div>
      </div>
    </div>
  );
}