"use client";

import dynamic from "next/dynamic";

export const SparkAreaChart = dynamic(
  () => import("./SparkAreaChart").then((m) => m.SparkAreaChart),
  { ssr: false, loading: () => <div style={{ height: 48 }} /> }
);
