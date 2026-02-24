const API = "https://functions.poehali.dev/49337359-8eda-4fb1-8238-36f1f1e2c0f6";

export interface ArticlePreview {
  id: number;
  slug: string;
  title: string;
  summary: string;
  cover_url: string | null;
  reading_time: number;
  views_count: number;
  created_at: string;
  category_name: string | null;
  category_slug: string | null;
}

export interface ArticleFull extends ArticlePreview {
  body: string;
  video_url: string | null;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  count: number;
}

export async function fetchArticles(page = 1, category = "") {
  const params = new URLSearchParams({ action: "list", page: String(page) });
  if (category) params.set("category", category);
  const res = await fetch(`${API}?${params}`);
  return res.json() as Promise<{ articles: ArticlePreview[]; total: number; page: number; pages: number }>;
}

export async function fetchArticle(slug: string) {
  const res = await fetch(`${API}?action=detail&slug=${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  return res.json() as Promise<ArticleFull>;
}

export async function fetchCategories() {
  const res = await fetch(`${API}?action=categories`);
  return res.json() as Promise<{ categories: Category[] }>;
}

export async function adminListArticles(token: string) {
  const res = await fetch(`${API}?action=admin_list`, {
    headers: { "X-Admin-Token": token },
  });
  if (!res.ok) throw new Error("Forbidden");
  return res.json() as Promise<{ articles: (ArticlePreview & { is_published: boolean })[] }>;
}

export async function adminSaveArticle(token: string, data: Record<string, unknown>) {
  const res = await fetch(`${API}?action=save`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Token": token },
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ id: number; slug: string }>;
}

export async function adminTogglePublish(token: string, id: number) {
  const res = await fetch(`${API}?action=toggle_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Token": token },
    body: JSON.stringify({ id }),
  });
  return res.json() as Promise<{ id: number; is_published: boolean }>;
}

export async function adminUploadCover(token: string, image: string, contentType: string) {
  const res = await fetch(`${API}?action=upload_cover`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Token": token },
    body: JSON.stringify({ image, content_type: contentType }),
  });
  return res.json() as Promise<{ url: string }>;
}
