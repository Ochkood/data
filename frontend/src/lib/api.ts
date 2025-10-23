const API = process.env.NEXT_PUBLIC_API_BASE;

export async function fetchAllPosts() {
  const res = await fetch(`${API}/posts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json();
}

export async function fetchFollowingPosts(token: string) {
  const res = await fetch(`${API}/posts/following`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load following posts");
  return res.json();
}

export async function fetchEditorPosts() {
  const res = await fetch(`${API}/posts/editor`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load editor posts");
  return res.json();
}

export async function fetchTrendingPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/posts/trending`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load trending posts");
  return res.json();
}

export async function fetchBanners() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/banners`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load banners");
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/categories`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}