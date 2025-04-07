"use client";

import { useCallback, useEffect, useRef } from "react";

export const useCancellableTimeout = (
  actionFn: () => void,
  timeoutMs: number,
) => {
  const abortControllerRef = useRef<AbortController | null>(null);

  // Function to execute the timeout
  const execute = useCallback(() => {
    // Abort any existing timeout
    abortControllerRef.current?.abort();

    // Create a new AbortController
    const controller = new AbortController();
    const signal = controller.signal;
    abortControllerRef.current = controller;

    // Set the timeout and listen for abort events
    const timeoutId = setTimeout(() => {
      if (!signal.aborted) {
        actionFn();
      }
    }, timeoutMs);

    signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
    });
  }, [actionFn, timeoutMs]);

  // Function to cancel the timeout
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => abortControllerRef.current?.abort();
  }, []);

  return { execute, cancel };
};
