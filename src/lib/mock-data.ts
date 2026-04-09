import type { Role } from "@/lib/auth/roles";
import type {
  Client,
  Alert,
  GoogleAdsMetrics,
  LSAMetrics,
  GBPMetrics,
  EmailMetrics,
  SEOMetrics,
  ReviewMetrics,
  LeadGenMetrics,
  AdminUser,
  SyncStatus,
  ServiceThreshold,
} from "@/lib/types";

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Generate an array of ISO date strings ending on 2026-04-09. */
function dates(count: number): string[] {
  const end = new Date("2026-04-09");
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() - (count - 1 - i));
    return d.toISOString().split("T")[0];
  });
}

const D14 = dates(14);
const DATE_RANGE_30 = "Mar 10 – Apr 9, 2026";

// ─── Clients ──────────────────────────────────────────────────────────────────

export const MOCK_CLIENTS: Client[] = [
  // ── 1. Bright Plumbing Co — all green ─────────────────────────────────────
  {
    id: "bright-plumbing",
    name: "Bright Plumbing Co",
    industry: "Home Services",
    activeServices: ["google-ads", "lsa", "gbp", "email", "seo", "reviews", "lead-gen"],
    overallHealth: "green",
    serviceHealth: {
      "google-ads": { status: "green", lastUpdated: "2026-04-09", summary: "ROAS above target", keyMetric: "ROAS 3.2×" },
      lsa: { status: "green", lastUpdated: "2026-04-09", summary: "CPL within target", keyMetric: "CPL $38" },
      gbp: { status: "green", lastUpdated: "2026-04-08", summary: "Impressions stable", keyMetric: "4,210 impr." },
      email: { status: "green", lastUpdated: "2026-04-09", summary: "Open rate healthy", keyMetric: "32.1% open" },
      seo: { status: "green", lastUpdated: "2026-04-07", summary: "Rankings improving", keyMetric: "1,840 clicks" },
      reviews: { status: "green", lastUpdated: "2026-04-09", summary: "High rating maintained", keyMetric: "4.8★ (142)" },
      "lead-gen": { status: "green", lastUpdated: "2026-04-09", summary: "Qualification rate on target", keyMetric: "68% qualified" },
    },
    assignedManagerId: "mgr-1",
  },

  // ── 2. Metro HVAC Solutions — red Google Ads, yellow GBP ──────────────────
  {
    id: "metro-hvac",
    name: "Metro HVAC Solutions",
    industry: "HVAC",
    activeServices: ["google-ads", "gbp", "email", "seo", "reviews"],
    overallHealth: "red",
    serviceHealth: {
      "google-ads": { status: "red", lastUpdated: "2026-04-09", summary: "ROAS below 1.5× threshold", keyMetric: "ROAS 1.1×" },
      gbp: { status: "yellow", lastUpdated: "2026-04-08", summary: "Impressions down 22% WoW", keyMetric: "3,100 impr." },
      email: { status: "green", lastUpdated: "2026-04-09", summary: "Campaigns performing well", keyMetric: "28.4% open" },
      seo: { status: "green", lastUpdated: "2026-04-07", summary: "Steady organic traffic", keyMetric: "980 clicks" },
      reviews: { status: "green", lastUpdated: "2026-04-09", summary: "Rating stable", keyMetric: "4.5★ (88)" },
    },
    assignedManagerId: "mgr-1",
  },

  // ── 3. Sunrise Dental Group — red SEO, yellow Reviews ─────────────────────
  {
    id: "sunrise-dental",
    name: "Sunrise Dental Group",
    industry: "Healthcare",
    activeServices: ["google-ads", "gbp", "email", "seo", "reviews"],
    overallHealth: "red",
    serviceHealth: {
      "google-ads": { status: "green", lastUpdated: "2026-04-09", summary: "Campaigns on target", keyMetric: "ROAS 2.8×" },
      gbp: { status: "green", lastUpdated: "2026-04-08", summary: "Listing active and healthy", keyMetric: "5,820 impr." },
      email: { status: "green", lastUpdated: "2026-04-09", summary: "Newsletters performing well", keyMetric: "34.7% open" },
      seo: { status: "red", lastUpdated: "2026-04-07", summary: "Clicks down 35% — ranking drop detected", keyMetric: "↓35% clicks" },
      reviews: { status: "yellow", lastUpdated: "2026-04-09", summary: "3 unanswered reviews — rating at risk", keyMetric: "4.1★ (211)" },
    },
    assignedManagerId: "mgr-2",
  },

  // ── 4. Peak Roofing LLC — red LSA, yellow GBP ─────────────────────────────
  {
    id: "peak-roofing",
    name: "Peak Roofing LLC",
    industry: "Home Improvement",
    activeServices: ["google-ads", "lsa", "gbp", "reviews"],
    overallHealth: "red",
    serviceHealth: {
      "google-ads": { status: "green", lastUpdated: "2026-04-09", summary: "Spend and conversions on track", keyMetric: "ROAS 2.1×" },
      lsa: { status: "red", lastUpdated: "2026-04-09", summary: "CPL spiked to $187 — threshold $100", keyMetric: "CPL $187" },
      gbp: { status: "yellow", lastUpdated: "2026-04-08", summary: "Direction requests down 28%", keyMetric: "↓28% dir." },
      reviews: { status: "green", lastUpdated: "2026-04-09", summary: "Rating healthy", keyMetric: "4.6★ (74)" },
    },
    assignedManagerId: "mgr-2",
  },

  // ── 5. City Electrical Services — yellow Google Ads ───────────────────────
  {
    id: "city-electrical",
    name: "City Electrical Services",
    industry: "Home Services",
    activeServices: ["google-ads", "lsa", "gbp", "email", "reviews"],
    overallHealth: "yellow",
    serviceHealth: {
      "google-ads": { status: "yellow", lastUpdated: "2026-04-09", summary: "CTR trending down — 2.8% vs 4.1% target", keyMetric: "CTR 2.8%" },
      lsa: { status: "green", lastUpdated: "2026-04-09", summary: "CPL within target", keyMetric: "CPL $52" },
      gbp: { status: "green", lastUpdated: "2026-04-08", summary: "Impressions and calls stable", keyMetric: "3,640 impr." },
      email: { status: "green", lastUpdated: "2026-04-09", summary: "Open rate steady", keyMetric: "26.3% open" },
      reviews: { status: "green", lastUpdated: "2026-04-09", summary: "All reviews answered", keyMetric: "4.7★ (56)" },
    },
    assignedManagerId: "mgr-1",
  },

  // ── 6. Lakeside Legal Group — yellow SEO, yellow Lead Gen ─────────────────
  {
    id: "lakeside-legal",
    name: "Lakeside Legal Group",
    industry: "Legal",
    activeServices: ["seo", "email", "reviews", "lead-gen"],
    overallHealth: "yellow",
    serviceHealth: {
      seo: { status: "yellow", lastUpdated: "2026-04-07", summary: "Impressions down 15% — monitor for further drops", keyMetric: "↓15% impr." },
      email: { status: "green", lastUpdated: "2026-04-09", summary: "Newsletter campaigns healthy", keyMetric: "29.8% open" },
      reviews: { status: "green", lastUpdated: "2026-04-09", summary: "Rating strong, all answered", keyMetric: "4.9★ (38)" },
      "lead-gen": { status: "yellow", lastUpdated: "2026-04-09", summary: "Qualification rate declining — 48% vs 60% target", keyMetric: "48% qualified" },
    },
    assignedManagerId: "mgr-2",
  },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const MOCK_ALERTS: Alert[] = [
  {
    id: "alert-001",
    clientId: "metro-hvac",
    clientName: "Metro HVAC Solutions",
    service: "google-ads",
    severity: "red",
    message: "ROAS dropped below 1.5× minimum threshold",
    triggerCondition: "ROAS < 1.5× for 3 consecutive days",
    thresholdBreached: "ROAS 1.1× (min: 1.5×)",
    timestamp: "2026-04-09T08:14:00Z",
    status: "open",
  },
  {
    id: "alert-002",
    clientId: "peak-roofing",
    clientName: "Peak Roofing LLC",
    service: "lsa",
    severity: "red",
    message: "Cost per lead spiked 87% above threshold",
    triggerCondition: "CPL > $100 for 2+ days",
    thresholdBreached: "CPL $187 (max: $100)",
    timestamp: "2026-04-09T07:02:00Z",
    status: "open",
  },
  {
    id: "alert-003",
    clientId: "sunrise-dental",
    clientName: "Sunrise Dental Group",
    service: "seo",
    severity: "red",
    message: "Organic clicks down 35% week-over-week",
    triggerCondition: "WoW click decline > 25%",
    thresholdBreached: "−35% WoW (max allowed: −25%)",
    timestamp: "2026-04-08T18:30:00Z",
    status: "open",
  },
  {
    id: "alert-004",
    clientId: "metro-hvac",
    clientName: "Metro HVAC Solutions",
    service: "gbp",
    severity: "yellow",
    message: "GBP impressions declining for 5 days",
    triggerCondition: "Impressions down >20% WoW",
    thresholdBreached: "−22% WoW (warn at −20%)",
    timestamp: "2026-04-09T09:00:00Z",
    status: "open",
  },
  {
    id: "alert-005",
    clientId: "sunrise-dental",
    clientName: "Sunrise Dental Group",
    service: "reviews",
    severity: "yellow",
    message: "3 unanswered Google reviews (>48 hours)",
    triggerCondition: "Unanswered reviews > 2 after 48h",
    thresholdBreached: "3 unanswered (max: 2)",
    timestamp: "2026-04-09T06:45:00Z",
    status: "open",
  },
  {
    id: "alert-006",
    clientId: "peak-roofing",
    clientName: "Peak Roofing LLC",
    service: "gbp",
    severity: "yellow",
    message: "Direction requests down 28% week-over-week",
    triggerCondition: "Direction requests down >20% WoW",
    thresholdBreached: "−28% WoW (warn at −20%)",
    timestamp: "2026-04-08T12:00:00Z",
    status: "open",
  },
  {
    id: "alert-007",
    clientId: "city-electrical",
    clientName: "City Electrical Services",
    service: "google-ads",
    severity: "yellow",
    message: "CTR trending below target for 4 days",
    triggerCondition: "CTR below 3% for 3+ consecutive days",
    thresholdBreached: "CTR 2.8% (target: ≥4%)",
    timestamp: "2026-04-08T10:20:00Z",
    status: "open",
  },
  {
    id: "alert-008",
    clientId: "lakeside-legal",
    clientName: "Lakeside Legal Group",
    service: "seo",
    severity: "yellow",
    message: "Organic impressions down 15% month-over-month",
    triggerCondition: "MoM impression decline >12%",
    thresholdBreached: "−15% MoM (warn at −12%)",
    timestamp: "2026-04-07T16:00:00Z",
    status: "open",
  },
  {
    id: "alert-009",
    clientId: "lakeside-legal",
    clientName: "Lakeside Legal Group",
    service: "lead-gen",
    severity: "yellow",
    message: "Lead qualification rate dropped below 50%",
    triggerCondition: "Qualification rate < 55% for 7 days",
    thresholdBreached: "48% qualified (target: ≥60%)",
    timestamp: "2026-04-07T09:30:00Z",
    status: "open",
  },
  // Resolved alerts (history)
  {
    id: "alert-010",
    clientId: "bright-plumbing",
    clientName: "Bright Plumbing Co",
    service: "email",
    severity: "yellow",
    message: "Open rate dipped below 25% for one campaign",
    triggerCondition: "Open rate < 25% on any campaign",
    thresholdBreached: "23.4% open rate (min: 25%)",
    timestamp: "2026-04-05T14:10:00Z",
    status: "resolved",
    resolvedAt: "2026-04-06T09:00:00Z",
  },
  {
    id: "alert-011",
    clientId: "metro-hvac",
    clientName: "Metro HVAC Solutions",
    service: "google-ads",
    severity: "red",
    message: "Daily budget exhausted by 2 PM — missing afternoon traffic",
    triggerCondition: "Budget depleted before 4 PM",
    thresholdBreached: "Budget exhausted at 13:48",
    timestamp: "2026-04-03T14:00:00Z",
    status: "resolved",
    resolvedAt: "2026-04-04T08:00:00Z",
  },
  {
    id: "alert-012",
    clientId: "peak-roofing",
    clientName: "Peak Roofing LLC",
    service: "lsa",
    severity: "red",
    message: "LSA account paused due to license verification",
    triggerCondition: "Account status = paused",
    thresholdBreached: "Account paused",
    timestamp: "2026-03-28T11:00:00Z",
    status: "resolved",
    resolvedAt: "2026-03-30T15:00:00Z",
  },
];

// ─── Google Ads metrics ───────────────────────────────────────────────────────

const GOOGLE_ADS: Record<string, GoogleAdsMetrics> = {
  "bright-plumbing": {
    clientId: "bright-plumbing",
    dateRange: DATE_RANGE_30,
    impressions: 42800,
    clicks: 1926,
    ctr: 4.5,
    cpc: 3.42,
    conversions: 124,
    roas: 3.2,
    spend: 6588,
    budget: 7000,
    wowChange: 4.2,
    campaigns: [
      { id: "c1", name: "Emergency Plumbing — Search", status: "active", impressions: 18400, clicks: 920, ctr: 5.0, cpc: 3.10, conversions: 62, spend: 2852, health: "green" },
      { id: "c2", name: "Water Heater Install — Search", status: "active", impressions: 14200, clicks: 640, ctr: 4.5, cpc: 3.60, conversions: 38, spend: 2304, health: "green" },
      { id: "c3", name: "Drain Cleaning — Search", status: "active", impressions: 10200, clicks: 366, ctr: 3.6, cpc: 3.92, conversions: 24, spend: 1434, health: "green" },
    ],
    trend: D14.map((date, i) => ({
      date,
      spend: [198, 210, 224, 218, 235, 241, 228, 215, 238, 244, 232, 219, 228, 241][i],
      clicks: [58, 62, 68, 65, 72, 74, 70, 64, 73, 76, 71, 66, 70, 74][i],
      conversions: [4, 4, 5, 4, 5, 5, 4, 4, 5, 5, 5, 4, 4, 5][i],
    })),
  },

  "metro-hvac": {
    clientId: "metro-hvac",
    dateRange: DATE_RANGE_30,
    impressions: 38400,
    clicks: 806,
    ctr: 2.1,
    cpc: 7.82,
    conversions: 24,
    roas: 1.1,
    spend: 6302,
    budget: 6000,
    wowChange: -18.4,
    campaigns: [
      { id: "c1", name: "AC Repair — Search", status: "active", impressions: 22100, clicks: 486, ctr: 2.2, cpc: 8.10, conversions: 14, spend: 3937, health: "red" },
      { id: "c2", name: "Furnace Install — Search", status: "active", impressions: 10800, clicks: 216, ctr: 2.0, cpc: 7.40, conversions: 7, spend: 1598, health: "yellow" },
      { id: "c3", name: "HVAC Maintenance — Display", status: "paused", impressions: 5500, clicks: 104, ctr: 1.9, cpc: 7.37, conversions: 3, spend: 767, health: "yellow" },
    ],
    trend: D14.map((date, i) => ({
      date,
      spend: [420, 415, 438, 422, 398, 410, 395, 368, 342, 328, 315, 308, 290, 271][i],
      clicks: [54, 52, 55, 50, 48, 49, 46, 42, 40, 38, 36, 34, 32, 29][i],
      conversions: [3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1][i],
    })),
  },

  "sunrise-dental": {
    clientId: "sunrise-dental",
    dateRange: DATE_RANGE_30,
    impressions: 29600,
    clicks: 1184,
    ctr: 4.0,
    cpc: 5.14,
    conversions: 86,
    roas: 2.8,
    spend: 6086,
    budget: 6500,
    wowChange: 2.1,
    campaigns: [
      { id: "c1", name: "Dental Implants — Search", status: "active", impressions: 12400, clicks: 558, ctr: 4.5, cpc: 5.40, conversions: 42, spend: 3013, health: "green" },
      { id: "c2", name: "Teeth Whitening — Search", status: "active", impressions: 9800, clicks: 392, ctr: 4.0, cpc: 4.80, conversions: 28, spend: 1882, health: "green" },
      { id: "c3", name: "Emergency Dental — Search", status: "active", impressions: 7400, clicks: 234, ctr: 3.2, cpc: 5.09, conversions: 16, spend: 1191, health: "green" },
    ],
    trend: D14.map((date, i) => ({
      date,
      spend: [198, 202, 196, 210, 204, 198, 202, 196, 200, 204, 198, 202, 196, 200][i],
      clicks: [38, 40, 37, 42, 40, 38, 40, 38, 39, 40, 38, 40, 38, 40][i],
      conversions: [3, 3, 2, 3, 3, 2, 3, 3, 3, 3, 3, 3, 2, 3][i],
    })),
  },

  "peak-roofing": {
    clientId: "peak-roofing",
    dateRange: DATE_RANGE_30,
    impressions: 24200,
    clicks: 968,
    ctr: 4.0,
    cpc: 4.64,
    conversions: 58,
    roas: 2.1,
    spend: 4492,
    budget: 5000,
    wowChange: 1.8,
    campaigns: [
      { id: "c1", name: "Roof Replacement — Search", status: "active", impressions: 14600, clicks: 628, ctr: 4.3, cpc: 4.50, conversions: 38, spend: 2826, health: "green" },
      { id: "c2", name: "Storm Damage Repair — Search", status: "active", impressions: 9600, clicks: 340, ctr: 3.5, cpc: 4.90, conversions: 20, spend: 1666, health: "green" },
    ],
    trend: D14.map((date, i) => ({
      date,
      spend: [148, 152, 144, 158, 162, 148, 155, 160, 152, 148, 156, 162, 155, 148][i],
      clicks: [32, 33, 30, 34, 35, 32, 33, 34, 32, 31, 33, 34, 33, 31][i],
      conversions: [2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2][i],
    })),
  },

  "city-electrical": {
    clientId: "city-electrical",
    dateRange: DATE_RANGE_30,
    impressions: 31800,
    clicks: 890,
    ctr: 2.8,
    cpc: 5.06,
    conversions: 52,
    roas: 2.3,
    spend: 4503,
    budget: 5000,
    wowChange: -8.2,
    campaigns: [
      { id: "c1", name: "Electrical Panel Upgrade — Search", status: "active", impressions: 14200, clicks: 412, ctr: 2.9, cpc: 5.20, conversions: 24, spend: 2142, health: "yellow" },
      { id: "c2", name: "EV Charger Install — Search", status: "active", impressions: 10800, clicks: 302, ctr: 2.8, cpc: 4.90, conversions: 18, spend: 1480, health: "yellow" },
      { id: "c3", name: "Emergency Electrical — Search", status: "active", impressions: 6800, clicks: 176, ctr: 2.6, cpc: 4.94, conversions: 10, spend: 870, health: "green" },
    ],
    trend: D14.map((date, i) => ({
      date,
      spend: [165, 162, 168, 158, 162, 154, 158, 150, 154, 148, 152, 146, 148, 142][i],
      clicks: [36, 35, 37, 34, 35, 33, 34, 32, 33, 31, 32, 30, 31, 29][i],
      conversions: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2][i],
    })),
  },
};

