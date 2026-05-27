const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getAccessToken(): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get('tcms-access-token')?.value ?? null;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

// Maps API health status ('critical' | 'warning' | 'healthy') to frontend TrafficLight ('red' | 'yellow' | 'green')
export function mapHealthStatus(status: string): 'red' | 'yellow' | 'green' {
  if (status === 'critical') return 'red';
  if (status === 'warning') return 'yellow';
  return 'green';
}

// Maps DB service type (snake_case) to frontend ServiceType (kebab-case)
export function mapServiceType(dbType: string): string {
  const map: Record<string, string> = {
    google_ads: 'google-ads',
    lsa: 'lsa',
    google_business_profile: 'gbp',
    google_search_console: 'seo',
    active_campaign: 'email',
    google_sheets_aos: 'lead-gen',
  };
  return map[dbType] ?? dbType;
}

// Maps API alert severity to frontend AlertSeverity ('red' | 'yellow')
export function mapAlertSeverity(severity: string): 'red' | 'yellow' {
  if (severity === 'critical' || severity === 'high') return 'red';
  return 'yellow';
}

// Maps API alert status ('active' | 'acknowledged' | 'resolved') to frontend AlertStatus ('open' | 'resolved')
export function mapAlertStatus(status: string): 'open' | 'resolved' {
  return status === 'resolved' ? 'resolved' : 'open';
}

// ─── Overview ─────────────────────────────────────────────────────────────────

export interface OverviewStats {
  totalClients: number;
  critical: number;
  warning: number;
  healthy: number;
}

export interface ServiceHealthDistribution {
  serviceType: string;
  critical: number;
  warning: number;
  healthy: number;
}

export interface AlertInstance {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface ClientHealth {
  id: string;
  name: string;
  industry?: string;
  healthStatus: string; // 'critical' | 'warning' | 'healthy'
  services: { serviceType: string; healthStatus: string }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OverviewResponse {
  stats: OverviewStats;
  serviceHealthDistribution: ServiceHealthDistribution[];
  activeAlerts: PaginatedResponse<AlertInstance>;
  clientHealth: PaginatedResponse<ClientHealth>;
}

// ─── Clients ──────────────────────────────────────────────────────────────────

// Shape returned by GET /clients (list)
export interface Client {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'paused';
  metadata?: Record<string, unknown>;
  healthStatus: string; // 'critical' | 'warning' | 'healthy'
  services: { serviceType: string; healthStatus: string }[];
  createdAt?: string;
}

// Shape returned by GET /clients/:id (detail — richer service data)
export interface ApiClientDetail {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'paused';
  metadata?: Record<string, unknown>;
  healthStatus: string;
  services: {
    id: string;
    serviceId: string;
    serviceName: string | null;
    serviceType: string;
    isActive: string; // 'active' | 'inactive' | 'auth_error'
    lastSyncedAt: string | null;
    healthStatus: string;
  }[];
  createdAt?: string;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

// Shape returned by GET /clients/:id/alerts (enriched with rule + service data)
export interface ApiAlert {
  id: string;
  clientId: string;
  clientName: string;
  ruleId: string;
  serviceType: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: string;
  resolvedAt: string | null;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function getOverview(options?: {
  clientPage?: number;
  clientLimit?: number;
  alertPage?: number;
  alertLimit?: number;
}): Promise<OverviewResponse> {
  const params = new URLSearchParams();
  if (options?.clientPage) params.set('clientPage', String(options.clientPage));
  if (options?.clientLimit) params.set('clientLimit', String(options.clientLimit));
  if (options?.alertPage) params.set('alertPage', String(options.alertPage));
  if (options?.alertLimit) params.set('alertLimit', String(options.alertLimit));

  const query = params.toString();
  return fetchApi<OverviewResponse>(`/overview${query ? `?${query}` : ''}`);
}

export async function getClients(options?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Client>> {
  const params = new URLSearchParams();
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));

  const query = params.toString();
  return fetchApi<PaginatedResponse<Client>>(`/clients${query ? `?${query}` : ''}`);
}

export async function getClient(id: string): Promise<ApiClientDetail> {
  const response = await fetchApi<{ data: ApiClientDetail }>(`/clients/${id}`);
  return response.data;
}

export async function createClient(data: { name: string; status?: 'active' | 'inactive' | 'paused' }): Promise<{ data: { id: string; name: string } }> {
  return fetchApi('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAlerts(clientId: string, options?: {
  status?: 'active' | 'acknowledged' | 'resolved';
}): Promise<{ data: ApiAlert[] }> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);

  const query = params.toString();
  return fetchApi<{ data: ApiAlert[] }>(`/clients/${clientId}/alerts${query ? `?${query}` : ''}`);
}

export async function getAllAlertsForClientIds(clientIds: string[]): Promise<ApiAlert[]> {
  const alerts: ApiAlert[] = [];

  for (const clientId of clientIds) {
    try {
      const response = await getAlerts(clientId, { status: 'active' });
      alerts.push(...response.data);
    } catch (error) {
      console.error(`Failed to fetch alerts for client ${clientId}:`, error);
    }
  }

  return alerts;
}

export async function updateAlertStatus(alertId: string, status: 'acknowledged' | 'resolved'): Promise<void> {
  await fetchApi(`/clients/alerts/${alertId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
