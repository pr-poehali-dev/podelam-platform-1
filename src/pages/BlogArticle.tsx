import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { fetchArticle, ArticleFull } from "@/lib/articlesApi";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function isListLine(line: string) {
  return line.startsWith("- ") || line.startsWith("* ");
}
function isOrderedListLine(line: string) {
  return /^\d+\.\s/.test(line);
}

function renderBody(body: string) {
  const blocks = body.split(/\n\n+/);
  const elements: React.ReactNode[] = [];

  blocks.forEach((block, bi) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    const lines = trimmed.split("\n");

    if (lines.length === 1) {
      const line = lines[0];

      if (line.trim() === "---" || line.trim() === "***") {
        elements.push(<hr key={bi} className="my-6 border-border/50" />);
        return;
      }
      if (line.startsWith("## ")) {
        elements.push(<h2 key={bi} className="text-xl font-bold text-foreground mt-8 mb-3">{renderInline(line.slice(3))}</h2>);
        return;
      }
      if (line.startsWith("### ")) {
        elements.push(<h3 key={bi} className="text-lg font-semibold text-foreground mt-6 mb-2">{renderInline(line.slice(4))}</h3>);
        return;
      }
      if (line.startsWith("![") && line.includes("](")) {
        const alt = line.match(/!\[([^\]]*)\]/)?.[1] || "";
        const src = line.match(/\]\(([^)]+)\)/)?.[1] || "";
        elements.push(
          <figure key={bi} className="my-6 rounded-xl overflow-hidden">
            <img src={src} alt={alt} className="w-full max-h-[500px] object-cover" loading="lazy" />
            {alt && <figcaption className="text-xs text-muted-foreground text-center mt-2">{alt}</figcaption>}
          </figure>
        );
        return;
      }
      if (line.startsWith("> ")) {
        elements.push(
          <blockquote key={bi} className="border-l-4 border-primary/30 pl-4 py-2 my-4 text-[15px] italic text-muted-foreground bg-violet-50/50 rounded-r-lg">
            {renderInline(line.slice(2))}
          </blockquote>
        );
        return;
      }
    }

    if (lines.every((l) => isListLine(l))) {
      elements.push(
        <ul key={bi} className="ml-5 my-3 space-y-1.5 list-disc">
          {lines.map((l, li) => (
            <li key={li} className="text-[15px] leading-relaxed text-foreground/85">{renderInline(l.slice(2))}</li>
          ))}
        </ul>
      );
      return;
    }

    if (lines.every((l) => isOrderedListLine(l))) {
      elements.push(
        <ol key={bi} className="ml-5 my-3 space-y-1.5 list-decimal">
          {lines.map((l, li) => (
            <li key={li} className="text-[15px] leading-relaxed text-foreground/85">{renderInline(l.replace(/^\d+\.\s/, ""))}</li>
          ))}
        </ol>
      );
      return;
    }

    if (lines.every((l) => l.startsWith("> "))) {
      elements.push(
        <blockquote key={bi} className="border-l-4 border-primary/30 pl-4 py-2 my-4 text-[15px] italic text-muted-foreground bg-violet-50/50 rounded-r-lg">
          {lines.map((l, li) => <span key={li}>{renderInline(l.slice(2))}{li < lines.length - 1 && <br />}</span>)}
        </blockquote>
      );
      return;
    }

    elements.push(
      <p key={bi} className="text-[15px] leading-[1.75] text-foreground/85 mb-4">
        {lines.map((l, li) => (
          <span key={li}>{renderInline(l)}{li < lines.length - 1 && <br />}</span>
        ))}
      </p>
    );
  });

  return elements;
}

function renderInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      tokens.push(<strong key={match.index} className="font-semibold text-foreground">{match[1]}</strong>);
    } else if (match[2]) {
      tokens.push(<em key={match.index} className="italic">{match[2]}</em>);
    } else if (match[3] && match[4]) {
      tokens.push(
        <a key={match.index} href={match[4]} target="_blank" rel="noopener noreferrer"
           className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
          {match[3]}
        </a>
      );
    }
    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchArticle(slug).then((data) => {
      if (!data) {
        setNotFound(true);
      } else {
        setArticle(data);
        if (data.meta_title) document.title = data.meta_title;
      }
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (article.meta_description) {
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", article.meta_description);
    }
    return () => { document.title = "ПоДелам"; };
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen font-golos flex items-center justify-center" style={{ background: "hsl(248, 50%, 98%)" }}>
        <Icon name="Loader2" size={28} className="text-primary animate-spin" />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen font-golos flex flex-col items-center justify-center gap-4" style={{ background: "hsl(248, 50%, 98%)" }}>
        <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
          <Icon name="FileX" size={28} className="text-violet-300" />
        </div>
        <p className="text-muted-foreground">Статья не найдена</p>
        <button onClick={() => navigate("/blog")} className="text-sm text-primary font-medium hover:underline">
          Вернуться к статьям
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate("/blog")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeft" size={18} />
            <span className="text-sm font-medium">Все статьи</span>
          </button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={12} />
              {article.reading_time} мин
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Eye" size={12} />
              {article.views_count}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        {article.cover_url && (
          <div className="aspect-[2/1] overflow-hidden">
            <img
              src={article.cover_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <article className="px-4 py-6 md:px-0 md:py-8">
          {article.category_name && (
            <button
              onClick={() => navigate(`/blog?category=${article.category_slug}`)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold mb-4 hover:bg-violet-100 transition-colors"
            >
              {article.category_name}
            </button>
          )}

          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight mb-3">
            {article.title}
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            {article.summary}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground/60 mb-8 pb-6 border-b border-border/40">
            <span>{formatDate(article.created_at)}</span>
            {article.updated_at !== article.created_at && (
              <span>Обновлено: {formatDate(article.updated_at)}</span>
            )}
          </div>

          {article.video_url && (
            <div className="mb-8 rounded-2xl overflow-hidden aspect-video bg-black">
              <iframe
                src={article.video_url}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
              />
            </div>
          )}

          <div className="prose-custom">
            {renderBody(article.body)}
          </div>

          <div className="mt-12 pt-8 border-t border-border/40 flex items-center gap-4">
            <img
              src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/bucket/b21118f8-5d3b-4a20-8752-d430e8e22e48.jpg"
              alt="Анна Уварова"
              className="w-16 h-16 rounded-full object-[center_20%] object-cover border-2 border-violet-100 shrink-0"
            />
            <div>
              <p className="font-bold text-foreground text-[15px]">Анна Уварова</p>
              <p className="text-sm text-muted-foreground">бизнес-психолог</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/40 flex justify-center">
            <button
              onClick={() => navigate("/blog")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <Icon name="ArrowLeft" size={16} />
              Все статьи
            </button>
          </div>
        </article>
      </main>
    </div>
  );
}