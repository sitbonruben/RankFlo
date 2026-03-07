"use client";

import type { AuthorBioBlockProps } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";

// ─── Props ──────────────────────────────────────────────
interface AuthorBioBlockComponentProps {
  id: string;
  props: AuthorBioBlockProps;
}

// ─── User Icon (avatar placeholder) ────────────────────
function UserIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ─── Plus Icon ─────────────────────────────────────────
function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ─── Close Icon ────────────────────────────────────────
function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Globe Icon ────────────────────────────────────────
function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────
export function AuthorBioBlock({ id, props }: AuthorBioBlockComponentProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const { name, avatar, bio, links } = props;

  const addLink = () => {
    const label = prompt("Link label (e.g., Twitter, Website):");
    if (!label) return;
    const url = prompt("Link URL:");
    if (!url) return;
    updateBlock(id, { links: [...links, { label, url }] });
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    updateBlock(id, { links: newLinks });
  };

  return (
    <div className="px-4 py-3">
      <div className="rounded-lg border border-gray-700 bg-gray-950 p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={name || "Author avatar"}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gray-700"
                onClick={() => {
                  const url = prompt("Enter avatar URL:");
                  if (url) {
                    updateBlock(id, { avatar: url });
                  }
                }}
                title="Click to set avatar"
              >
                <UserIcon />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Editable name */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="text-lg font-bold text-white outline-none focus:ring-1 focus:ring-[#39FF14]/50"
              onBlur={(e) => {
                const newName = e.currentTarget.textContent || "";
                if (newName !== name) {
                  updateBlock(id, { name: newName });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            >
              {name || "Author name"}
            </div>

            {/* Editable bio */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="mt-1 text-sm text-gray-400 outline-none focus:ring-1 focus:ring-[#39FF14]/50"
              onBlur={(e) => {
                const newBio = e.currentTarget.textContent || "";
                if (newBio !== bio) {
                  updateBlock(id, { bio: newBio });
                }
              }}
            >
              {bio || "Write a short bio..."}
            </div>

            {/* Social links */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="group/link flex items-center gap-1.5 rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-xs"
                >
                  <GlobeIcon />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-[#39FF14]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {link.label}
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLink(index);
                    }}
                    className="text-gray-600 opacity-0 transition-opacity hover:text-red-400 group-hover/link:opacity-100"
                    title="Remove link"
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}

              {/* Add link button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addLink();
                }}
                className="flex items-center gap-1 rounded-full border border-dashed border-gray-700 px-3 py-1 text-xs text-gray-500 transition-colors hover:border-gray-600 hover:text-gray-300"
              >
                <PlusIcon />
                Add link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
