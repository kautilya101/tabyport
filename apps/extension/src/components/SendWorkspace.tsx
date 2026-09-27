import { useEffect, useState, type FormEvent } from "react";
import type { DeviceDto } from "@tabyport/shared";
import { captureCurrentWindow, sendWorkspace, type CapturedWindow } from "../services/workspaceService";

interface SendWorkspaceProps {
  targets: DeviceDto[];
}

type SendState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; deviceName: string }
  | { kind: "error"; message: string };

export function SendWorkspace({ targets }: SendWorkspaceProps) {
  const [captured, setCaptured] = useState<CapturedWindow>();
  const [name, setName] = useState("");
  const [receiverDeviceId, setReceiverDeviceId] = useState("");
  const [state, setState] = useState<SendState>({ kind: "idle" });

  useEffect(() => {
    void captureCurrentWindow().then((result) => {
      setCaptured(result);
      setName(result.suggestedName);
    });
  }, []);

  const selectedTarget = targets.find((device) => device.deviceId === receiverDeviceId);
  const tabCount = captured?.tabs.length ?? 0;
  const canSend =
    selectedTarget !== undefined && tabCount > 0 && name.trim() !== "" && state.kind !== "sending";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!captured || !selectedTarget) {
      return;
    }
    setState({ kind: "sending" });
    try {
      await sendWorkspace(selectedTarget.deviceId, { name: name.trim(), tabs: captured.tabs });
      setState({ kind: "sent", deviceName: selectedTarget.name });
    } catch (err) {
      setState({ kind: "error", message: err instanceof Error ? err.message : "Could not send" });
    }
  }

  if (targets.length === 0) {
    return null;
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Send current workspace</h2>
      <p className="muted">
        {tabCount} {tabCount === 1 ? "tab" : "tabs"} in this window
        {captured && captured.skippedCount > 0 && ` (${captured.skippedCount} skipped)`}
      </p>
      <label className="field">
        <span>Name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} />
      </label>
      <label className="field">
        <span>Send to</span>
        <select value={receiverDeviceId} onChange={(event) => setReceiverDeviceId(event.target.value)}>
          <option value="" disabled>
            Select a device
          </option>
          {targets.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.name} ({device.online ? "online" : "offline"})
            </option>
          ))}
        </select>
      </label>
      {state.kind === "sent" && <p className="success">Sent to {state.deviceName}.</p>}
      {state.kind === "error" && <p className="error">{state.message}</p>}
      <button type="submit" className="button button--primary" disabled={!canSend}>
        {state.kind === "sending" ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
