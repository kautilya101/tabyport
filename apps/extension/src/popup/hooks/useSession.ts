import { useEffect, useState } from "react";
import { onValueChanged, readValue, type Session } from "../../storage/localStore";

interface SessionState {
  loading: boolean;
  session: Session | undefined;
}

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ loading: true, session: undefined });

  useEffect(() => {
    void readValue("session").then((session) => setState({ loading: false, session }));
    return onValueChanged("session", (session) => setState({ loading: false, session }));
  }, []);

  return state;
}
