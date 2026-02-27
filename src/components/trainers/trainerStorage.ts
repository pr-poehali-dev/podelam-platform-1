import { TrainerSession, TrainerId, TrainerStats } from "./types";

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
