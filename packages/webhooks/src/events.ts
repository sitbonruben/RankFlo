export const WEBHOOK_EVENTS = {
  "post.created": "Triggered when a new post is created",
  "post.updated": "Triggered when a post is updated",
  "post.published": "Triggered when a post is published",
  "post.deleted": "Triggered when a post is deleted",
  "post.archived": "Triggered when a post is archived",
  "page.created": "Triggered when a new page is created",
  "page.updated": "Triggered when a page is updated",
  "page.deleted": "Triggered when a page is deleted",
  "member.invited": "Triggered when a team member is invited",
  "member.removed": "Triggered when a team member is removed",
  "member.role_changed": "Triggered when a member role changes",
  "comment.created": "Triggered when a new comment is posted",
  "comment.approved": "Triggered when a comment is approved",
  "media.uploaded": "Triggered when media is uploaded",
  "media.deleted": "Triggered when media is deleted",
} as const;

export type WebhookEvent = keyof typeof WEBHOOK_EVENTS;
