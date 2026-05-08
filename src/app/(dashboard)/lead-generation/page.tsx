import { getSession } from "@/lib/auth/getSession";
import { LeadGenDashboard } from "@/components/dashboard/LeadGenDashboard";
import {
  KPI,
  MONTHLY_TREND,
  SERVICE_REQUESTS,
  LEAD_SOURCES,
  LEAD_MEDIUMS,
  LEAD_TYPES,
  CLIENT_BREAKDOWN,
  ANOMALIES,
} from "@/lib/lead-gen-dashboard-data";

export default async function LeadGenerationPage() {
  const user = await getSession();
  if (!user) return null;

  return (
    <LeadGenDashboard
      kpi={KPI}
      monthlyTrend={MONTHLY_TREND}
      serviceRequests={SERVICE_REQUESTS}
      leadSources={LEAD_SOURCES}
      leadMediums={LEAD_MEDIUMS}
      leadTypes={LEAD_TYPES}
      clientBreakdown={CLIENT_BREAKDOWN}
      anomalies={ANOMALIES}
    />
  );
}
