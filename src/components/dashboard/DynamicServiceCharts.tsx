"use client";

import dynamic from "next/dynamic";

const opts = { ssr: false, loading: () => <div style={{ height: 300 }} /> };

// Google Ads
export const GoogleAdsSpendTrendChart = dynamic(
  () => import("./GoogleAdsCharts").then((m) => m.SpendTrendChart),
  opts
);
export const GoogleAdsCampaignBreakdownChart = dynamic(
  () => import("./GoogleAdsCharts").then((m) => m.CampaignBreakdownChart),
  opts
);

// LSA
export const LSAVolumeTrendChart = dynamic(
  () => import("./LSACharts").then((m) => m.LSAVolumeTrendChart),
  opts
);
export const LSALeadTypeBreakdownChart = dynamic(
  () => import("./LSACharts").then((m) => m.LeadTypeBreakdownChart),
  opts
);

// GBP
export const GBPImpressionsTrendChart = dynamic(
  () => import("./GBPCharts").then((m) => m.GBPImpressionsTrendChart),
  opts
);
export const GBPActionBreakdownChart = dynamic(
  () => import("./GBPCharts").then((m) => m.GBPActionBreakdownChart),
  opts
);

// Email
export const EmailRateTrendChart = dynamic(
  () => import("./EmailCharts").then((m) => m.EmailRateTrendChart),
  opts
);

// SEO
export const SEOTrendChart = dynamic(
  () => import("./SEOCharts").then((m) => m.SEOTrendChart),
  opts
);

// Reviews
export const ReviewRatingTrendChart = dynamic(
  () => import("./ReviewCharts").then((m) => m.ReviewRatingTrendChart),
  opts
);

// Lead Gen
export const LeadGenTrendChart = dynamic(
  () => import("./LeadGenCharts").then((m) => m.LeadTrendChart),
  opts
);
export const LeadGenSourceChart = dynamic(
  () => import("./LeadGenCharts").then((m) => m.LeadSourceChart),
  opts
);
