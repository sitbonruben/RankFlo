"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-500/10 text-purple-400 ring-purple-500/20",
  EDITOR: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  AUTHOR: "bg-green-500/10 text-green-400 ring-green-500/20",
  VIEWER: "bg-gray-500/10 text-gray-400 ring-gray-500/20",
};

const ROLES = ["ADMIN", "EDITOR", "AUTHOR", "VIEWER"] as const;
type Role = (typeof ROLES)[number];

function Avatar({ name, url }: { name?: string | null; url?: string | null }) {
  if (url) {
    return <img src={url} alt={name ?? ""} className="h-9 w-9 rounded-full object-cover" />;
  }
  const initials = (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-gray-300">
      {initials}
    </div>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("EDITOR");
  const utils = trpc.useUtils();

  const invite = trpc.organization.inviteMember.useMutation({
    onSuccess: () => {
      utils.organization.listMembers.invalidate();
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-white">Invite member</h3>
        <p className="mt-1 text-sm text-gray-500">
          The user must already have a RankFlo account.
        </p>

        {invite.error && (
          <div className="mt-4 rounded-lg bg-red-950/30 px-3 py-2 text-sm text-red-400">
            {invite.error.message}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-400">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              placeholder="colleague@example.com"
              className="h-10 rounded-lg border border-gray-700 bg-gray-900 px-3 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-400">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="h-10 rounded-lg border border-gray-700 bg-gray-900 px-3 text-sm text-white focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div className="mt-1 rounded-lg border border-gray-800 bg-gray-900/50 p-3 text-xs text-gray-500 leading-relaxed">
            <strong className="text-gray-400">Admin</strong> — full access &nbsp;·&nbsp;
            <strong className="text-gray-400">Editor</strong> — edit posts, tags &nbsp;·&nbsp;
            <strong className="text-gray-400">Author</strong> — own posts only &nbsp;·&nbsp;
            <strong className="text-gray-400">Viewer</strong> — read only
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => invite.mutate({ email, role })}
            disabled={!email || invite.isPending}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            {invite.isPending ? "Inviting…" : "Send invite"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsTeamPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data: members, isLoading } = trpc.organization.listMembers.useQuery();
  const { data: me } = trpc.user.me.useQuery();

  const updateRole = trpc.organization.updateMemberRole.useMutation({
    onSuccess: () => utils.organization.listMembers.invalidate(),
  });

  const removeMember = trpc.organization.removeMember.useMutation({
    onSuccess: () => {
      utils.organization.listMembers.invalidate();
      setConfirmRemove(null);
    },
  });

  const currentUserId = me?.id;

  return (
    <div className="space-y-6">
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}

      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Remove member?</h3>
            <p className="mt-2 text-sm text-gray-400">
              They will lose access to this workspace immediately.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmRemove(null)}
                className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => removeMember.mutate({ userId: confirmRemove })}
                disabled={removeMember.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {removeMember.isPending ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team</h2>
          <p className="text-sm text-gray-500">Manage members and their access levels.</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Invite member
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-500">
            Loading…
          </div>
        ) : !members?.length ? (
          <div className="py-16 text-center text-sm text-gray-500">
            No members yet. Invite someone to get started.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {members.map((m) => {
              const isMe = m.user.id === currentUserId;
              return (
                <li key={m.userId} className="flex items-center gap-4 px-5 py-4">
                  <Avatar name={m.user.name} url={m.user.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {m.user.name ?? m.user.email}
                      {isMe && (
                        <span className="ml-2 text-xs text-gray-500">(you)</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-gray-500">{m.user.email}</p>
                  </div>

                  {/* Role selector */}
                  {!isMe ? (
                    <select
                      value={m.role}
                      onChange={(e) =>
                        updateRole.mutate({ userId: m.user.id, role: e.target.value as Role })
                      }
                      className="rounded-md border border-gray-200 bg-transparent px-2 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:text-gray-300"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_COLORS[m.role] ?? ROLE_COLORS.VIEWER}`}
                    >
                      {m.role.charAt(0) + m.role.slice(1).toLowerCase()}
                    </span>
                  )}

                  {/* Remove */}
                  {!isMe && (
                    <button
                      onClick={() => setConfirmRemove(m.user.id)}
                      className="ml-1 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
                      title="Remove member"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                      </svg>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Team members must have an existing RankFlo account before they can be invited.
      </p>
    </div>
  );
}
