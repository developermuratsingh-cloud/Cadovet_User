export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  category: string;
  author: string | null;
  excerpt: string | null;
  content: string | null; // only present on the detail endpoint
  imageUrl: string | null;
  readMinutes: number;
  publishedAt: string; // YYYY-MM-DD
}
