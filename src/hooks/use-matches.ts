"use client";

import { useEffect, useState } from "react";
import type { Fixture, ApiResponse } from "@/types/football";

export function useMatches(selectedDate: string) {
  const [matches, setMatches] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        if ((data.errors && Object.keys(data.errors).length > 0) || !Array.isArray(data.response)) {
          throw new Error("Football data unavailable");
        }
        setMatches(data.response);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setError("Could not load football matches.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadMatches();
    return () => controller.abort();
  }, [selectedDate]);

  return { matches, loading, error };
}
