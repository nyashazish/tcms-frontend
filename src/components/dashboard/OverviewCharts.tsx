"use client";

import dynamic from "next/dynamic";

export const ServiceHealthBars = dynamic(
  () => import("./ServiceHealthBars").then((m) => m.ServiceHealthBars),
  { ssr: false, loading: () => <div style={{ height: 300 }} /> }
);
