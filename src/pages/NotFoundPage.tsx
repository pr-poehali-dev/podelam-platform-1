import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Icon from "@/components/ui/icon";

const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen font-golos gradient-soft flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mb-6">
        <Icon name="Compass" size={28} className="text-white" />
      </div>
      <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">404</p>
      <h1 className="text-3xl md:text-4xl font-black text-foreground text-center mb-3">
        Такой страницы не существует
      </h1>
      <p className="text-muted-foreground text-center max-w-sm mb-8">
        Возможно, ссылка устарела или была введена с ошибкой. Вернитесь на главную страницу.
      </p>
      <a
        href="https://podelam.su/"
        className="gradient-brand text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-opacity text-[15px]"
      >
        Вернуться на главную
      </a>
    </div>
  );
};

export default NotFoundPage;
