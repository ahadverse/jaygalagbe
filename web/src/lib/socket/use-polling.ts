"use client";

import { useEffect, useRef } from "react";

/**
 * Runs `task` every `intervalMs` while `enabled` and the tab is visible.
 * Runs once immediately, and again whenever the tab becomes visible, so
 * returning to a backgrounded tab catches up without waiting a full interval.
 */
export function usePolling(
  task: () => void | Promise<void>,
  intervalMs: number,
  enabled: boolean,
) {
  const taskRef = useRef(task);
  useEffect(() => {
    taskRef.current = task;
  });

  useEffect(() => {
    if (!enabled) return;

    const run = () => {
      if (document.hidden) return;
      void Promise.resolve(taskRef.current()).catch(() => {});
    };

    run();
    const timer = setInterval(run, intervalMs);
    document.addEventListener("visibilitychange", run);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", run);
    };
  }, [enabled, intervalMs]);
}
