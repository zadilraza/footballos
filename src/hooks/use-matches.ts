"use client";

import { useEffect, useState } from "react";
import type { Fixture, ApiResponse } from "@/types/football";

export function useMatches(selectedDate: string) {
  const [matches, setMatches] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadMatches() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/matches?date=${selectedDate}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load matches");
        }

        const data: ApiResponse = await response.json();

        if (data.errors && Object.keys(data.errors).length > 0) {
          const providerError = JSON.stringify(data.errors).toLowerCase();
          if (/suspend/.test(providerError)) {
            throw new Error("Football data is unavailable because the provider account is suspended. The site owner needs to check the API-Football dashboard.");
          }
          if (/limit|quota|too many requests/.test(providerError)) {
            throw new Error("The football data provider’s request limit has been reached. Please try again later.");
          }
          throw new Error("The football data provider is temporarily unavailable. Please try again later.");
        }
        if (!Array.isArray(data.response)) {
          throw new Error("The football data provider returned an invalid response. Please try again later.");
        }
        setMatches(data.response);
      } catch (err) {
        if (controller.signal.aborted) return;
        // Expected data-source failures belong in the page's error state,
        // not the development console overlay. Never display old-date matches.
        setMatches([]);
        setError(err instanceof Error ? err.message : "Could not load football matches. Please try again later.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadMatches();
    return () => controller.abort();
  }, [selectedDate, attempt]);

  return { matches, loading, error, retry: () => setAttempt((value) => value + 1) };
}