// ─── LSA metrics ─────────────────────────────────────────────────────────────

const LSA: Record<string, LSAMetrics> = {
  "bright-plumbing": {
    clientId: "bright-plumbing",
    dateRange: DATE_RANGE_30,
    leadVolume: 84,
    costPerLead: 38,
    leadTypes: [
      { type: "Phone call", count: 62 },
      { type: "Message", count: 18 },
      { type: "Booking", count: 4 },
    ],
    disputedLeads: 3,
    chargedLeads: 81,
    wowChange: 6.3,
    momChange: 12.0,
    trend: D14.map((date, i) => ({
      date,
      leads: [5, 6, 5, 7, 6, 5, 6, 7, 6, 5, 7, 6, 6, 7][i],
      costPerLead: [40, 38, 39, 37, 38, 39, 37, 36, 38, 39, 37, 38, 37, 36][i],
    })),
  },

  "peak-roofing": {
    clientId: "peak-roofing",
    dateRange: DATE_RANGE_30,
    leadVolume: 18,
    costPerLead: 187,
    leadTypes: [
      { type: "Phone call", count: 14 },
      { type: "Message", count: 4 },
    ],
    disputedLeads: 5,
    chargedLeads: 13,
    wowChange: -24.0,
    momChange: -18.0,
    trend: D14.map((date, i) => ({
      date,
      leads: [2, 2, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 0, 1][i],
      costPerLead: [98, 102, 110, 128, 142, 155, 168, 172, 180, 184, 186, 188, 190, 187][i],
    })),
  },

  "city-electrical": {
    clientId: "city-electrical",
    dateRange: DATE_RANGE_30,
    leadVolume: 46,
    costPerLead: 52,
    leadTypes: [
      { type: "Phone call", count: 38 },
      { type: "Message", count: 8 },
    ],
    disputedLeads: 2,
    chargedLeads: 44,
    wowChange: 2.1,
    momChange: 5.4,
    trend: D14.map((date, i) => ({
      date,
      leads: [3, 3, 4, 3, 3, 4, 3, 3, 4, 3, 3, 3, 4, 3][i],
      costPerLead: [54, 52, 51, 53, 52, 50, 52, 53, 51, 52, 53, 52, 51, 52][i],
    })),
  },
};

