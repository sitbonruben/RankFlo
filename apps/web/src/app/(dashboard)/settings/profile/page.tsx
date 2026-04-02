"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";

export default function SettingsProfilePage() {
  const { data: me, isLoading } = trpc.user.me.useQuery();
  const utils = trpc.useUtils();

  // Profile fields
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    if (!me) return;
    setName(me.name ?? "");
    setAvatarUrl(me.avatarUrl ?? "");
  }, [me]);

  const updateProfile = trpc.user.update.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    },
  });

  const changePassword = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwError("");
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    },
    onError: (err) => setPwError(err.message),
  });

  const initials = (me?.name ?? me?.email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-500">Loading…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
        <p className="text-sm text-gray-500">Update your personal information and password.</p>
      </div>

      {/* Profile info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Personal info</h3>

        <div className="mt-4 flex items-center gap-4">
          {me?.avatarUrl ? (
            <img
              src={me.avatarUrl}
              alt={me.name ?? ""}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {initials}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{me?.name ?? "—"}</p>
            <p className="text-xs text-gray-500">{me?.email}</p>
          </div>
        </div>

        {updateProfile.error && (
          <div className="mt-4 rounded-lg bg-red-950/30 px-3 py-2 text-sm text-red-400">
            {updateProfile.error.message}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-name" className="text-sm text-gray-500">
              Display name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-avatar" className="text-sm text-gray-500">
              Avatar URL
            </label>
            <input
              id="profile-avatar"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:placeholder-gray-600"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          {profileSaved && <span className="text-sm text-green-500">Saved!</span>}
          <button
            onClick={() =>
              updateProfile.mutate({
                name: name || undefined,
                avatarUrl: avatarUrl || null,
              })
            }
            disabled={updateProfile.isPending}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
          >
            {updateProfile.isPending ? "Saving…" : "Save profile"}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Change password</h3>
        <p className="mt-0.5 text-xs text-gray-500">
          Leave blank if you signed up with Google or GitHub.
        </p>

        {pwError && (
          <div className="mt-4 rounded-lg bg-red-950/30 px-3 py-2 text-sm text-red-400">{pwError}</div>
        )}

        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pw-current" className="text-sm text-gray-500">
              Current password
            </label>
            <input
              id="pw-current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pw-new" className="text-sm text-gray-500">
              New password
            </label>
            <input
              id="pw-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:placeholder-gray-600"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pw-confirm" className="text-sm text-gray-500">
              Confirm new password
            </label>
            <input
              id="pw-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          {pwSaved && <span className="text-sm text-green-500">Password updated!</span>}
          <button
            onClick={() => {
              setPwError("");
              if (newPassword !== confirmPassword) {
                setPwError("Passwords don't match");
                return;
              }
              changePassword.mutate({ currentPassword, newPassword, confirmPassword });
            }}
            disabled={changePassword.isPending || !currentPassword || !newPassword}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            {changePassword.isPending ? "Updating…" : "Update password"}
          </button>
        </div>
      </div>
    </div>
  );
}
