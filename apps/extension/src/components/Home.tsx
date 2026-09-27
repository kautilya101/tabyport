import { useEffect, useState } from "react";
import { getOrCreateDeviceId } from "../services/deviceService";
import type { Session } from "../storage/localStore";
import { useDevices } from "../popup/hooks/useDevices";
import { useInbox } from "../popup/hooks/useInbox";
import { DeviceList } from "./DeviceList";
import { PendingWorkspaceCard } from "./PendingWorkspaceCard";
import { SendWorkspace } from "./SendWorkspace";

interface HomeProps {
  session: Session;
}

export function Home({ session }: HomeProps) {
  const { devices, error, loaded } = useDevices(session.userId);
  const inbox = useInbox();
  const [deviceId, setDeviceId] = useState<string>();

  useEffect(() => {
    void getOrCreateDeviceId().then(setDeviceId);
  }, []);
  
  const otherDevices = devices.filter((device) => device.deviceId !== deviceId);

  return (
    <div className="stack">
      {inbox.map((message) => (
        <PendingWorkspaceCard key={message.id} message={message} />
      ))}

      <section className="card">
        <h2>This device</h2>
        <p className="device-name">{session.deviceName}</p>
      </section>

      <SendWorkspace targets={otherDevices} />

      <section className="stack stack--tight">
        <h2>Devices</h2>
        {error && <p className="error">{error}</p>}
        {loaded ? <DeviceList devices={otherDevices} /> : <p className="muted">Loading...</p>}
      </section>
    </div>
  );
}