// ─── GBP metrics ─────────────────────────────────────────────────────────────

const GBP: Record<string, GBPMetrics> = {
  "bright-plumbing": {
    clientId: "bright-plumbing",
    dateRange: DATE_RANGE_30,
    impressions: 42100,
    callClicks: 284,
    directionRequests: 148,
    websiteClicks: 312,
    reviewCount: 142,
    reviewAverage: 4.8,
    postCount: 8,
    listingStatus: "active",
    wowChange: 3.1,
    trend: D14.map((date, i) => ({
      date,
      impressions: [2800, 2920, 3040, 3100, 2980, 3060, 3200, 3100, 3040, 3120, 3060, 2980, 3040, 3100][i],
      callClicks: [18, 19, 20, 21, 20, 20, 22, 21, 20, 21, 20, 19, 20, 22][i],
    })),
  },

  "metro-hvac": {
    clientId: "metro-hvac",
    dateRange: DATE_RANGE_30,
    impressions: 31000,
    callClicks: 168,
    directionRequests: 82,
    websiteClicks: 196,
    reviewCount: 88,
    reviewAverage: 4.5,
    postCount: 4,
    listingStatus: "active",
    wowChange: -22.0,
    trend: D14.map((date, i) => ({
      date,
      impressions: [3200, 3100, 2980, 2860, 2740, 2640, 2520, 2400, 2310, 2240, 2180, 2140, 2100, 2050][i],
      callClicks: [22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 13, 12, 12, 11][i],
    })),
  },

  "sunrise-dental": {
    clientId: "sunrise-dental",
    dateRange: DATE_RANGE_30,
    impressions: 58200,
    callClicks: 312,
    directionRequests: 244,
    websiteClicks: 486,
    reviewCount: 211,
    reviewAverage: 4.1,
    postCount: 12,
    listingStatus: "active",
    wowChange: 1.8,
    trend: D14.map((date, i) => ({
      date,
      impressions: [3800, 3920, 4060, 4100, 4020, 4080, 4140, 4060, 3980, 4020, 4080, 4100, 4020, 4060][i],
      callClicks: [20, 21, 22, 23, 22, 22, 23, 22, 21, 22, 22, 23, 22, 22][i],
    })),
  },

  "peak-roofing": {
    clientId: "peak-roofing",
    dateRange: DATE_RANGE_30,
    impressions: 24400,
    callClicks: 112,
    directionRequests: 58,
    websiteClicks: 148,
    reviewCount: 74,
    reviewAverage: 4.6,
    postCount: 3,
    listingStatus: "active",
    wowChange: -28.0,
    trend: D14.map((date, i) => ({
      date,
      impressions: [2400, 2320, 2240, 2160, 2080, 2000, 1920, 1840, 1780, 1720, 1680, 1640, 1600, 1560][i],
      callClicks: [14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 8, 8, 7, 7][i],
    })),
  },

  "city-electrical": {
    clientId: "city-electrical",
    dateRange: DATE_RANGE_30,
    impressions: 36400,
    callClicks: 198,
    directionRequests: 96,
    websiteClicks: 228,
    reviewCount: 56,
    reviewAverage: 4.7,
    postCount: 6,
    listingStatus: "active",
    wowChange: 1.4,
    trend: D14.map((date, i) => ({
      date,
      impressions: [2400, 2480, 2560, 2620, 2580, 2640, 2700, 2640, 2580, 2620, 2660, 2640, 2580, 2620][i],
      callClicks: [13, 13, 14, 14, 14, 14, 15, 14, 14, 14, 15, 14, 14, 14][i],
    })),
  },
};

