import { router } from "./trpc";
import { postRouter } from "./routers/post.router";
import { userRouter } from "./routers/user.router";
import { organizationRouter } from "./routers/organization.router";
import { analyticsRouter } from "./routers/analytics.router";
import { mediaRouter } from "./routers/media.router";
import { webhookRouter } from "./routers/webhook.router";
import { searchRouter } from "./routers/search.router";
import { seoRouter } from "./routers/seo.router";
import { projectRouter } from "./routers/project.router";
import { aiRouter } from "./routers/ai.router";
import { integrationRouter } from "./routers/integration.router";
import { growthRouter } from "./routers/growth.router";
import { subscriberRouter } from "./routers/subscriber.router";
import { conversionRouter } from "./routers/conversion.router";
import { utmRouter } from "./routers/utm.router";
import { internalLinksRouter } from "./routers/internal-links.router";
import { socialRouter } from "./routers/social.router";
import { calendarRouter } from "./routers/calendar.router";
import { billingRouter } from "./routers/billing.router";
import { apiKeyRouter } from "./routers/apiKey.router";

export const appRouter = router({
  post: postRouter,
  user: userRouter,
  organization: organizationRouter,
  analytics: analyticsRouter,
  media: mediaRouter,
  webhook: webhookRouter,
  search: searchRouter,
  seo: seoRouter,
  project: projectRouter,
  ai: aiRouter,
  integration: integrationRouter,
  growth: growthRouter,
  subscriber: subscriberRouter,
  conversion: conversionRouter,
  utm: utmRouter,
  internalLinks: internalLinksRouter,
  social: socialRouter,
  calendar: calendarRouter,
  billing: billingRouter,
  apiKey: apiKeyRouter,
});

export type AppRouter = typeof appRouter;
