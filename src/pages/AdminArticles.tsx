import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  adminListArticles,
  adminSaveArticle,
  adminTogglePublish,
  adminUploadCover,
  fetchCategories,
  ArticlePreview,
  Category,
} from "@/lib/articlesApi";

type ArticleRow = ArticlePreview & { is_published: boolean };

interface EditorData {
  id?: number;
  title: string;
  summary: string;
  body: string;
  slug: string;
  category_id: number | null;
  cover_url: string;
  video_url: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  reading_time: number;
  is_published: boolean;
}

const EMPTY: EditorData = {
  title: "",
  summary: "",
  body: "",
  slug: "",
  category_id: null,
  cover_url: "",
  video_url: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  reading_time: 3,
  is_published: false,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminArticles() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") || "");
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<EditorData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) { navigate("/admin"); return; }
    load();
    fetchCategories().then((d) => setCategories(d.categories));
  }, [token, navigate]);

  const load = () => {
    adminListArticles(token).then((d) => setArticles(d.articles)).catch(() => navigate("/admin"));
  };

  const handleNew = () => setEditing({ ...EMPTY });

  const handleEdit = (a: ArticleRow) => {
    setEditing({
      id: a.id,
      title: a.title,
      summary: a.summary,
      body: "",
      slug: a.slug,
      category_id: null,
      cover_url: a.cover_url || "",
      video_url: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      reading_time: 3,
      is_published: a.is_published,
    });
  };

  const handleToggle = async (id: number) => {
    await adminTogglePublish(token, id);
    load();
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      const { url } = await adminUploadCover(token, b64, file.type);
      setEditing((prev) => prev ? { ...prev, cover_url: url } : null);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    await adminSaveArticle(token, editing);
    setSaving(false);
    setEditing(null);
    load();
  };

  const set = (field: keyof EditorData, value: string | number | boolean | null) => {
    setEditing((prev) => prev ? { ...prev, [field]: value } : null);
  };

  if (!token) return null;

  if (editing) {
    return (
      <div className="min-h-screen font-golos bg-gray-50">
        <header className="sticky top-0 z-40 bg-white border-b border-border px-4 h-14 flex items-center justify-between">
          <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
            <Icon name="ArrowLeft" size={18} />
            Назад
          </button>
          <span className="font-bold text-sm">{editing.id ? "Редактирование" : "Новая статья"}</span>
          <button
            onClick={handleSave}
            disabled={saving || !editing.title || !editing.summary}
            className="px-4 py-1.5 rounded-lg gradient-brand text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "..." : "Сохранить"}
          </button>
        </header>

        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Заголовок (до 120 символов)</label>
            <input
              value={editing.title}
              onChange={(e) => set("title", e.target.value.slice(0, 120))}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Как найти своё призвание..."
            />
            <div className="text-right text-[10px] text-muted-foreground mt-0.5">{editing.title.length}/120</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Описание (до 300 символов)</label>
            <textarea
              value={editing.summary}
              onChange={(e) => set("summary", e.target.value.slice(0, 300))}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Краткое описание статьи для ленты..."
            />
            <div className="text-right text-[10px] text-muted-foreground mt-0.5">{editing.summary.length}/300</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Обложка</label>
            {editing.cover_url ? (
              <div className="relative rounded-xl overflow-hidden mb-2">
                <img src={editing.cover_url} alt="" className="w-full aspect-[16/9] object-cover" />
                <button
                  onClick={() => set("cover_url", "")}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full aspect-[16/9] rounded-xl border-2 border-dashed border-border bg-white flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-colors"
              >
                {uploading ? (
                  <Icon name="Loader2" size={24} className="text-primary animate-spin" />
                ) : (
                  <>
                    <Icon name="ImagePlus" size={28} className="text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground">Загрузить фото</span>
                  </>
                )}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Категория</label>
              <select
                value={editing.category_id ?? ""}
                onChange={(e) => set("category_id", e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
              >
                <option value="">Без категории</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Время чтения (мин)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={editing.reading_time}
                onChange={(e) => set("reading_time", Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Видео (URL Kinescope / YouTube embed)</label>
            <input
              value={editing.video_url}
              onChange={(e) => set("video_url", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="https://kinescope.io/embed/..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Текст статьи (Markdown)</label>
            <textarea
              value={editing.body}
              onChange={(e) => set("body", e.target.value)}
              rows={14}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={"## Подзаголовок\n\nТекст абзаца...\n\n**Жирный текст**\n\n- Пункт списка\n\n> Цитата"}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Slug (URL)</label>
            <input
              value={editing.slug}
              onChange={(e) => set("slug", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="kak-nayti-svoyo-prizvanie"
            />
          </div>

          <details className="bg-white rounded-xl border border-border p-4">
            <summary className="text-xs font-semibold text-muted-foreground cursor-pointer">SEO / Мета-теги</summary>
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-[10px] text-muted-foreground mb-0.5">Meta Title</label>
                <input
                  value={editing.meta_title}
                  onChange={(e) => set("meta_title", e.target.value.slice(0, 200))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm"
                  placeholder={editing.title || "Заголовок для поисковиков"}
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-0.5">Meta Description</label>
                <textarea
                  value={editing.meta_description}
                  onChange={(e) => set("meta_description", e.target.value.slice(0, 400))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm resize-none"
                  placeholder={editing.summary || "Описание для поисковиков"}
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-0.5">Keywords</label>
                <input
                  value={editing.meta_keywords}
                  onChange={(e) => set("meta_keywords", e.target.value.slice(0, 300))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm"
                  placeholder="карьера, психология, развитие"
                />
              </div>
            </div>
          </details>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.is_published}
                onChange={(e) => set("is_published", e.target.checked)}
                className="w-4 h-4 rounded accent-violet-600"
              />
              <span className="text-sm font-medium">Опубликовать сразу</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-golos bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-border px-4 h-14 flex items-center justify-between">
        <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
          <Icon name="ArrowLeft" size={18} />
          Админка
        </button>
        <span className="font-bold text-sm">Статьи ({articles.length})</span>
        <button
          onClick={handleNew}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg gradient-brand text-white text-sm font-semibold"
        >
          <Icon name="Plus" size={14} />
          Новая
        </button>
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-3">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
              <Icon name="FileText" size={28} className="text-violet-300" />
            </div>
            <p className="text-muted-foreground text-sm">Ещё нет статей</p>
            <button onClick={handleNew} className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-semibold">
              Создать первую
            </button>
          </div>
        ) : (
          articles.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 bg-white rounded-xl border border-border p-3 hover:shadow-sm transition-shadow"
            >
              {a.cover_url ? (
                <img src={a.cover_url} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-16 h-12 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                  <Icon name="FileText" size={18} className="text-violet-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{a.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <span>{formatDate(a.created_at)}</span>
                  <span>{a.category_name || "Без категории"}</span>
                  <span>{a.views_count} просм.</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggle(a.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                    a.is_published
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {a.is_published ? "Опубликовано" : "Черновик"}
                </button>
                <button
                  onClick={() => handleEdit(a)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Icon name="Pencil" size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