// ─── Email metrics ────────────────────────────────────────────────────────────

const EMAIL: Record<string, EmailMetrics> = {
  "bright-plumbing": {
    clientId: "bright-plumbing",
    dateRange: DATE_RANGE_30,
    sends: 2840,
    openRate: 32.1,
    clickRate: 4.8,
    bounces: 28,
    unsubscribes: 6,
    wowChange: 1.4,
    campaigns: [
      { id: "e1", name: "April Newsletter — Plumbing Tips", sentDate: "2026-04-07", sends: 1420, openRate: 34.2, clickRate: 5.1, bounces: 14, unsubscribes: 3 },
      { id: "e2", name: "Spring Promo — 15% Off Drain Cleaning", sentDate: "2026-03-24", sends: 1420, openRate: 30.0, clickRate: 4.5, bounces: 14, unsubscribes: 3 },
    ],
    trend: D14.map((date, i) => ({
      date,
      openRate: [30.2, 31.0, 31.8, 32.4, 31.6, 32.0, 32.8, 32.2, 31.8, 32.2, 32.6, 32.0, 31.8, 32.4][i],
      clickRate: [4.4, 4.6, 4.8, 4.9, 4.7, 4.8, 5.0, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.9][i],
    })),
  },

  "metro-hvac": {
    clientId: "metro-hvac",
    dateRange: DATE_RANGE_30,
    sends: 1960,
    openRate: 28.4,
    clickRate: 3.6,
    bounces: 22,
    unsubscribes: 8,
    wowChange: 0.8,
    campaigns: [
      { id: "e1", name: "Spring AC Tune-Up Offer", sentDate: "2026-04-02", sends: 980, openRate: 29.0, clickRate: 3.8, bounces: 11, unsubscribes: 4 },
      { id: "e2", name: "March Newsletter — HVAC Maintenance", sentDate: "2026-03-17", sends: 980, openRate: 27.8, clickRate: 3.4, bounces: 11, unsubscribes: 4 },
    ],
    trend: D14.map((date, i) => ({
      date,
      openRate: [27.4, 27.8, 28.0, 28.6, 28.2, 28.4, 28.8, 28.4, 28.2, 28.4, 28.6, 28.2, 28.4, 28.6][i],
      clickRate: [3.4, 3.5, 3.6, 3.7, 3.6, 3.6, 3.7, 3.6, 3.5, 3.6, 3.7, 3.6, 3.5, 3.7][i],
    })),
  },

  "sunrise-dental": {
    clientId: "sunrise-dental",
    dateRange: DATE_RANGE_30,
    sends: 3480,
    openRate: 34.7,
    clickRate: 5.2,
    bounces: 30,
    unsubscribes: 10,
    wowChange: 2.1,
    campaigns: [
      { id: "e1", name: "April Patient Newsletter", sentDate: "2026-04-08", sends: 1740, openRate: 35.8, clickRate: 5.4, bounces: 15, unsubscribes: 5 },
      { id: "e2", name: "Spring Whitening Promotion", sentDate: "2026-03-20", sends: 1740, openRate: 33.6, clickRate: 5.0, bounces: 15, unsubscribes: 5 },
    ],
    trend: D14.map((date, i) => ({
      date,
      openRate: [33.0, 33.4, 33.8, 34.2, 34.0, 34.4, 34.8, 34.4, 34.2, 34.6, 35.0, 34.6, 34.4, 34.8][i],
      clickRate: [4.8, 4.9, 5.0, 5.1, 5.0, 5.1, 5.2, 5.1, 5.0, 5.1, 5.3, 5.1, 5.1, 5.3][i],
    })),
  },

  "city-electrical": {
    clientId: "city-electrical",
    dateRange: DATE_RANGE_30,
    sends: 1640,
    openRate: 26.3,
    clickRate: 3.2,
    bounces: 18,
    unsubscribes: 5,
    wowChange: -0.4,
    campaigns: [
      { id: "e1", name: "EV Charger Installation Promo", sentDate: "2026-04-01", sends: 820, openRate: 26.6, clickRate: 3.4, bounces: 9, unsubscribes: 2 },
      { id: "e2", name: "March Newsletter — Electrical Safety", sentDate: "2026-03-15", sends: 820, openRate: 26.0, clickRate: 3.0, bounces: 9, unsubscribes: 3 },
    ],
    trend: D14.map((date, i) => ({
      date,
      openRate: [26.8, 26.6, 26.8, 26.4, 26.6, 26.4, 26.6, 26.4, 26.2, 26.4, 26.2, 26.4, 26.2, 26.4][i],
      clickRate: [3.4, 3.3, 3.4, 3.3, 3.3, 3.2, 3.3, 3.2, 3.2, 3.2, 3.2, 3.2, 3.1, 3.2][i],
    })),
  },

  "lakeside-legal": {
    clientId: "lakeside-legal",
    dateRange: DATE_RANGE_30,
    sends: 920,
    openRate: 29.8,
    clickRate: 4.1,
    bounces: 8,
    unsubscribes: 2,
    wowChange: 0.6,
    campaigns: [
      { id: "e1", name: "April Legal Insights Newsletter", sentDate: "2026-04-07", sends: 460, openRate: 30.4, clickRate: 4.2, bounces: 4, unsubscribes: 1 },
      { id: "e2", name: "Free Consultation Campaign", sentDate: "2026-03-18", sends: 460, openRate: 29.2, clickRate: 4.0, bounces: 4, unsubscribes: 1 },
    ],
    trend: D14.map((date, i) => ({
      date,
      openRate: [29.0, 29.2, 29.4, 29.8, 29.6, 29.8, 30.0, 29.8, 29.6, 29.8, 30.0, 29.8, 29.8, 30.0][i],
      clickRate: [3.9, 4.0, 4.0, 4.1, 4.0, 4.1, 4.2, 4.1, 4.0, 4.1, 4.2, 4.1, 4.1, 4.2][i],
    })),
  },
};

