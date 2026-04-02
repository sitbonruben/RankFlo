"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

const ALL_EVENTS = [
  { value: "post.published", label: "Post published" },
  { value: "post.updated",   label: "Post updated" },
  { value: "post.deleted",   label: "Post deleted" },
  { value: "subscriber.created", label: "New subscriber" },
];

function DeliveryLog({ webhookId, onClose }: { webhookId: string; onClose: () => void }) {
  const { data, isLoading } = trpc.webhook.deliveries.useQuery({ webhookId, page: 1, pageSize: 20 });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800 shrink-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Delivery history</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />)}</div>
          ) : !data?.items.length ? (
            <p className="py-8 text-center text-sm text-gray-400">No deliveries yet</p>
          ) : (
            <div className="space-y-2">
              {data.items.map((d) => (
                <div key={d.id} className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${d.status === "SUCCESS" ? "bg-green-500" : d.status === "FAILED" || d.status === "DEAD" ? "bg-red-500" : "bg-amber-400"}`} />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{d.status}</span>
                      {d.httpStatus && <span className="text-xs text-gray-400 dark:text-gray-600">HTTP {d.httpStatus}</span>}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-600">{new Date(d.createdAt).toLocaleString()}</span>
                  </div>
                  {d.error && <p className="mt-1 truncate text-xs text-red-500">{d.error}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WebhookModal({
  initial, onClose, onSave, saving,
}: {
  initial?: { id: string; url: string; events: string[]; description: string | null };
  onClose: () => void;
  onSave: (d: { url: string; events: string[]; description: string }) => void;
  saving: boolean;
}) {
  const [url, setUrl] = useState(initial?.url ?? "");
  const [events, setEvents] = useState<string[]>(initial?.events ?? ["post.published"]);
  const [description, setDescription] = useState(initial?.description ?? "");
  const toggle = (v: string) => setEvents((p) => p.includes(v) ? p.filter((e) => e !== v) : [...p, v]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{initial ? "Edit webhook" : "Add endpoint"}</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ url, events, description }); }} className="flex flex-col gap-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Endpoint URL *</label>
            <input type="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-app.com/webhooks" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Notify CMS on publish" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">Events *</label>
            <div className="space-y-2">
              {ALL_EVENTS.map((ev) => (
                <label key={ev.value} className="flex cursor-pointer items-center gap-2.5">
                  <input type="checkbox" checked={events.includes(ev.value)} onChange={() => toggle(ev.value)} className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{ev.label}</span>
                  <code className="ml-auto text-[10px] text-gray-400 dark:text-gray-600">{ev.value}</code>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
            <button type="submit" disabled={saving || events.length === 0} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 dark:bg-accent dark:text-black">
              {saving ? "Saving…" : initial ? "Save" : "Add endpoint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SettingsWebhooksPage() {
  const utils = trpc.useUtils();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<null | { id: string; url: string; events: string[]; description: string | null; isActive: boolean }>(null);
  const [logsId, setLogsId] = useState<string | null>(null);

  const { data: webhooks, isLoading } = trpc.webhook.list.useQuery();
  const create = trpc.webhook.create.useMutation({ onSuccess: () => { void utils.webhook.list.invalidate(); setShowModal(false); } });
  const update = trpc.webhook.update.useMutation({ onSuccess: () => { void utils.webhook.list.invalidate(); setEditItem(null); } });
  const del = trpc.webhook.delete.useMutation({ onSuccess: () => void utils.webhook.list.invalidate() });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Webhooks</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Get real-time HTTP notifications when content changes.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700 dark:bg-accent dark:text-black"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add endpoint
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />)}</div>
      ) : !webhooks?.length ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <svg className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">No webhooks yet</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">Add an endpoint to receive events like post.published in real-time.</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-sm font-medium text-green-600 hover:underline dark:text-accent">Add your first endpoint →</button>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 divide-y divide-gray-50 dark:divide-gray-900">
          {webhooks.map((wh) => (
            <div key={wh.id} className="flex items-start gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${wh.isActive ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{wh.url}</p>
                </div>
                {wh.description && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">{wh.description}</p>}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {wh.events.map((ev) => (
                    <span key={ev} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">{ev}</span>
                  ))}
                  <span className="text-[10px] text-gray-400 dark:text-gray-600">· {wh._count.deliveries} deliveries</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => setLogsId(wh.id)} title="View logs" className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
                </button>
                <button onClick={() => update.mutate({ id: wh.id, isActive: !wh.isActive })} title={wh.isActive ? "Pause" : "Enable"} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
                  {wh.isActive
                    ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
                    : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
                  }
                </button>
                <button onClick={() => setEditItem(wh)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                </button>
                <button onClick={() => { if (confirm("Delete this webhook endpoint?")) del.mutate({ id: wh.id }); }} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Verifying webhook signatures</p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Every delivery includes an <code className="rounded bg-gray-200 px-1 dark:bg-gray-800">X-RankFlo-Signature</code> header —
          HMAC-SHA256 of the payload signed with your endpoint secret.
        </p>
      </div>

      {showModal && <WebhookModal onClose={() => setShowModal(false)} onSave={(d) => create.mutate({ url: d.url, events: d.events, description: d.description || undefined })} saving={create.isPending} />}
      {editItem && <WebhookModal initial={editItem} onClose={() => setEditItem(null)} onSave={(d) => update.mutate({ id: editItem.id, url: d.url, events: d.events, description: d.description })} saving={update.isPending} />}
      {logsId && <DeliveryLog webhookId={logsId} onClose={() => setLogsId(null)} />}
    </div>
  );
}
