// ─── Core enums / unions ──────────────────────────────────────────────────────

export type ServiceType =
  | "google-ads"
  | "lsa"
  | "gbp"
  | "email"
  | "seo"
  | "reviews"
  | "lead-gen";

export type TrafficLight = "green" | "yellow" | "red";

export type AlertSeverity = "red" | "yellow";
export type AlertStatus = "open" | "resolved";

export const SERVICE_LABELS: Record<ServiceType, string> = {
  "google-ads": "Google Ads",
  lsa: "Local Services Ads",
  gbp: "Google Business Profile",
  email: "Email",
  seo: "SEO",
  reviews: "Reviews",
  "lead-gen": "Lead Gen",
};

// ─── Client ───────────────────────────────────────────────────────────────────

export interface ServiceHealth {
  status: TrafficLight;
  lastUpdated: string; // ISO date string
  summary: string; // one-line status description
  keyMetric?: string; // e.g. "ROAS: 2.4x" or "Avg rating: 4.2★"
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  googleId?: string;
  activeServices: ServiceType[];
  serviceHealth: Partial<Record<ServiceType, ServiceHealth>>;
  overallHealth: TrafficLight;
  assignedManagerId?: string;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  clientId: string;
  clientName: string;
  service: ServiceType;
  severity: AlertSeverity;
  message: string;
  triggerCondition: string;
  thresholdBreached: string;
  timestamp: string; // ISO date string
  status: AlertStatus;
  resolvedAt?: string;
}

// ─── Google Ads ───────────────────────────────────────────────────────────────

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: "active" | "paused";
  impressions: number;
  clicks: number;
  ctr: number; // percentage
  cpc: number; // dollars
  conversions: number;
  spend: number; // dollars
  health: TrafficLight;
}

export interface GoogleAdsTrendPoint {
  date: string;
  spend: number;
  clicks: number;
  conversions: number;
}

export interface GoogleAdsMetrics {
  clientId: string;
  dateRange: string;
  impressions: number;
  clicks: number;
  ctr: number; // percentage
  cpc: number; // dollars
  conversions: number;
  roas: number; // multiplier
  spend: number; // dollars
  budget: number; // dollars
  wowChange: number; // percentage delta vs prior week
  campaigns: GoogleAdsCampaign[];
  trend: GoogleAdsTrendPoint[]; // 14 days
}

// ─── LSA ─────────────────────────────────────────────────────────────────────

export interface LSALeadType {
  type: string;
  count: number;
}

export interface LSATrendPoint {
  date: string;
  leads: number;
  costPerLead: number;
}

export interface LSAMetrics {
  clientId: string;
  dateRange: string;
  leadVolume: number;
  costPerLead: number; // dollars
  leadTypes: LSALeadType[];
  disputedLeads: number;
  chargedLeads: number;
  wowChange: number; // percentage delta on lead volume
  momChange: number;
  trend: LSATrendPoint[]; // 14 days
}

// ─── Google Business Profile ──────────────────────────────────────────────────

export interface GBPTrendPoint {
  date: string;
  impressions: number;
  callClicks: number;
}

export interface GBPMetrics {
  clientId: string;
  dateRange: string;
  impressions: number;
  callClicks: number;
  directionRequests: number;
  websiteClicks: number;
  reviewCount: number;
  reviewAverage: number;
  postCount: number;
  listingStatus: "active" | "suspended" | "pending";
  wowChange: number; // percentage delta on impressions
  trend: GBPTrendPoint[]; // 14 days
}

// ─── Email ────────────────────────────────────────────────────────────────────

export interface EmailCampaign {
  id: string;
  name: string;
  sentDate: string;
  sends: number;
  openRate: number; // percentage
  clickRate: number; // percentage
  bounces: number;
  unsubscribes: number;
}

export interface EmailTrendPoint {
  date: string;
  openRate: number;
  clickRate: number;
}

export interface EmailMetrics {
  clientId: string;
  dateRange: string;
  sends: number;
  openRate: number; // percentage
  clickRate: number; // percentage
  bounces: number;
  unsubscribes: number;
  wowChange: number; // percentage delta on open rate
  campaigns: EmailCampaign[];
  trend: EmailTrendPoint[]; // 14 days
}

// ─── SEO (Google Search Console) ─────────────────────────────────────────────

export interface SEOQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number; // percentage
  position: number; // avg position
  positionChange: number; // positive = improved rank
}

export interface SEOPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SEOTrendPoint {
  date: string;
  clicks: number;
  impressions: number;
}

export interface SEOMetrics {
  clientId: string;
  dateRange: string; // Note: data has an inherent 2-3 day lag
  clicks: number;
  impressions: number;
  ctr: number; // percentage
  avgPosition: number;
  wowChange: number; // percentage delta on clicks
  topQueries: SEOQuery[];
  topPages: SEOPage[];
  trend: SEOTrendPoint[]; // 14 days
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface ReviewEntry {
  id: string;
  rating: number;
  author: string;
  date: string;
  text: string;
  answered: boolean;
  source: "google" | "yelp" | "facebook";
}

export interface ReviewTrendPoint {
  date: string;
  avgRating: number;
  newReviews: number;
}

export interface ReviewMetrics {
  clientId: string;
  dateRange: string;
  totalReviews: number;
  averageRating: number;
  newReviews: number; // within date range
  unansweredReviews: number;
  ratingDistribution: Record<string, number>; // keys "1"–"5"
  trend: ReviewTrendPoint[]; // 14 days
  recentReviews: ReviewEntry[];
}

// ─── Lead Gen ─────────────────────────────────────────────────────────────────

export interface LeadSource {
  source: string;
  count: number;
  qualified: number;
  conversionRate: number; // percentage
}

export interface LeadStage {
  stage: string;
  count: number;
}

export interface LeadGenTrendPoint {
  date: string;
  leads: number;
  qualified: number;
}

export interface LeadGenMetrics {
  clientId: string;
  dateRange: string;
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number; // percentage
  wowChange: number; // percentage delta on total leads
  sources: LeadSource[];
  conversionStages: LeadStage[];
  trend: LeadGenTrendPoint[]; // 14 days
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "account_manager" | "viewer";
  assignedClients: string[];
  lastLogin: string;
  status: "active" | "inactive";
}

export interface ServiceThreshold {
  service: ServiceType;
  metric: string;
  greenMin: number;
  yellowMin: number; // below this = red
  unit: string;
}

export interface SyncStatus {
  service: ServiceType;
  lastSync: string;
  nextSync: string;
  status: "ok" | "error" | "warning";
  errorLog: string[];
}

export interface ClientConfig {
  clientId: string;
  thresholdOverrides: Partial<Record<ServiceType, Record<string, number>>>;
  apiCredentials: Partial<Record<ServiceType, { configured: boolean; lastVerified: string }>>;
}
