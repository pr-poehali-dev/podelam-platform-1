import { TrainerSession, TrainerId, TrainerStats } from "./types";
import { getSessionsFromServer, saveSessionToServer } from "@/lib/trainerAccess";

const STORAGE_PREFIX = "pdd_trainer_";

function getUserEmail(): string {
  try {
    const u = localStorage.getItem("pdd_user");
    if (u) return JSON.parse(u).email;
  } catch {
    /* ignore parse errors */
  }
  return "anonymous";
}

function key(suffix: string): string {
  return `${STORAGE_PREFIX}${getUserEmail()}_${suffix}`;
}

export function saveSessions(
  trainerId: TrainerId,
  sessions: TrainerSession[]
): void {
  localStorage.setItem(
    key(`sessions_${trainerId}`),
    JSON.stringify(sessions)
  );
}

export function getSessions(trainerId: TrainerId): TrainerSession[] {
  try {
    const raw = localStorage.getItem(key(`sessions_${trainerId}`));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCurrentSession(session: TrainerSession): void {
  localStorage.setItem(
    key(`current_${session.trainerId}`),
    JSON.stringify(session)
  );
}

export function getCurrentSession(
  trainerId: TrainerId
): TrainerSession | null {
  try {
    const raw = localStorage.getItem(key(`current_${trainerId}`));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCurrentSession(trainerId: TrainerId): void {
  localStorage.removeItem(key(`current_${trainerId}`));
}

export function addCompletedSession(session: TrainerSession): void {
  const sessions = getSessions(session.trainerId);
  sessions.push(session);
  saveSessions(session.trainerId, sessions);
  clearCurrentSession(session.trainerId);

  saveSessionToServer({
    trainerId: session.trainerId,
    sessionId: session.id,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    scores: session.scores,
    result: session.result,
    answers: session.answers,
  }).catch(() => {});
}

export async function syncSessionsFromServer(trainerId: TrainerId): Promise<void> {
  try {
    const serverSessions = await getSessionsFromServer(trainerId);
    if (!serverSessions.length) return;

    const local = getSessions(trainerId);
    const localIds = new Set(local.map((s) => s.id));

    let merged = false;
    for (const srv of serverSessions) {
      if (!srv.completed_at) continue;
      if (localIds.has(srv.session_id)) continue;

      const session: TrainerSession = {
        id: srv.session_id,
        trainerId: trainerId,
        startedAt: srv.started_at || new Date().toISOString(),
        completedAt: srv.completed_at,
        currentStepIndex: 0,
        answers: {},
        scores: srv.scores || {},
        result: srv.result as TrainerSession["result"] || undefined,
      };
      local.push(session);
      merged = true;
    }

    if (merged) {
      local.sort((a, b) => {
        const da = a.startedAt || "";
        const db = b.startedAt || "";
        return da.localeCompare(db);
      });
      saveSessions(trainerId, local);
    }

    for (const loc of local) {
      if (!loc.completedAt) continue;
      const onServer = serverSessions.some((s) => s.session_id === loc.id);
      if (!onServer) {
        saveSessionToServer({
          trainerId: loc.trainerId,
          sessionId: loc.id,
          startedAt: loc.startedAt,
          completedAt: loc.completedAt,
          scores: loc.scores,
          result: loc.result,
          answers: loc.answers,
        }).catch(() => {});
      }
    }
  } catch {
    // offline — skip
  }
}

export async function syncAllSessionsFromServer(): Promise<void> {
  const ids: TrainerId[] = [
    "conscious-choice",
    "emotions-in-action",
    "anti-procrastination",
    "self-esteem",
    "money-anxiety",
  ];
  await Promise.all(ids.map(syncSessionsFromServer));
}

export function getStats(trainerId: TrainerId): TrainerStats {
  const sessions = getSessions(trainerId);
  const completed = sessions.filter((s) => s.completedAt);

  const avgScores: Record<string, number> = {};
  if (completed.length > 0) {
    const last = completed[completed.length - 1];
    const prev =
      completed.length >= 2 ? completed[completed.length - 2] : null;

    if (last.result) {
      for (const [k, v] of Object.entries(last.result.scores)) {
        avgScores[k] = v;
      }
    }

    let trend: "up" | "down" | "stable" = "stable";
    if (prev?.result && last.result) {
      const lastTotal = last.result.scores["total"] || 0;
      const prevTotal = prev.result.scores["total"] || 0;
      if (lastTotal > prevTotal + 2) trend = "up";
      else if (lastTotal < prevTotal - 2) trend = "down";
    }

    return {
      trainerId,
      totalSessions: sessions.length,
      completedSessions: completed.length,
      lastSessionDate: completed[completed.length - 1]?.completedAt,
      averageScores: avgScores,
      trend,
    };
  }

  return {
    trainerId,
    totalSessions: 0,
    completedSessions: 0,
    averageScores: {},
    trend: "stable",
  };
}

export function getAllStats(): TrainerStats[] {
  const ids: TrainerId[] = [
    "conscious-choice",
    "emotions-in-action",
    "anti-procrastination",
    "self-esteem",
    "money-anxiety",
  ];
  return ids.map(getStats);
}

export function getCompletedSessionsForPeriod(
  trainerId: TrainerId,
  daysBack: number
): TrainerSession[] {
  const sessions = getSessions(trainerId);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);
  return sessions.filter(
    (s) => s.completedAt && new Date(s.completedAt) >= cutoff
  );
}
