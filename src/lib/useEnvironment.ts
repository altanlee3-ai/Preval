"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchEnvironment, PLACES, simulatedEnvironment, type EnvData, type Place } from "./environment";
import { useStore } from "./store";
import { storage } from "./utils";

const memo = new Map<string, EnvData>();

export function usePlace(): Place {
  const { settings } = useStore();
  if (settings.locationId.startsWith("geo:")) {
    const [, lat, lon] = settings.locationId.split(":");
    return { id: settings.locationId, name: { en: "My area (approx.)", th: "พื้นที่ของฉัน (โดยประมาณ)" }, lat: +lat, lon: +lon, country: "" };
  }
  return PLACES.find((p) => p.id === settings.locationId) ?? PLACES[0];
}

export function useEnvironment() {
  const place = usePlace();
  const [data, setData] = useState<EnvData | null>(() => memo.get(place.id) ?? null);
  const [loading, setLoading] = useState(!memo.get(place.id));

  const load = useCallback(
    async (force = false) => {
      const cached = memo.get(place.id) ?? storage.get<EnvData | null>(`pa.env.${place.id}`, null);
      if (!force && cached && cached.source === "live" && Date.now() - new Date(cached.fetchedAt).getTime() < 30 * 60_000) {
        memo.set(place.id, cached);
        setData(cached);
        setLoading(false);
        return;
      }
      setLoading(true);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 9000);
      try {
        const d = await fetchEnvironment(place.lat, place.lon, ctrl.signal);
        memo.set(place.id, d);
        storage.set(`pa.env.${place.id}`, d);
        setData(d);
      } catch (e) {
        const d = simulatedEnvironment(place, e instanceof Error ? e.message : "unavailable");
        memo.set(place.id, d);
        setData(d);
      } finally {
        clearTimeout(timer);
        setLoading(false);
      }
    },
    [place],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return { place, data, loading, reload: () => load(true) };
}
