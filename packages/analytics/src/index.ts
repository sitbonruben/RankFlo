import { db } from "@rankflo/db";

export interface AnalyticsOverview {
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  bounceRate: number;
  avgDuration: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export async function getOverview(
  organizationId: string,
  range: DateRange,
): Promise<AnalyticsOverview> {
  const events = await db.analyticsEvent.findMany({
    where: {
      organizationId,
      eventType: "pageview",
      timestamp: { gte: range.from, lte: range.to },
    },
    select: {
      visitorId: true,
      sessionId: true,
      duration: true,
    },
  });

  const uniqueVisitors = new Set(events.map((e) => e.visitorId)).size;
  const sessionIds = new Set(events.map((e) => e.sessionId));
  const sessions = sessionIds.size;

  // Bounce: sessions with only 1 pageview
  const sessionCounts = new Map<string, number>();
  for (const e of events) {
    sessionCounts.set(e.sessionId, (sessionCounts.get(e.sessionId) ?? 0) + 1);
  }
  const bouncedSessions = [...sessionCounts.values()].filter((c) => c === 1).length;
  const bounceRate = sessions > 0 ? (bouncedSessions / sessions) * 100 : 0;

  const durations = events.filter((e) => e.duration != null).map((e) => e.duration!);
  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;

  return {
    pageViews: events.length,
    uniqueVisitors,
    sessions,
    bounceRate: Math.round(bounceRate * 10) / 10,
    avgDuration: Math.round(avgDuration),
  };
}

export async function getTopPages(
  organizationId: string,
  range: DateRange,
  limit = 10,
): Promise<Array<{ path: string; views: number }>> {
  const pages = await db.analyticsEvent.groupBy({
    by: ["path"],
    where: {
      organizationId,
      eventType: "pageview",
      timestamp: { gte: range.from, lte: range.to },
      path: { not: null },
    },
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take: limit,
  });

  return pages.map((p) => ({ path: p.path!, views: p._count.path }));
}

export async function getTopReferrers(
  organizationId: string,
  range: DateRange,
  limit = 10,
): Promise<Array<{ referrer: string; views: number }>> {
  const referrers = await db.analyticsEvent.groupBy({
    by: ["referrer"],
    where: {
      organizationId,
      eventType: "pageview",
      timestamp: { gte: range.from, lte: range.to },
      referrer: { not: null },
    },
    _count: { referrer: true },
    orderBy: { _count: { referrer: "desc" } },
    take: limit,
  });

  return referrers.map((r) => ({ referrer: r.referrer!, views: r._count.referrer }));
}

// Lightweight tracking script generator
export function generateTrackingScript(orgId: string, apiUrl: string): string {
  return `!function(){var o="${orgId}",a="${apiUrl}",s=function(){return Math.random().toString(36).substring(2)},v=function(){var k="rf_vid";var v=localStorage.getItem(k);if(!v){v=s()+s();localStorage.setItem(k,v)}return v}(),i=s(),t=Date.now();document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden"){var d=Math.round((Date.now()-t)/1000);navigator.sendBeacon(a+"/api/trpc/analytics.track",JSON.stringify({json:{organizationId:o,eventType:"pageview",path:location.pathname,referrer:document.referrer||null,sessionId:i,visitorId:v,duration:d,device:screen.width<768?"mobile":screen.width<1024?"tablet":"desktop",browser:navigator.userAgent}}))}});window.addEventListener("load",function(){fetch(a+"/api/trpc/analytics.track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({json:{organizationId:o,eventType:"pageview",path:location.pathname,referrer:document.referrer||null,sessionId:i,visitorId:v,device:screen.width<768?"mobile":screen.width<1024?"tablet":"desktop",browser:navigator.userAgent}})}).catch(function(){})})}();`;
}
