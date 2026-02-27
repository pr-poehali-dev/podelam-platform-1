import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const INACTIVITY_MS = 5 * 60 * 1000;
const ACTIVITY_KEY = "pdd_last_activity";
const CHECK_INTERVAL = 30_000;

const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll", "mousemove"];

export default function useAutoLogout() {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateActivity = useCallback(() => {
    localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
  }, []);

  const checkExpired = useCallback(() => {
    const user = localStorage.getItem("pdd_user");
    if (!user) return;

    const last = parseInt(localStorage.getItem(ACTIVITY_KEY) || "0", 10);
    if (last > 0 && Date.now() - last > INACTIVITY_MS) {
      localStorage.removeItem("pdd_user");
      localStorage.removeItem(ACTIVITY_KEY);
      navigate("/auth");
    }
  }, [navigate]);

  useEffect(() => {
    const user = localStorage.getItem("pdd_user");
    if (!user) return;

    updateActivity();

    const handler = () => updateActivity();
    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, handler, { passive: true });
    }

    timerRef.current = setInterval(checkExpired, CHECK_INTERVAL);

    return () => {
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, handler);
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [updateActivity, checkExpired]);
}
