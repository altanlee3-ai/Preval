import { NextResponse } from "next/server";
import { WHO_INDICATORS } from "@/lib/trends";

export const revalidate = 86400;

/** Proxies the public WHO Global Health Observatory OData API (https://www.who.int/data/gho/info/gho-odata-api). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") ?? "";
  const country = (url.searchParams.get("country") ?? "").toUpperCase();
  if (!WHO_INDICATORS.some((i) => i.code === code) || !/^[A-Z]{3}$/.test(country)) {
    return NextResponse.json({ error: "Unknown indicator or country." }, { status: 400 });
  }
  try {
    const api = `https://ghoapi.azureedge.net/api/${code}?$filter=SpatialDim%20eq%20'${country}'`;
    const r = await fetch(api, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
    if (!r.ok) throw new Error(`WHO API responded ${r.status}`);
    const j = (await r.json()) as { value?: { TimeDim?: number; NumericValue?: number | null; Dim1?: string | null }[] };
    const byYear = new Map<number, number>();
    for (const v of j.value ?? []) {
      if (typeof v.TimeDim !== "number" || typeof v.NumericValue !== "number") continue;
      if (v.Dim1 && v.Dim1 !== "BTSX" && v.Dim1 !== "SEX_BTSX") continue; // keep "both sexes" or undisaggregated
      if (!byYear.has(v.TimeDim)) byYear.set(v.TimeDim, v.NumericValue);
    }
    const points = [...byYear.entries()].sort((a, b) => a[0] - b[0]).map(([year, value]) => ({ year, value }));
    if (!points.length) throw new Error("No data returned for this country.");
    return NextResponse.json({ code, country, source: "live", fetchedAt: new Date().toISOString(), points });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "WHO data unavailable." }, { status: 502 });
  }
}
