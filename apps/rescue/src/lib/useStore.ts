"use client";

import { useCallback, useEffect, useState } from "react";

type Result<T> = { data: T | null; error: unknown };
export type StoreState<T> =
  | { status: "loading" }
  | { status: "error"; retry: () => void }
  | { status: "ready"; data: T | null; retry: () => void };

// FIX 4: every store read goes through this hook, so every page has a loading state,
// an error state with Retry, and never crashes on a failed request.
export function useStore<T>(load: () => PromiseLike<Result<T>>, deps: unknown[]): StoreState<T> {
  const [state, setState] = useState<StoreState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let live = true;
    setState({ status: "loading" });
    Promise.resolve(load())
      .then(({ data, error }) => {
        if (!live) return;
        setState(error ? { status: "error", retry } : { status: "ready", data, retry });
      })
      .catch(() => live && setState({ status: "error", retry }));
    return () => {
      live = false;
    };
  // `load` is re-created every render; the caller's deps (plus Retry) decide when to refetch.
  }, [...deps, attempt]);

  return state;
}
