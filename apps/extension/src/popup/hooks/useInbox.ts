import { useCallback, useEffect, useState } from "react";
import type { MessageDto } from "@tabyport/shared";
import { POPUP_REFRESH_INTERVAL_MS } from "../../config";
import { syncInbox } from "../../services/inboxService";
import { onValueChanged, readValue } from "../../storage/localStore";
import { useInterval } from "./useInterval";

export function useInbox(): MessageDto[] {
  const [inbox, setInbox] = useState<MessageDto[]>([]);

  useEffect(() => {
    void readValue("inbox").then((stored) => setInbox(stored ?? []));
    return onValueChanged("inbox", (stored) => setInbox(stored ?? []));
  }, []);

  const refresh = useCallback(async () => {
    try {
      await syncInbox({ notify: false });
    } catch (error) {
      console.warn("Inbox sync failed", error);
    }
  }, []);

  useInterval(() => void refresh(), POPUP_REFRESH_INTERVAL_MS);

  return inbox;
}
