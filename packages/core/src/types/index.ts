export * from "./project";
export * from "./editor";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  locale: string;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  subdomain: string | null;
  customDomain: string | null;
  createdAt: Date;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  teamId: string | null;
  role: "ADMIN" | "EDITOR" | "AUTHOR" | "VIEWER";
}

export interface Post {
  id: string;
  organizationId: string;
  projectId: string | null;
  authorId: string;
  slug: string;
  status: "DRAFT" | "REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  title: string;
  excerpt: string | null;
  content: unknown;
  contentHtml: string | null;
  featuredImage: string | null;
  locale: string;
  readingTime: number | null;
  version: number;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: string;
  organizationId: string;
  slug: string;
  title: string;
  content: unknown;
  contentHtml: string | null;
  status: "DRAFT" | "REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  locale: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  organizationId: string | null;
  name: string;
  slug: string;
  color: string | null;
}

export interface Media {
  id: string;
  organizationId: string;
  uploadedBy: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  createdAt: Date;
}

export interface Webhook {
  id: string;
  organizationId: string;
  url: string;
  events: string[];
  isActive: boolean;
  description: string | null;
}

export interface ApiKey {
  id: string;
  organizationId: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
}

export interface AnalyticsEvent {
  id: string;
  organizationId: string;
  sessionId: string;
  visitorId: string;
  eventType: string;
  path: string | null;
  referrer: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
  duration: number | null;
  timestamp: Date;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AuthSession {
  user: User;
  organization: Organization | null;
  membership: Membership | null;
}