// ─── SEO metrics ──────────────────────────────────────────────────────────────

const SEO: Record<string, SEOMetrics> = {
  "bright-plumbing": {
    clientId: "bright-plumbing",
    dateRange: "Mar 10 – Apr 6, 2026", // 2-3 day GSC lag
    clicks: 1840,
    impressions: 28600,
    ctr: 6.4,
    avgPosition: 8.2,
    wowChange: 4.8,
    topQueries: [
      { query: "emergency plumber near me", clicks: 412, impressions: 4200, ctr: 9.8, position: 4.2, positionChange: 0.8 },
      { query: "water heater repair", clicks: 284, impressions: 3800, ctr: 7.5, position: 6.1, positionChange: 1.2 },
      { query: "drain cleaning service", clicks: 196, impressions: 3200, ctr: 6.1, position: 7.4, positionChange: -0.3 },
      { query: "plumber [city]", clicks: 168, impressions: 2600, ctr: 6.5, position: 5.8, positionChange: 2.1 },
      { query: "toilet repair cost", clicks: 142, impressions: 2200, ctr: 6.5, position: 9.2, positionChange: 0.4 },
    ],
    topPages: [
      { page: "/emergency-plumbing", clicks: 520, impressions: 6400, ctr: 8.1, position: 5.2 },
      { page: "/water-heater-repair", clicks: 380, impressions: 5200, ctr: 7.3, position: 6.8 },
      { page: "/drain-cleaning", clicks: 296, impressions: 4800, ctr: 6.2, position: 8.1 },
      { page: "/plumbing-services", clicks: 248, impressions: 4200, ctr: 5.9, position: 9.4 },
    ],
    trend: D14.map((date, i) => ({
      date,
      clicks: [118, 124, 128, 134, 130, 136, 142, 136, 132, 136, 138, 134, 132, 136][i],
      impressions: [1840, 1920, 1980, 2060, 2020, 2080, 2160, 2080, 2020, 2060, 2100, 2060, 2020, 2060][i],
    })),
  },

  "metro-hvac": {
    clientId: "metro-hvac",
    dateRange: "Mar 10 – Apr 6, 2026",
    clicks: 980,
    impressions: 18400,
    ctr: 5.3,
    avgPosition: 9.8,
    wowChange: 2.2,
    topQueries: [
      { query: "ac repair near me", clicks: 248, impressions: 3800, ctr: 6.5, position: 6.4, positionChange: 0.6 },
      { query: "hvac service [city]", clicks: 186, impressions: 2900, ctr: 6.4, position: 7.8, positionChange: 1.1 },
      { query: "furnace installation cost", clicks: 142, impressions: 2400, ctr: 5.9, position: 10.2, positionChange: -1.4 },
      { query: "central air conditioning repair", clicks: 118, impressions: 2100, ctr: 5.6, position: 11.4, positionChange: 0.2 },
    ],
    topPages: [
      { page: "/ac-repair", clicks: 320, impressions: 5200, ctr: 6.2, position: 7.2 },
      { page: "/hvac-services", clicks: 248, impressions: 4200, ctr: 5.9, position: 8.8 },
      { page: "/furnace-installation", clicks: 196, impressions: 3600, ctr: 5.4, position: 10.6 },
    ],
    trend: D14.map((date, i) => ({
      date,
      clicks: [62, 64, 68, 72, 70, 72, 74, 72, 70, 72, 74, 72, 70, 72][i],
      impressions: [1200, 1240, 1300, 1360, 1320, 1360, 1400, 1360, 1320, 1360, 1400, 1360, 1320, 1360][i],
    })),
  },

  "sunrise-dental": {
    clientId: "sunrise-dental",
    dateRange: "Mar 10 – Apr 6, 2026",
    clicks: 980,
    impressions: 22400,
    ctr: 4.4,
    avgPosition: 14.1,
    wowChange: -35.0,
    topQueries: [
      { query: "dental implants cost", clicks: 186, impressions: 4800, ctr: 3.9, position: 12.4, positionChange: -4.2 },
      { query: "teeth whitening near me", clicks: 148, impressions: 3600, ctr: 4.1, position: 11.8, positionChange: -3.8 },
      { query: "emergency dentist [city]", clicks: 128, impressions: 2800, ctr: 4.6, position: 16.2, positionChange: -6.1 },
      { query: "invisalign provider near me", clicks: 112, impressions: 2400, ctr: 4.7, position: 18.4, positionChange: -5.6 },
    ],
    topPages: [
      { page: "/dental-implants", clicks: 260, impressions: 6400, ctr: 4.1, position: 13.2 },
      { page: "/teeth-whitening", clicks: 200, impressions: 5200, ctr: 3.8, position: 12.8 },
      { page: "/emergency-dentist", clicks: 168, impressions: 4000, ctr: 4.2, position: 15.4 },
    ],
    trend: D14.map((date, i) => ({
      date,
      clicks: [228, 220, 212, 204, 196, 188, 180, 162, 148, 134, 122, 112, 104, 96][i],
      impressions: [3600, 3520, 3440, 3360, 3240, 3120, 3000, 2800, 2640, 2480, 2360, 2240, 2160, 2080][i],
    })),
  },

  "lakeside-legal": {
    clientId: "lakeside-legal",
    dateRange: "Mar 10 – Apr 6, 2026",
    clicks: 640,
    impressions: 14200,
    ctr: 4.5,
    avgPosition: 11.6,
    wowChange: -6.8,
    topQueries: [
      { query: "personal injury lawyer [city]", clicks: 148, impressions: 2800, ctr: 5.3, position: 8.4, positionChange: -0.8 },
      { query: "car accident attorney near me", clicks: 124, impressions: 2400, ctr: 5.2, position: 9.2, positionChange: -1.2 },
      { query: "workers compensation lawyer", clicks: 96, impressions: 2000, ctr: 4.8, position: 12.4, positionChange: 0.4 },
      { query: "free legal consultation", clicks: 84, impressions: 1800, ctr: 4.7, position: 14.2, positionChange: -2.1 },
    ],
    topPages: [
      { page: "/personal-injury", clicks: 200, impressions: 4200, ctr: 4.8, position: 9.6 },
      { page: "/car-accident", clicks: 168, impressions: 3600, ctr: 4.7, position: 10.8 },
      { page: "/workers-comp", clicks: 128, impressions: 2800, ctr: 4.6, position: 13.2 },
    ],
    trend: D14.map((date, i) => ({
      date,
      clicks: [54, 52, 50, 48, 50, 48, 46, 48, 46, 44, 46, 44, 44, 44][i],
      impressions: [1120, 1080, 1040, 1000, 1040, 1000, 960, 1000, 960, 920, 960, 920, 920, 920][i],
    })),
  },
};

