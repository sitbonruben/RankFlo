"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

/* ─── Constants ───────────────────────────────────────────── */

const SOURCE_COLORS: Record<string, string> = {
  "Organic Search": "bg-blue-500 dark:bg-blue-500",
  Email: "bg-green-500 dark:bg-accent",
  Social: "bg-purple-500 dark:bg-purple-400",
  Direct: "bg-amber-500 dark:bg-amber-400",
  Referral: "bg-pink-500 dark:bg-pink-400",
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  form_submit: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  button_click: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  signup: "bg-green-100 text-green-700 dark:bg-accent/10 dark:text-accent",
  file_download: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

/* ─── Date Helpers ────────────────────────────────────────── */

const now = new Date();
const fourteenDaysAgo = new Date(now);
fourteenDaysAgo.setDate(now.getDate() - 14);
const thirtyDaysAgo = new Date(now);
thirtyDaysAgo.setDate(now.getDate() - 30);

/* ─── Component ───────────────────────────────────────────── */

export default function ConversionsPage() {
  const utils = trpc.useUtils();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalType, setNewGoalType] = useState("form_submit");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  /* ─── Queries ─────────────────────────────────────────── */

  const funnelQuery = trpc.conversion.funnel.useQuery({
    from: thirtyDaysAgo,
    to: now,
  });

  const goalsQuery = trpc.conversion.goals.list.useQuery();

  const reportQuery = trpc.conversion.report.useQuery({
    from: fourteenDaysAgo,
    to: now,
  });

  /* ─── Mutations ───────────────────────────────────────── */

  const createGoalMutation = trpc.conversion.goals.create.useMutation({
    onSuccess: () => {
      utils.conversion.goals.list.invalidate();
    },
  });

  const updateGoalMutation = trpc.conversion.goals.update.useMutation({
    onSuccess: () => {
      utils.conversion.goals.list.invalidate();
    },
  });

  /* ─── Derived Data ────────────────────────────────────── */

  const funnelData = funnelQuery.data;
  const stages = funnelData
    ? [
        { name: "Visitors", value: funnelData.visitors, color: "bg-gray-400 dark:bg-gray-600" },
        { name: "Page Views", value: funnelData.pageViews, color: "bg-blue-500 dark:bg-blue-500" },
        { name: "Subscribers", value: funnelData.subscribers, color: "bg-green-500 dark:bg-green-500" },
        { name: "Conversions", value: funnelData.conversions, color: "bg-green-400 dark:bg-accent" },
      ]
    : [];
  const rates = funnelData
    ? [
        { rate: `${funnelData.rates.viewsPerVisitor}x pageviews/visitor` },
        { rate: `${funnelData.rates.subscribeRate}% subscribe rate` },
        { rate: `${funnelData.rates.conversionRate}% conversion rate` },
      ]
    : [];

  const goals = (goalsQuery.data ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    eventType: g.eventType,
    target: g.targetValue ?? 0,
    current: g.conversionCount,
    active: g.isActive,
  }));

  const dailyConversions = (reportQuery.data?.daily ?? []).map((d) => ({
    day: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: d.count,
  }));

  const maxConversions = dailyConversions.length > 0
    ? Math.max(...dailyConversions.map((d) => d.value))
    : 1;

  const reportData = reportQuery.data;
  const totalSourceCount = reportData?.sourceBreakdown?.reduce((sum, s) => sum + s.count, 0) ?? 1;
  const conversionSources = (reportData?.sourceBreakdown ?? []).map((s) => ({
    source: s.source,
    count: s.count,
    pct: Math.round((s.count / totalSourceCount) * 100),
  }));

  // Compute funnel stage widths based on max value
  const maxStageValue = stages.length > 0 ? Math.max(...stages.map((s) => s.value)) : 1;

  /* ─── Handlers ────────────────────────────────────────── */

  function toggleGoal(id: string, currentActive: boolean) {
    updateGoalMutation.mutate({ id, isActive: !currentActive });
  }

  function handleCreateGoal() {
    if (!newGoalName || !newGoalTarget) return;
    createGoalMutation.mutate(
      {
        name: newGoalName,
        eventType: newGoalType,
        targetValue: parseInt(newGoalTarget, 10) || 100,
      },
      {
        onSuccess: () => {
          setNewGoalName("");
          setNewGoalType("form_submit");
          setNewGoalTarget("");
          setShowCreateModal(false);
        },
      },
    );
  }

  /* ─── Loading Skeleton ────────────────────────────────── */

  const isLoading = funnelQuery.isLoading || goalsQuery.isLoading || reportQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Conversions
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track goals and visualize your funnel
          </p>
        </div>

        {/* Funnel Skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-6 flex flex-col items-center gap-3">
            {[100, 80, 40, 20].map((w) => (
              <div
                key={w}
                className="animate-pulse rounded-lg bg-gray-200 py-5 dark:bg-gray-800"
                style={{ width: `${w}%`, height: "60px" }}
              />
            ))}
          </div>
        </div>

        {/* Goals Skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20"
              />
            ))}
          </div>
        </div>

        {/* Chart Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2 dark:border-gray-800 dark:bg-gray-950">
            <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-6 h-[200px] animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-6 flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Conversions
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track goals and visualize your funnel
        </p>
      </div>

      {/* Funnel Visualization */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h2 className="text-sm font-medium text-gray-900 dark:text-white">Conversion Funnel</h2>
        <div className="mt-6 flex flex-col items-center gap-0">
          {stages.map((stage, i) => {
            const widthPct = maxStageValue > 0 ? Math.max(20, Math.round((stage.value / maxStageValue) * 100)) : 20;
            return (
              <div key={stage.name} className="w-full">
                {/* Stage bar */}
                <div className="flex justify-center">
                  <div
                    className={`${stage.color} relative flex items-center justify-center rounded-lg py-5 transition-all`}
                    style={{ width: `${widthPct}%` }}
                  >
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">
                        {stage.value.toLocaleString()}
                      </p>
                      <p className="text-xs font-medium text-white/80">{stage.name}</p>
                    </div>
                  </div>
                </div>

                {/* Conversion rate between stages */}
                {i < stages.length - 1 && rates[i] && (
                  <div className="flex justify-center py-2">
                    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 dark:border-gray-700 dark:bg-gray-900">
                      <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                      </svg>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {rates[i].rate}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Goals Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">Conversion Goals</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {goals.filter((g) => g.active).length} active goals
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-gray-950 dark:hover:bg-accent/90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Goal
          </button>
        </div>

        {/* Create Goal Modal / Inline Form */}
        {showCreateModal && (
          <div className="mt-5 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">New Goal</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Goal Name</label>
                <input
                  type="text"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="e.g. Newsletter Signup"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-accent dark:focus:ring-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Event Type</label>
                <select
                  value={newGoalType}
                  onChange={(e) => setNewGoalType(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
                >
                  <option value="form_submit">Form Submit</option>
                  <option value="button_click">Button Click</option>
                  <option value="signup">Signup</option>
                  <option value="file_download">File Download</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Target Count</label>
                <input
                  type="number"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-accent dark:focus:ring-accent"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGoal}
                disabled={!newGoalName || !newGoalTarget || createGoalMutation.isPending}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-accent dark:text-gray-950 dark:hover:bg-accent/90"
              >
                {createGoalMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        )}

        {/* Goal Cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const pct = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
            return (
              <div
                key={goal.id}
                className={`rounded-xl border p-5 transition-colors ${
                  goal.active
                    ? "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/50"
                    : "border-gray-100 bg-gray-50 opacity-60 dark:border-gray-800/50 dark:bg-gray-900/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {goal.name}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${
                          EVENT_TYPE_COLORS[goal.eventType] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {goal.eventType.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Target: {goal.target.toLocaleString()}
                    </p>
                  </div>
                  {/* Active / Inactive toggle indicator */}
                  <button
                    onClick={() => toggleGoal(goal.id, goal.active)}
                    disabled={updateGoalMutation.isPending}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                      goal.active ? "bg-green-500 dark:bg-accent" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                        goal.active ? "translate-x-4 ml-0.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {goal.current.toLocaleString()}
                    </span>
                    <span className="text-gray-400">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        goal.active
                          ? "bg-green-500 dark:bg-accent"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversion Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bar Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">
            Conversions (Last 14 Days)
          </h2>
          <div className="mt-6 flex items-end gap-1.5" style={{ height: "200px" }}>
            {dailyConversions.map((d) => {
              const h = Math.max(8, (d.value / maxConversions) * 100);
              return (
                <div
                  key={d.day}
                  className="group relative flex flex-1 flex-col items-center"
                  style={{ height: "100%" }}
                >
                  <div className="flex flex-1 w-full items-end">
                    <div
                      className="w-full rounded-t-sm bg-green-500 transition-colors hover:bg-green-600 dark:bg-accent/80 dark:hover:bg-accent"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                    {d.value}
                  </div>
                </div>
              );
            })}
          </div>
          {dailyConversions.length > 0 && (
            <div className="mt-2 flex justify-between text-[10px] text-gray-400 dark:text-gray-600">
              <span>{dailyConversions[0].day}</span>
              <span>{dailyConversions[Math.min(6, dailyConversions.length - 1)].day}</span>
              <span>{dailyConversions[dailyConversions.length - 1].day}</span>
            </div>
          )}
        </div>

        {/* Source Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">
            Conversion Sources
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            {conversionSources.map((src) => (
              <div key={src.source}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {src.source}
                  </span>
                  <span className="text-gray-500">
                    {src.count} <span className="text-gray-400">({src.pct}%)</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-full rounded-full ${SOURCE_COLORS[src.source] || "bg-gray-400"}`}
                    style={{ width: `${src.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
