"use client";

import { useRef } from "react";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

interface FileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
  onNewNote?: () => void;
  onPinNote?: () => void;
  onDeleteNote?: () => void;
  noteIsPinned?: boolean;
  noteIsPublic?: boolean;
  onNewChat?: () => void;
  onPinChat?: () => void;
  onHideAlerts?: () => void;
  onDeleteChat?: () => void;
  chatIsPinned?: boolean;
  hideAlertsActive?: boolean;
}

export function FileMenu({
  isOpen,
  onClose,
  appId,
  onNewNote,
  onPinNote,
  onDeleteNote,
  noteIsPinned,
  onNewChat,
  onPinChat,
  onHideAlerts,
  onDeleteChat,
  chatIsPinned,
  hideAlertsActive,
  noteIsPublic,
}: FileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, onClose, isOpen);

  if (!isOpen) return null;

  const isNotes = appId === "notes";
  const isMessages = appId === "messages";

  return (
    <div
      ref={menuRef}
      className="absolute top-7 left-[120px] w-56 rounded-lg bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl shadow-2xl border border-black/10 dark:border-white/10 py-1 z-[70] overflow-hidden"
    >
      {isNotes && (
        <>
          <MenuItem
            label="New Note"
            shortcut="N"
            onClick={() => {
              onNewNote?.();
              onClose();
            }}
          />
          <MenuItem
            label={noteIsPinned ? "Unpin Note" : "Pin Note"}
            shortcut="P"
            disabled={noteIsPublic}
            onClick={() => {
              if (!noteIsPublic) {
                onPinNote?.();
                onClose();
              }
            }}
          />
          <MenuItem
            label="Delete Note"
            shortcut="D"
            disabled={noteIsPublic}
            onClick={() => {
              if (!noteIsPublic) {
                onDeleteNote?.();
                onClose();
              }
            }}
          />
        </>
      )}

      {isMessages && (
        <>
          <MenuItem
            label="New Message"
            shortcut="N"
            onClick={() => {
              onNewChat?.();
              onClose();
            }}
          />
          <MenuItem
            label={chatIsPinned ? "Unpin Conversation" : "Pin Conversation"}
            shortcut="P"
            onClick={() => {
              onPinChat?.();
              onClose();
            }}
          />
          <MenuItem
            label={hideAlertsActive ? "Show Alerts" : "Hide Alerts"}
            shortcut="H"
            onClick={() => {
              onHideAlerts?.();
              onClose();
            }}
          />
          <MenuItem
            label="Delete Conversation"
            shortcut="D"
            onClick={() => {
              onDeleteChat?.();
              onClose();
            }}
          />
        </>
      )}
    </div>
  );
}

function MenuItem({
  label,
  shortcut,
  disabled = false,
  onClick,
}: {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={disabled ? () => {} : onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors group ${
        disabled
          ? "text-muted-foreground cursor-default"
          : "hover:bg-blue-500 hover:text-white"
      }`}
    >
      <span>{label}</span>
      {shortcut && (
        <span className="text-xs text-muted-foreground group-hover:text-white/70">
          {shortcut}
        </span>
      )}
    </button>
  );
}
