import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { fetchArticles, fetchCategories, ArticlePreview, Category } from "@/lib/articlesApi";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function ArticleCard({ article, onClick }: { article: ArticlePreview; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white rounded-2xl overflow-hidden border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
        {article.cover_url ? (
          <img
            src={article.cover_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-50">
            <Icon name="FileText" size={48} className="text-violet-300" />
          </div>
        )}
        {article.category_name && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-semibold text-violet-700 shadow-sm">
            {article.category_name}
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-[17px] leading-snug text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
          {article.summary}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={12} />
              {article.reading_time} мин
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Eye" size={12} />
              {article.views_count}
            </span>
            <span>{formatDate(article.created_at)}</span>
          </div>
          <span className="text-xs font-semibold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Читать
            <Icon name="ArrowRight" size={12} />
          </span>
        </div>
      </div>
    </button>
  );
}

function CategoryChips({ categories, active, onChange }: { categories: Category[]; active: string; onChange: (slug: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => onChange("")}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          !active
            ? "gradient-brand text-white shadow-sm"
            : "bg-white border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
        }`}
      >
        Все
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onChange(cat.slug)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            active === cat.slug
              ? "gradient-brand text-white shadow-sm"
              : "bg-white border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
          }`}
        >
          {cat.name}
          {cat.count > 0 && <span className="ml-1.5 opacity-60">{cat.count}</span>}
        </button>
      ))}
    </div>
  );
}

export default function Blog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<ArticlePreview[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    fetchCategories().then((d) => setCategories(d.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchArticles(page, activeCategory).then((d) => {
      setArticles(d.articles);
      setTotalPages(d.pages);
      setLoading(false);
    });
  }, [page, activeCategory]);

  const handleCategory = (slug: string) => {
    setPage(1);
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  const isLoggedIn = !!localStorage.getItem("pdd_user");

  return (
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(isLoggedIn ? "/cabinet" : "/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeft" size={18} />
            <span className="text-sm font-medium">{isLoggedIn ? "Кабинет" : "Главная"}</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Icon name="BookOpen" size={13} className="text-white" />
            </div>
            <span className="font-bold text-foreground text-sm">Статьи</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-foreground mb-1">Блог</h1>
          <p className="text-sm text-muted-foreground">Полезные статьи о карьере, психологии и развитии</p>
        </div>

        {categories.length > 0 && (
          <div className="mb-6">
            <CategoryChips categories={categories} active={activeCategory} onChange={handleCategory} />
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Icon name="Loader2" size={28} className="text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Загрузка статей...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
              <Icon name="FileText" size={28} className="text-violet-300" />
            </div>
            <p className="text-muted-foreground text-sm">Пока нет статей в этой категории</p>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} onClick={() => navigate(`/blog/${a.slug}`)} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      page === p
                        ? "gradient-brand text-white shadow-sm"
                        : "bg-white border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
