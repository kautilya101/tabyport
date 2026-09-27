import { useCallback, useState } from "react";
import type { DeviceDto } from "@tabyport/shared";
import { POPUP_REFRESH_INTERVAL_MS } from "../../config";
import { api } from "../../services/apiClient";
import { syncPresence } from "../../services/deviceService";
import { useInterval } from "./useInterval";

interface DevicesState {
  devices: DeviceDto[];
  error: string | undefined;
  loaded: boolean;
}

export function useDevices(userId: string): DevicesState {
  const [state, setState] = useState<DevicesState>({ devices: [], error: undefined, loaded: false });

  const refresh = useCallback(async () => {
    try {
      await syncPresence();
      const devices = await api.listDevices(userId);
      setState({ devices, error: undefined, loaded: true });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loaded: true,
        error: error instanceof Error ? error.message : "Could not reach the server",
      }));
    }
  }, [userId]);

  useInterval(() => void refresh(), POPUP_REFRESH_INTERVAL_MS);

  return state;
}