// ─── Reviews metrics ──────────────────────────────────────────────────────────

const REVIEWS: Record<string, ReviewMetrics> = {
  "bright-plumbing": {
    clientId: "bright-plumbing",
    dateRange: DATE_RANGE_30,
    totalReviews: 142,
    averageRating: 4.8,
    newReviews: 12,
    unansweredReviews: 0,
    ratingDistribution: { "5": 108, "4": 26, "3": 6, "2": 1, "1": 1 },
    trend: D14.map((date, i) => ({
      date,
      avgRating: [4.8, 4.8, 4.8, 4.9, 4.8, 4.8, 4.8, 4.8, 4.8, 4.8, 4.9, 4.8, 4.8, 4.8][i],
      newReviews: [0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1][i],
    })),
    recentReviews: [
      { id: "r1", rating: 5, author: "Sarah M.", date: "2026-04-08", text: "Fixed our burst pipe at 11 PM. Incredibly fast and professional.", answered: true, source: "google" },
      { id: "r2", rating: 5, author: "Tom K.", date: "2026-04-06", text: "Replaced our water heater same day. Fair pricing and clean work.", answered: true, source: "google" },
      { id: "r3", rating: 4, author: "Linda R.", date: "2026-04-04", text: "Good service, technician was very knowledgeable.", answered: true, source: "google" },
    ],
  },

  "metro-hvac": {
    clientId: "metro-hvac",
    dateRange: DATE_RANGE_30,
    totalReviews: 88,
    averageRating: 4.5,
    newReviews: 6,
    unansweredReviews: 1,
    ratingDistribution: { "5": 62, "4": 18, "3": 5, "2": 2, "1": 1 },
    trend: D14.map((date, i) => ({
      date,
      avgRating: [4.5, 4.5, 4.5, 4.6, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5][i],
      newReviews: [0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0][i],
    })),
    recentReviews: [
      { id: "r1", rating: 4, author: "James P.", date: "2026-04-07", text: "Technician arrived on time and fixed our AC. Would recommend.", answered: true, source: "google" },
      { id: "r2", rating: 5, author: "Carol A.", date: "2026-04-04", text: "Installed new furnace, very efficient and clean.", answered: false, source: "google" },
      { id: "r3", rating: 3, author: "Mike D.", date: "2026-04-01", text: "Service was okay but took longer than estimated.", answered: true, source: "google" },
    ],
  },

  "sunrise-dental": {
    clientId: "sunrise-dental",
    dateRange: DATE_RANGE_30,
    totalReviews: 211,
    averageRating: 4.1,
    newReviews: 18,
    unansweredReviews: 3,
    ratingDistribution: { "5": 128, "4": 48, "3": 22, "2": 8, "1": 5 },
    trend: D14.map((date, i) => ({
      date,
      avgRating: [4.4, 4.4, 4.3, 4.3, 4.2, 4.2, 4.2, 4.2, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1][i],
      newReviews: [1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1][i],
    })),
    recentReviews: [
      { id: "r1", rating: 2, author: "David L.", date: "2026-04-08", text: "Waited 40 minutes past my appointment time. Staff seemed overwhelmed.", answered: false, source: "google" },
      { id: "r2", rating: 3, author: "Emma S.", date: "2026-04-07", text: "Dentist was great but billing issues took weeks to resolve.", answered: false, source: "google" },
      { id: "r3", rating: 5, author: "John H.", date: "2026-04-06", text: "Excellent dental work on my implants. Very happy with results.", answered: true, source: "google" },
      { id: "r4", rating: 2, author: "Rachel T.", date: "2026-04-05", text: "Hard to get appointments. Phone line rarely answered.", answered: false, source: "google" },
    ],
  },

  "peak-roofing": {
    clientId: "peak-roofing",
    dateRange: DATE_RANGE_30,
    totalReviews: 74,
    averageRating: 4.6,
    newReviews: 5,
    unansweredReviews: 0,
    ratingDistribution: { "5": 54, "4": 14, "3": 4, "2": 1, "1": 1 },
    trend: D14.map((date, i) => ({
      date,
      avgRating: [4.6, 4.6, 4.6, 4.7, 4.6, 4.6, 4.6, 4.6, 4.6, 4.6, 4.6, 4.6, 4.6, 4.6][i],
      newReviews: [0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1][i],
    })),
    recentReviews: [
      { id: "r1", rating: 5, author: "Greg W.", date: "2026-04-08", text: "Complete roof replacement done in two days. Excellent workmanship.", answered: true, source: "google" },
      { id: "r2", rating: 5, author: "Nancy B.", date: "2026-04-03", text: "Storm damage repaired quickly. Insurance claim handled with no issues.", answered: true, source: "google" },
    ],
  },

  "city-electrical": {
    clientId: "city-electrical",
    dateRange: DATE_RANGE_30,
    totalReviews: 56,
    averageRating: 4.7,
    newReviews: 4,
    unansweredReviews: 0,
    ratingDistribution: { "5": 40, "4": 12, "3": 3, "2": 1, "1": 0 },
    trend: D14.map((date, i) => ({
      date,
      avgRating: [4.7, 4.7, 4.7, 4.7, 4.7, 4.8, 4.7, 4.7, 4.7, 4.7, 4.7, 4.7, 4.7, 4.7][i],
      newReviews: [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1][i],
    })),
    recentReviews: [
      { id: "r1", rating: 5, author: "Patricia K.", date: "2026-04-07", text: "EV charger installed perfectly. Very professional team.", answered: true, source: "google" },
      { id: "r2", rating: 4, author: "Brian M.", date: "2026-04-04", text: "Panel upgrade done well. Slightly over quoted time but quality work.", answered: true, source: "google" },
    ],
  },

  "lakeside-legal": {
    clientId: "lakeside-legal",
    dateRange: DATE_RANGE_30,
    totalReviews: 38,
    averageRating: 4.9,
    newReviews: 3,
    unansweredReviews: 0,
    ratingDistribution: { "5": 34, "4": 3, "3": 1, "2": 0, "1": 0 },
    trend: D14.map((date, i) => ({
      date,
      avgRating: [4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9][i],
      newReviews: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0][i],
    })),
    recentReviews: [
      { id: "r1", rating: 5, author: "Karen J.", date: "2026-04-06", text: "Won my personal injury case. Highly professional and responsive.", answered: true, source: "google" },
      { id: "r2", rating: 5, author: "Steve O.", date: "2026-04-01", text: "Thorough and knowledgeable. Made a stressful situation much easier.", answered: true, source: "google" },
    ],
  },
};

