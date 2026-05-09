/**
 * API client for Cursive backend.
 */

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

if (!BASE) {
  console.warn('EXPO_PUBLIC_BACKEND_URL is not defined.');
}

const API = `${BASE}/api`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export interface ContentPiece {
  id: string;
  category: string;
  title: string;
  body: string;
  author?: string | null;
  era?: string | null;
  intro?: string | null;
  tags: string[];
  word_count: number;
  estimated_minutes: number;
}

export interface HistoricalDocument {
  id: string;
  title: string;
  transcription: string;
  context: string;
  era: string;
  source?: string | null;
  image_description: string;
}

export interface WritingSession {
  id: string;
  user_id: string;
  content_id?: string | null;
  content_type: string;
  duration_seconds: number;
  word_count: number;
  title?: string | null;
  completed_at: string;
}

export interface ProgressStats {
  total_sessions: number;
  total_minutes: number;
  total_words: number;
  current_streak: number;
  longest_streak: number;
  sessions_by_category: Record<string, number>;
  last_session_at?: string | null;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name?: string | null;
  email?: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  content_id: string;
  content_type: string;
  saved_at: string;
}

export const api = {
  listContent: (category?: string) =>
    request<ContentPiece[]>(`/content${category ? `?category=${category}` : ''}`),
  getContent: (id: string) => request<ContentPiece>(`/content/${id}`),
  listCategories: () => request<{ categories: { category: string; count: number }[] }>(`/content/categories`),

  listArchive: () => request<HistoricalDocument[]>(`/archive`),
  getArchiveDoc: (id: string) => request<HistoricalDocument>(`/archive/${id}`),

  createSession: (payload: {
    user_id: string;
    content_id?: string;
    content_type: string;
    duration_seconds: number;
    word_count?: number;
    title?: string;
  }) =>
    request<WritingSession>(`/sessions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listSessions: (userId: string) => request<WritingSession[]>(`/sessions/${userId}`),

  getProgress: (userId: string) => request<ProgressStats>(`/progress/${userId}`),

  upsertProfile: (payload: { user_id: string; display_name?: string; email?: string }) =>
    request<Profile>(`/profiles`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getProfile: (userId: string) => request<Profile>(`/profiles/${userId}`),

  addFavorite: (payload: { user_id: string; content_id: string; content_type?: string }) =>
    request<Favorite>(`/favorites`, {
      method: 'POST',
      body: JSON.stringify({ content_type: 'collection', ...payload }),
    }),
  removeFavorite: (userId: string, contentId: string) =>
    request<{ removed: boolean }>(`/favorites?user_id=${userId}&content_id=${contentId}`, {
      method: 'DELETE',
    }),
  listFavorites: (userId: string) => request<Favorite[]>(`/favorites/${userId}`),

  penpalSignup: (payload: {
    email: string;
    display_name?: string;
    interests?: string[];
    note?: string;
  }) =>
    request<{ id: string; email: string }>(`/penpal/signup`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const friendlyCategory = (cat: string): string => {
  const map: Record<string, string> = {
    philosophy: 'Philosophy',
    poetry: 'Poetry',
    letters: 'Historical Letters',
    affirmations: 'Affirmations',
    mindfulness: 'Mindfulness',
    recipes: 'Heirloom Recipes',
    creativity: 'Creativity',
    gratitude: 'Gratitude',
  };
  return map[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
};
