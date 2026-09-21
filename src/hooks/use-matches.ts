"use client";

import { useEffect, useState } from "react";
import type { Fixture, ApiResponse } from "@/types/football";

export function useMatches(selectedDate: string) {
  const [matches, setMatches] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/matches?date=${selectedDate}`
        );

        if (!response.ok) {
          throw new Error("Unable to load matches");
        }

        const data: ApiResponse = await response.json();

        setMatches(data.response || []);
      } catch (err) {
        console.error(err);
        setError("Could not load football matches.");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [selectedDate]);

  return { matches, loading, error };
}
