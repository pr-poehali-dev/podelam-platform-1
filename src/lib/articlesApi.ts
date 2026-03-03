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

const cache: Record<string, { data: unknown; ts: number }> = {};
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache[key];
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T;
  return null;
}

function setCache(key: string, data: unknown) {
  cache[key] = { data, ts: Date.now() };
}

export async function fetchArticles(page = 1, category = "") {
  const cacheKey = `list_${page}_${category}`;
  const cached = getCached<{ articles: ArticlePreview[]; total: number; page: number; pages: number }>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({ action: "list", page: String(page) });
  if (category) params.set("category", category);
  const res = await fetch(`${API}?${params}`);
  const data = await res.json() as { articles: ArticlePreview[]; total: number; page: number; pages: number };
  setCache(cacheKey, data);
  return data;
}

export async function fetchArticle(slug: string) {
  const cacheKey = `detail_${slug}`;
  const cached = getCached<ArticleFull>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API}?action=detail&slug=${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  const data = await res.json() as ArticleFull;
  setCache(cacheKey, data);
  return data;
}

export async function fetchCategories() {
  const cacheKey = "categories";
  const cached = getCached<{ categories: Category[] }>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API}?action=categories`);
  const data = await res.json() as { categories: Category[] };
  setCache(cacheKey, data);
  return data;
}

export async function adminFetchArticle(token: string, id: number) {
  const res = await fetch(`${API}?action=admin_detail&id=${id}`, {
    headers: { "X-Admin-Token": token },
  });
  if (!res.ok) return null;
  return res.json() as Promise<ArticleFull & { category_id: number | null; is_published: boolean }>;
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
