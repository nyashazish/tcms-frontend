"use client";

import dynamic from "next/dynamic";

// Google Ads
export const GoogleAdsSpendTrendChart = dynamic(
  () => import("./GoogleAdsCharts").then((m) => m.SpendTrendChart),
  { ssr: false, loading: () => <div style={{ height: 300 }} /> }
);
export const GoogleAdsCampaignBreakdownChart = dynamic(
  () => import("./GoogleAdsCharts").then((m) => m.CampaignBreakdownChart),
  { ssr: false, loading: () => <div style={{ height: 300 }} /> }
);

// LSA
export const LSAVolumeTrendChart = dynamic(
  () => import("./LSACharts").then((m) => m.LSAVolumeTrendChart),
  { ssr: false, loading: () => <div style={{ height: 300 }} /> }
);
export const LSALeadTypeChart = dynamic(
  () => import("./LSACharts").then((m) => m.LeadTypeBreakdownChart),
  { ssr: false, loading: () => <div style={{ height: 300 }} /> }
);

// GBP
export const GBPImpressionsTrendChart = dynamic(
  () => import("./GBPCharts").then((m) => m.GBPImpressionsTrendChart),
  { ssr: false, loading: () => <div style={{ height: 300 }} /> }
);
export const GBPActionBreakdownChart = dynamic(
  () => import("./GBPCharts").then((m) => m.GBPActionBreakdownChart),
  { ssr: false, loading: () => <div style={{ height: 300 }} /> }
);

// Email
export const EmailRateTrendChart = dynamic(
  () => import("./EmailCharts").then((m) => m.EmailRateTrendChart),
  { ssr: false, loading: () => <div style={{ height: 300 }} /> }
);

// SEO
export const SEOTrendChart = dynamic(
  () => import("./SEOCharts").then((m) => m.SEOTrendChart),
  { ssr: false, loading: () => <div style={{ height: 300 }} /> }
);

// Reviews
export const ReviewRatingTrendChart = dynamic(
  () => import("./ReviewCharts").then((m) => m.ReviewRatingTrendChart),
  { ssr: false, loading: () => <div style={{ height: 300 }} /> }
);

// Lead Gen
export const LeadGenTrendChart = dynamic(
  () => import("./LeadGenCharts").then((m) => m.LeadTrendChart),
  { ssr: false, loading: () => <div style={{ height: 300 }} /> }
);
export const LeadGenSourceChart = dynamic(
  () => import("./LeadGenCharts").then((m) => m.LeadSourceChart),
  { ssr: false, loading: () => <div style={{ height: 300 }} /> }
);
