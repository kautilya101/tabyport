import { useEffect, useState, type FormEvent } from "react";
import { deviceNameSchema, usernameSchema } from "@tabyport/shared";
import { api } from "../services/apiClient";
import { onboard } from "../services/deviceService";
import { useDebouncedValue } from "../popup/hooks/useDebouncedValue";

type UsernameHint = "idle" | "new" | "existing" | "invalid";

const HINT_TEXT: Record<UsernameHint, string> = {
  idle: "",
  new: "New username. An account will be created.",
  existing: "Existing username. This device will join it.",
  invalid: "3-32 characters: letters, numbers, '_' or '-'.",
};

export function Onboarding() {
  const [username, setUsername] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [hint, setHint] = useState<UsernameHint>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const debouncedUsername = useDebouncedValue(username, 300);

  useEffect(() => {
    if (!debouncedUsername) {
      setHint("idle");
      return;
    }
    const parsed = usernameSchema.safeParse(debouncedUsername);
    if (!parsed.success) {
      setHint("invalid");
      return;
    }
    let cancelled = false;
    api
      .checkUsername(parsed.data)
      .then(({ available }) => !cancelled && setHint(available ? "new" : "existing"))
      .catch(() => !cancelled && setHint("idle"));
    return () => {
      cancelled = true;
    };
  }, [debouncedUsername]);

  const canSubmit =
    usernameSchema.safeParse(username).success &&
    deviceNameSchema.safeParse(deviceName).success &&
    !submitting;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);
    try {
      await onboard(usernameSchema.parse(username), deviceNameSchema.parse(deviceName));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <p className="muted">Pick a username and name this device to get started.</p>
      <label className="field">
        <span>Username</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="kautilya"
          autoFocus
        />
        {hint !== "idle" && <small className={`hint hint--${hint}`}>{HINT_TEXT[hint]}</small>}
      </label>
      <label className="field">
        <span>Device name</span>
        <input
          value={deviceName}
          onChange={(event) => setDeviceName(event.target.value)}
          placeholder="MacBook"
          maxLength={50}
        />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" className="button button--primary" disabled={!canSubmit}>
        {submitting ? "Setting up..." : "Continue"}
      </button>
    </form>
  );
}
