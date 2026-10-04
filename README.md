# Tabyport

> A browser extension to send your open tabs to another one of your devices.

https://github.com/user-attachments/assets/bfa0a1d2-def8-4e11-a73f-9df466ea95ed

Tabyport lets you pick up where you left off on another computer: it sends the tabs in your current window, as a named "workspace", to a specific device of yours, which can open them all with one click, even if it was offline when you sent them.

## Get Tabyport

https://chromewebstore.google.com/detail/tabyport/mfejbibbjdbmmjooomhdfnhinbghfghb

## Features

- Send the tabs in your current window to any of your other devices, with a name such as "React Interview"
- Works whether the receiving device is online or offline; workspaces wait until it comes back
- See which of your devices are online
- A badge and a notification tell you when a workspace is waiting
- Nothing opens automatically: you choose **Open Workspace** or **Dismiss**
- Each workspace opens only once, even if it is received more than once

## How it works

Every workspace you send is saved on the Tabyport server as a message addressed to one device. The server is the source of truth, so nothing is lost if the receiving device is offline or loses its connection.

```text
Device A ── Send ──► Tabyport API ──► PostgreSQL (PENDING)
                                            │
Device B ◄── checks for new workspaces ─────┘
   │
   ├── received        → DELIVERED (badge + notification)
   ├── Open Workspace  → tabs open, COMPLETED
   └── Dismiss         → DISMISSED
```

- **Delivery:** each device checks the server for waiting workspaces about every 30 seconds in the background, every 10 seconds while its popup is open, and immediately when Chrome starts.
- **Presence:** each device reports that it is alive with every check. A device counts as online if it checked in within the last 60 seconds.
- **Duplicates:** before opening a workspace, the extension confirms with the server that it has not been opened or dismissed, and remembers which workspaces it has opened. If the server cannot be told about an opened workspace, the extension retries later.

The project is a TypeScript monorepo:

```text
apps/api            Express + Prisma REST API
apps/extension      Chrome extension (Manifest V3, React popup, background service worker)
packages/shared     Validation schemas and types shared by both
```

## Permissions

| Permission | Why Tabyport needs it |
| --- | --- |
| `tabs` | Read the addresses and titles of the tabs in your current window when you send them, and open the tabs of a workspace you choose to open |
| `storage` | Keep your settings and a copy of waiting workspaces on the device |
| `alarms` | Check for new workspaces and report that the device is online about every 30 seconds |
| `notifications` | Tell you when a workspace is waiting |
| Access to the Tabyport API | Talk to the Tabyport server. The extension does not access any other website. |

## Privacy

- **What is sent:** your username, your device names, a random device ID, and a "last seen" time.
- **Tabs are only sent when you click Send:** the workspace name plus the addresses and titles of the `http(s)` tabs in the current window.
- **What is not collected:** browsing history and analytics. There are no ads, and nothing is sold or shared beyond the providers that host the service.
- **Deletion:** opened and dismissed workspaces are deleted automatically after 30 days.
- **No login yet:** there are no passwords, so anyone who knows your username can see your device names and workspaces still waiting to be opened. Choose a username that is hard to guess, and avoid sending tabs whose addresses contain private information.

Read the full [privacy policy](docs/privacy-policy.html).

## Feedback

Found a bug or have an idea? [Open an issue](https://github.com/kautilya101/tabyport/issues).
