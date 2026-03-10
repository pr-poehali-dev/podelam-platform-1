import API from '@/config/api';

const CACHE_PREFIX = 'api_cache_';

interface CacheEntry<T> {
  data: T;
  ts: number;
}

function getCache<T>(key: string, maxAge: number): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.ts > maxAge) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export async function cachedUserCheck(userId: string, deviceToken: string) {
  const cacheKey = `user_check_${userId}`;
  const cached = getCache<{ exists: boolean; session_valid: boolean }>(cacheKey, 5 * 60 * 1000);
  if (cached) return cached;
  
  const res = await fetch(`${API.userCheck}?user_id=${encodeURIComponent(userId)}&device_token=${encodeURIComponent(deviceToken)}`);
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

export async function cachedGameHistory(userId: string) {
  const cacheKey = `game_history_${userId}`;
  const cached = getCache<any>(cacheKey, 2 * 60 * 1000);
  if (cached) return cached;
  
  const res = await fetch(`${API.gameHistory}?user_id=${encodeURIComponent(userId)}`);
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

export function invalidateGameHistory() {
  try {
    const keys = Object.keys(sessionStorage);
    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX + 'game_history_')) {
        sessionStorage.removeItem(key);
      }
    }
  } catch {}
}

export default { cachedUserCheck, cachedGameHistory, invalidateGameHistory };