// ─── Lead Gen metrics ─────────────────────────────────────────────────────────

const LEAD_GEN: Record<string, LeadGenMetrics> = {
  "bright-plumbing": {
    clientId: "bright-plumbing",
    dateRange: DATE_RANGE_30,
    totalLeads: 128,
    qualifiedLeads: 87,
    conversionRate: 68.0,
    wowChange: 5.2,
    sources: [
      { source: "Google Ads", count: 52, qualified: 40, conversionRate: 76.9 },
      { source: "LSA", count: 38, qualified: 28, conversionRate: 73.7 },
      { source: "Organic SEO", count: 24, qualified: 14, conversionRate: 58.3 },
      { source: "GBP", count: 14, qualified: 5, conversionRate: 35.7 },
    ],
    conversionStages: [
      { stage: "New inquiry", count: 128 },
      { stage: "Initial contact made", count: 112 },
      { stage: "Qualified", count: 87 },
      { stage: "Proposal sent", count: 64 },
      { stage: "Won", count: 48 },
    ],
    trend: D14.map((date, i) => ({
      date,
      leads: [8, 8, 9, 10, 9, 9, 10, 9, 9, 10, 9, 9, 10, 9][i],
      qualified: [5, 6, 6, 7, 6, 6, 7, 6, 6, 7, 6, 6, 7, 6][i],
    })),
  },

  "lakeside-legal": {
    clientId: "lakeside-legal",
    dateRange: DATE_RANGE_30,
    totalLeads: 62,
    qualifiedLeads: 30,
    conversionRate: 48.4,
    wowChange: -8.8,
    sources: [
      { source: "Organic SEO", count: 28, qualified: 16, conversionRate: 57.1 },
      { source: "Email Campaign", count: 18, qualified: 8, conversionRate: 44.4 },
      { source: "Referral", count: 10, qualified: 5, conversionRate: 50.0 },
      { source: "Direct", count: 6, qualified: 1, conversionRate: 16.7 },
    ],
    conversionStages: [
      { stage: "New inquiry", count: 62 },
      { stage: "Initial consultation", count: 48 },
      { stage: "Qualified", count: 30 },
      { stage: "Retainer proposed", count: 18 },
      { stage: "Retained", count: 12 },
    ],
    trend: D14.map((date, i) => ({
      date,
      leads: [6, 5, 6, 5, 5, 5, 4, 5, 4, 4, 4, 4, 4, 3][i],
      qualified: [4, 3, 4, 3, 3, 3, 2, 3, 2, 2, 2, 2, 2, 1][i],
    })),
  },
};

