export interface MonthlyTrendPoint {
  month: string;
  total: number;
  quotable: number;
  notQuotable: number;
  spam: number;
}

export interface ServiceRequestRow {
  service: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  ytd: number;
}

export interface LeadSourceRow {
  source: string;
  quotable: number;
  spam: number;
  total: number;
}

export interface LeadMediumRow {
  medium: string;
  quotable: number;
  spam: number;
  total: number;
}

export interface LeadTypeRow {
  type: string;
  quotable: number;
  notQuotable: number;
  spam: number;
}

export interface ClientBreakdownRow {
  client: string;
  total: number;
  quotable: number;
  quotablePct: number;
  spam: number;
  spamPct: number;
  unique: number;
}

export interface Anomaly {
  type: "quotable drop" | "volume drop" | "spam spike";
  client: string;
  message: string;
}

export const KPI = {
  totalLeads: 12450,
  quotable: 4820,
  notQuotable: 5940,
  pending: 680,
  spam: 1010,
  uniqueLeads: 8240,
  quotableRate: 38.7,
  calls: 9200,
  forms: 3250,
} as const;

export const MONTHLY_TREND: MonthlyTrendPoint[] = [
  { month: "Jan", total: 1840, quotable: 712, notQuotable: 908, spam: 220 },
  { month: "Feb", total: 2150, quotable: 830, notQuotable: 1060, spam: 260 },
  { month: "Mar", total: 4280, quotable: 1640, notQuotable: 2110, spam: 530 },
  { month: "Apr", total: 3120, quotable: 1200, notQuotable: 1540, spam: 380 },
  { month: "May", total: 1060, quotable: 438, notQuotable: 522, spam: 100 },
];

export const SERVICE_REQUESTS: ServiceRequestRow[] = [
  { service: "Emergency Repair",          jan: 420, feb: 498, mar: 1020, apr: 742, may: 248, ytd: 2928 },
  { service: "Installation / Replacement", jan: 380, feb: 442, mar:  890, apr: 618, may: 196, ytd: 2526 },
  { service: "Maintenance / Inspection",   jan: 312, feb: 364, mar:  720, apr: 524, may: 168, ytd: 2088 },
  { service: "Consultation / Estimate",    jan: 248, feb: 290, mar:  580, apr: 420, may: 132, ytd: 1670 },
  { service: "General Inquiry",            jan: 196, feb: 228, mar:  458, apr: 328, may: 104, ytd: 1314 },
  { service: "Commercial Service",         jan: 124, feb: 142, mar:  284, apr: 212, may:  68, ytd:  830 },
  { service: "Other / Unspecified",        jan: 160, feb: 186, mar:  328, apr: 276, may:  44, ytd:  994 },
];

export const LEAD_SOURCES: LeadSourceRow[] = [
  { source: "gbp",        quotable: 1840, spam: 420, total: 4820 },
  { source: "google_ads", quotable:  980, spam: 148, total: 2640 },
  { source: "lsa",        quotable:  740, spam:  92, total: 1980 },
  { source: "organic",    quotable:  520, spam:  64, total: 1380 },
  { source: "direct",     quotable:  380, spam:  82, total:  980 },
  { source: "email",      quotable:  220, spam:  42, total:  580 },
  { source: "bing",       quotable:   80, spam:  24, total:  220 },
  { source: "referral",   quotable:   60, spam:  18, total:  160 },
];

export const LEAD_MEDIUMS: LeadMediumRow[] = [
  { medium: "cpc",      quotable: 1620, spam: 186, total: 3840 },
  { medium: "(none)",   quotable: 1120, spam: 428, total: 3680 },
  { medium: "organic",  quotable:  980, spam: 124, total: 2560 },
  { medium: "referral", quotable:  620, spam:  68, total: 1640 },
  { medium: "email",    quotable:  320, spam:  64, total:  840 },
  { medium: "display",  quotable:  180, spam:  42, total:  640 },
];

export const LEAD_TYPES: LeadTypeRow[] = [
  { type: "Phone Call",    quotable: 3240, notQuotable: 4100, spam: 580 },
  { type: "Web Form",      quotable: 1080, notQuotable: 1200, spam: 180 },
  { type: "Text Message",  quotable:  380, notQuotable:  520, spam: 280 },
  { type: "Email",         quotable:  120, notQuotable:  120, spam:  30 },
  { type: "(unknown)",     quotable:    0, notQuotable:    0, spam:  20 },
];

export const CLIENT_BREAKDOWN: ClientBreakdownRow[] = [
  { client: "Bright Plumbing Co",       total: 2840, quotable: 1120, quotablePct: 39, spam: 198, spamPct:  7, unique: 1960 },
  { client: "Metro HVAC Solutions",      total: 2180, quotable:  790, quotablePct: 36, spam: 248, spamPct: 11, unique: 1480 },
  { client: "City Electrical Services",  total: 2040, quotable:  820, quotablePct: 40, spam: 168, spamPct:  8, unique: 1440 },
  { client: "Sunrise Dental Group",      total: 1920, quotable:  820, quotablePct: 43, spam: 142, spamPct:  7, unique: 1360 },
  { client: "Peak Roofing LLC",          total: 1840, quotable:  640, quotablePct: 35, spam: 196, spamPct: 11, unique: 1280 },
  { client: "Lakeside Legal Group",      total: 1630, quotable:  630, quotablePct: 39, spam: 138, spamPct:  8, unique: 1120 },
];

export const ANOMALIES: Anomaly[] = [
  { type: "quotable drop", client: "Metro HVAC Solutions",     message: "May: Quotable leads dropped to 48 from 210 (−77%)" },
  { type: "volume drop",   client: "Peak Roofing LLC",         message: "May: Total leads dropped to 82 from 420" },
  { type: "quotable drop", client: "Lakeside Legal Group",     message: "May: Quotable leads dropped to 28 from 142 (−80%)" },
  { type: "spam spike",    client: "City Electrical Services", message: "Apr: Spam leads spiked to 88 from 24 (+267%)" },
  { type: "volume drop",   client: "Sunrise Dental Group",     message: "May: Total leads dropped to 156 from 640" },
  { type: "quotable drop", client: "Bright Plumbing Co",       message: "May: Quotable leads dropped to 92 from 380 (−76%)" },
];
