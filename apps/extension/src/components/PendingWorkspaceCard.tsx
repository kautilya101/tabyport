import { useState } from "react";
import type { MessageDto } from "@tabyport/shared";
import { dismissWorkspace } from "../services/inboxService";
import { sendToBackground } from "../services/messaging";

interface PendingWorkspaceCardProps {
  message: MessageDto;
}

export function PendingWorkspaceCard({ message }: PendingWorkspaceCardProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const tabCount = message.payload.tabs.length;

  async function run(action: () => Promise<void>, fallbackError: string) {
    setBusy(true);
    setError(undefined);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackError);
      setBusy(false);
    }
  }

  const handleOpen = () =>
    run(
      () => sendToBackground({ type: "OPEN_WORKSPACE", messageId: message.id }),
      "Could not open workspace",
    );

  const handleDismiss = () => run(() => dismissWorkspace(message.id), "Could not dismiss workspace");

  return (
    <article className="card card--highlight">
      <h2>Workspace waiting</h2>
      <p className="device-name">{message.payload.name}</p>
      <p className="muted">From: {message.senderDeviceName}</p>
      <p className="muted">
        {tabCount} {tabCount === 1 ? "tab" : "tabs"}
      </p>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button type="button" className="button button--primary" disabled={busy} onClick={handleOpen}>
          Open Workspace
        </button>
        <button type="button" className="button" disabled={busy} onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </article>
  );
}
