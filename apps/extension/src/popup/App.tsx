import { Home } from "../components/Home";
import { Onboarding } from "../components/Onboarding";
import { useSession } from "./hooks/useSession";

export function App() {
  const { loading, session } = useSession();

  if (loading) {
    return <main className="popup" />;
  }

  return (
    <main className="popup">
      <header className="popup__header">
        <h1>Tabyport</h1>
        {session && <span className="muted">@{session.username}</span>}
      </header>
      {session ? <Home session={session} /> : <Onboarding />}
    </main>
  );
}
