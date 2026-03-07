import { db } from "@rankflo/db";

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | null;
  author: { name: string | null };
  tags: string[];
  score: number;
}

export interface SearchOptions {
  query: string;
  organizationId: string;
  locale?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
  sort?: "relevance" | "date" | "title";
}

export interface SearchResponse {
  items: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  suggestions: string[];
}

export async function search(options: SearchOptions): Promise<SearchResponse> {
  const {
    query,
    organizationId,
    locale,
    tags,
    page = 1,
    pageSize = 20,
    sort = "relevance",
  } = options;

  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {
    organizationId,
    status: "PUBLISHED",
    deletedAt: null,
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { excerpt: { contains: query, mode: "insensitive" } },
      { contentPlain: { contains: query, mode: "insensitive" } },
    ],
  };

  if (locale) where.locale = locale;
  if (tags?.length) {
    where.tags = { some: { tag: { slug: { in: tags } } } };
  }

  const orderBy: Record<string, string> =
    sort === "date"
      ? { publishedAt: "desc" }
      : sort === "title"
        ? { title: "asc" }
        : { publishedAt: "desc" };

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where: where as never,
      orderBy: orderBy as never,
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        author: { select: { name: true } },
        tags: { include: { tag: { select: { name: true } } } },
      },
    }),
    db.post.count({ where: where as never }),
  ]);

  const items: SearchResult[] = posts.map((p, i) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    publishedAt: p.publishedAt,
    author: p.author,
    tags: p.tags.map((t) => t.tag.name),
    score: total - i,
  }));

  return { items, total, page, pageSize, suggestions: [] };
}

export async function suggest(
  prefix: string,
  organizationId: string,
): Promise<string[]> {
  const posts = await db.post.findMany({
    where: {
      organizationId,
      status: "PUBLISHED",
      deletedAt: null,
      title: { contains: prefix, mode: "insensitive" },
    },
    select: { title: true },
    take: 5,
    orderBy: { publishedAt: "desc" },
  });

  return posts.map((p) => p.title);
}
