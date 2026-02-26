import { useState } from "react";
import Icon from "@/components/ui/icon";
import { BANNERS, BannerWrapper } from "./admin/BannerTemplates";

const ADMIN_TOKEN_KEY = "admin_token";

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
            1080x1080 px — идеальный формат для VK, Telegram, Instagram. Нажмите «Скачать PNG» или правый клик → «Сохранить как...»
          </p>
        </div>

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