// ─── Admin mock data ──────────────────────────────────────────────────────────

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "user-admin-1",
    email: "admin@tcms.local",
    name: "Alex Admin",
    role: "admin",
    assignedClients: [],
    lastLogin: "2026-04-09T08:00:00Z",
    status: "active",
  },
  {
    id: "mgr-1",
    email: "mgr1@tcms.local",
    name: "Jordan Miller",
    role: "account_manager",
    assignedClients: ["bright-plumbing", "metro-hvac", "city-electrical"],
    lastLogin: "2026-04-09T07:30:00Z",
    status: "active",
  },
  {
    id: "mgr-2",
    email: "mgr2@tcms.local",
    name: "Casey Rivera",
    role: "account_manager",
    assignedClients: ["sunrise-dental", "peak-roofing", "lakeside-legal"],
    lastLogin: "2026-04-08T16:45:00Z",
    status: "active",
  },
  {
    id: "viewer-1",
    email: "viewer@tcms.local",
    name: "Sam Viewer",
    role: "viewer",
    assignedClients: ["bright-plumbing", "city-electrical"],
    lastLogin: "2026-04-07T11:00:00Z",
    status: "active",
  },
];

export const MOCK_SYNC_STATUS: SyncStatus[] = [
  { service: "google-ads", lastSync: "2026-04-09T06:00:00Z", nextSync: "2026-04-09T09:00:00Z", status: "ok", errorLog: [] },
  { service: "lsa", lastSync: "2026-04-09T05:30:00Z", nextSync: "2026-04-09T08:30:00Z", status: "ok", errorLog: [] },
  { service: "gbp", lastSync: "2026-04-08T22:00:00Z", nextSync: "2026-04-09T22:00:00Z", status: "warning", errorLog: ["2026-04-07: Rate limit hit — partial data for metro-hvac"] },
  { service: "email", lastSync: "2026-04-09T04:00:00Z", nextSync: "2026-04-09T07:00:00Z", status: "ok", errorLog: [] },
  { service: "seo", lastSync: "2026-04-07T02:00:00Z", nextSync: "2026-04-08T02:00:00Z", status: "error", errorLog: ["2026-04-08: GSC API quota exceeded", "2026-04-07: Timeout on sunrise-dental property"] },
  { service: "reviews", lastSync: "2026-04-09T03:00:00Z", nextSync: "2026-04-09T06:00:00Z", status: "ok", errorLog: [] },
  { service: "lead-gen", lastSync: "2026-04-09T01:00:00Z", nextSync: "2026-04-09T04:00:00Z", status: "ok", errorLog: [] },
];

export const MOCK_THRESHOLDS: ServiceThreshold[] = [
  { service: "google-ads", metric: "ROAS", greenMin: 2.0, yellowMin: 1.5, unit: "×" },
  { service: "google-ads", metric: "CTR", greenMin: 4.0, yellowMin: 3.0, unit: "%" },
  { service: "lsa", metric: "Cost Per Lead", greenMin: 0, yellowMin: 0, unit: "$" },
  { service: "gbp", metric: "WoW Impressions", greenMin: -10, yellowMin: -20, unit: "%" },
  { service: "email", metric: "Open Rate", greenMin: 25, yellowMin: 20, unit: "%" },
  { service: "seo", metric: "WoW Click Change", greenMin: -10, yellowMin: -25, unit: "%" },
  { service: "reviews", metric: "Average Rating", greenMin: 4.3, yellowMin: 4.0, unit: "★" },
  { service: "lead-gen", metric: "Qualification Rate", greenMin: 60, yellowMin: 50, unit: "%" },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getClientById(id: string): Client | undefined {
  return MOCK_CLIENTS.find((c) => c.id === id);
}

export function getClientsForRole(
  role: Role,
  assignedClients: string[]
): Client[] {
  if (role === "admin") return MOCK_CLIENTS;
  return MOCK_CLIENTS.filter((c) => assignedClients.includes(c.id));
}

export function getOpenAlerts(clientId?: string): Alert[] {
  const open = MOCK_ALERTS.filter((a) => a.status === "open");
  return clientId ? open.filter((a) => a.clientId === clientId) : open;
}

export function getAlertsByClientId(clientId: string): Alert[] {
  return MOCK_ALERTS.filter((a) => a.clientId === clientId);
}

export function getRecentAlerts(limit = 10): Alert[] {
  return [...MOCK_ALERTS]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/** Summary stats derived from all clients — used for the Overview KPI cards. */
export function getAgencyStats() {
  const total = MOCK_CLIENTS.length;
  const red = MOCK_CLIENTS.filter((c) => c.overallHealth === "red").length;
  const yellow = MOCK_CLIENTS.filter((c) => c.overallHealth === "yellow").length;
  const green = MOCK_CLIENTS.filter((c) => c.overallHealth === "green").length;
  const openAlerts = getOpenAlerts();
  return { total, red, yellow, green, openAlerts: openAlerts.length };
}

/** Per-service health distribution — used for Overview service health bars. */
export function getServiceHealthDistribution() {
  const services = ["google-ads", "lsa", "gbp", "email", "seo", "reviews", "lead-gen"] as const;
  return services.map((service) => {
    const clients = MOCK_CLIENTS.filter((c) => c.activeServices.includes(service));
    return {
      service,
      total: clients.length,
      green: clients.filter((c) => c.serviceHealth[service]?.status === "green").length,
      yellow: clients.filter((c) => c.serviceHealth[service]?.status === "yellow").length,
      red: clients.filter((c) => c.serviceHealth[service]?.status === "red").length,
    };
  });
}

// ─── Service metric getters ───────────────────────────────────────────────────

export function getGoogleAdsMetrics(clientId: string): GoogleAdsMetrics | undefined {
  return GOOGLE_ADS[clientId];
}

export function getLSAMetrics(clientId: string): LSAMetrics | undefined {
  return LSA[clientId];
}

export function getGBPMetrics(clientId: string): GBPMetrics | undefined {
  return GBP[clientId];
}

export function getEmailMetrics(clientId: string): EmailMetrics | undefined {
  return EMAIL[clientId];
}

export function getSEOMetrics(clientId: string): SEOMetrics | undefined {
  return SEO[clientId];
}

export function getReviewMetrics(clientId: string): ReviewMetrics | undefined {
  return REVIEWS[clientId];
}

export function getLeadGenMetrics(clientId: string): LeadGenMetrics | undefined {
  return LEAD_GEN[clientId];
}
