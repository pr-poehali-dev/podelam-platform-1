import Icon from "@/components/ui/icon";
import InstallPWA from "@/components/InstallPWA";

export default function LandingFooter() {
  return (
    <footer className="border-t border-border py-8 md:py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Icon name="Compass" size={14} className="text-white" />
            </div>
            <span className="font-bold text-foreground">ПоДелам</span>
          </div>
          <div className="text-center text-sm text-muted-foreground space-y-0.5">
            <p>© 2025 ПоДелам. Найди своё дело.</p>
            <p>ИП Уварова А. С. · ОГРНИП 322508100398078 · Права защищены</p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <InstallPWA />
            <a href="/pricing" className="hover:text-foreground transition-colors">Тарифы</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Политика конфиденциальности</a>
            <a href="/oferta" className="hover:text-foreground transition-colors">Оферта</a>
            <a href="/partner" className="hover:text-foreground transition-colors">Партнёрская программа</a>
            <a href="https://t.me/AnnaUvaro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Icon name="Send" size={14} />
              Контакты
            </a>
          </div>
        </div>
        <div className="mt-6 pt-5 border-t border-border/50 max-w-3xl mx-auto text-[11px] leading-relaxed text-muted-foreground/60 text-center">
          <p>
            Проект «ПоДелам» не оказывает медицинских услуг и не является медицинской психотерапией. Материалы и результаты тестов носят
            информационно-рекомендательный характер и не заменяют консультацию специалиста. Проект не гарантирует достижение конкретных результатов.
            Сайт предназначен для лиц старше 18 лет. Используя сайт, вы соглашаетесь
            с <a href="/privacy" className="underline hover:text-muted-foreground transition-colors">Политикой конфиденциальности</a> и <a href="/oferta" className="underline hover:text-muted-foreground transition-colors">Офертой</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
