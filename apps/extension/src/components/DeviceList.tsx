import type { DeviceDto } from "@tabyport/shared";

interface DeviceListProps {
  devices: DeviceDto[];
}

export function DeviceList({ devices }: DeviceListProps) {
  if (devices.length === 0) {
    return <p className="muted">No other devices yet. Install Tabyport elsewhere with the same username.</p>;
  }

  return (
    <ul className="device-list">
      {devices.map((device) => (
        <li key={device.deviceId} className="device-list__item">
          <span>{device.name}</span>
          <span className={`status ${device.online ? "status--online" : "status--offline"}`}>
            {device.online ? "Online" : "Offline"}
          </span>
        </li>
      ))}
    </ul>
  );
}
