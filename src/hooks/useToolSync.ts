import { useState, useCallback, useEffect } from "react";

const TOOL_API = "https://functions.poehali.dev/817cc650-9d57-4575-8a6d-072b98b1b815";

type ToolType = "barrier-bot" | "psych-bot" | "career-test" | "income-bot" | "plan-bot" | "diary" | "progress";

function getUserData() {
  const u = localStorage.getItem("pdd_user");
  return u ? JSON.parse(u) : null;
}

export default function useToolSync<T>(toolType: ToolType, localStorageKey: string) {
  const [sessions, setSessions] = useState<T[]>([]);
  const [syncing, setSyncing] = useState(false);

  const loadLocal = useCallback((): T[] => {
    const email = getUserData()?.email;
    if (!email) return [];
    const raw = localStorage.getItem(`${localStorageKey}_${email}`) ?? "[]";
    return JSON.parse(raw);
  }, [localStorageKey]);

  const saveLocal = useCallback((data: T[]) => {
    const email = getUserData()?.email;
    if (!email) return;
    localStorage.setItem(`${localStorageKey}_${email}`, JSON.stringify(data));
  }, [localStorageKey]);

  const initialSync = useCallback(async () => {
    const userData = getUserData();
    if (!userData?.id) {
      const local = loadLocal();
      setSessions(local);
      return;
    }

    const local = loadLocal();
    if (local.length > 0) {
      setSessions(local);
    }

    setSyncing(true);
    try {
      const resp = await fetch(TOOL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync",
          userId: userData.id,
          toolType,
          sessions: local,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.sessions) {
          setSessions(data.sessions);
          saveLocal(data.sessions);
          if (data.sessions.length > 0) {
            localStorage.setItem(`pdd_ever_done_${userData.email}_${toolType}`, "1");
          }
        }
      }
    } catch {
      // offline — use local
    } finally {
      setSyncing(false);
    }
  }, [toolType, loadLocal, saveLocal]);

  const saveSession = useCallback(async (record: T): Promise<T> => {
    const userData = getUserData();

    if (userData?.id) {
      try {
        const resp = await fetch(TOOL_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save",
            userId: userData.id,
            toolType,
            sessionData: record,
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.id) {
            const withId = { ...record, _server_id: data.id } as T;
            setSessions((prev) => {
              const updated = [...prev, withId];
              saveLocal(updated);
              return updated;
            });
            if (userData.email) {
              localStorage.setItem(`pdd_ever_done_${userData.email}_${toolType}`, "1");
            }
            return withId;
          }
        }
      } catch {
        // fallback below
      }
    }

    setSessions((prev) => {
      const updated = [...prev, record];
      saveLocal(updated);
      return updated;
    });
    const email = userData?.email;
    if (email) {
      localStorage.setItem(`pdd_ever_done_${email}_${toolType}`, "1");
    }
    return record;
  }, [toolType, saveLocal]);

  const forceSync = useCallback(async () => {
    const userData = getUserData();
    if (!userData?.id) return;

    setSyncing(true);
    try {
      const resp = await fetch(TOOL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync",
          userId: userData.id,
          toolType,
          sessions,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.sessions) {
          setSessions(data.sessions);
          saveLocal(data.sessions);
        }
      }
    } catch {
      // offline
    } finally {
      setSyncing(false);
    }
  }, [toolType, sessions, saveLocal]);

  useEffect(() => {
    initialSync();
  }, [initialSync]);

  return { sessions, setSessions, saveSession, forceSync, syncing, saveLocal };
}
