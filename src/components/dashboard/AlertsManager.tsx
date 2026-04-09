"use client";

import { useState } from "react";
import type { Alert, Client, ServiceType, AlertStatus, AlertSeverity } from "@/lib/types";
import { SERVICE_LABELS } from "@/lib/types";
import { TrafficDot } from "@/components/dashboard/TrafficDot";
import { Funnel, CheckCircle, Clock } from "@phosphor-icons/react";

interface Props {
  initialAlerts: Alert[];
  clients: Client[];
}

export function AlertsManager({ initialAlerts, clients }: Props) {
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<ServiceType | "all">("all");

  const filtered = initialAlerts.filter((a) => {
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (clientFilter !== "all" && a.clientId !== clientFilter) return false;
    if (serviceFilter !== "all" && a.service !== serviceFilter) return false;
    return true;
  });

  const criticalCount = initialAlerts.filter((a) => a.severity === "red" && a.status === "open").length;
  const warningCount = initialAlerts.filter((a) => a.severity === "yellow" && a.status === "open").length;

  return (
    <>
      {/* ── Severity Tabs ─────────────────────────────────────────────────── */}
      <div className="marketplace-tabs" style={{ marginBottom: 24 }}>
        <button
          className={`tab ${severityFilter === "all" ? "active" : ""}`}
          onClick={() => setSeverityFilter("all")}
        >
          All Alerts
        </button>
        <button
          className={`tab ${severityFilter === "red" ? "active" : ""}`}
          onClick={() => setSeverityFilter("red")}
        >
          Critical {criticalCount > 0 && <span className="badge negative" style={{ marginLeft: 6 }}>{criticalCount}</span>}
        </button>
        <button
          className={`tab ${severityFilter === "yellow" ? "active" : ""}`}
          onClick={() => setSeverityFilter("yellow")}
        >
          Warnings {warningCount > 0 && <span className="badge outline-yellow" style={{ marginLeft: 6, color: "var(--accent-yellow)" }}>{warningCount}</span>}
        </button>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 24, padding: "16px 20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 13, marginRight: 8 }}>
            <Funnel size={16} />
            <span>Filters:</span>
          </div>

          <select
            className="form-select"
            style={{ width: "auto", minWidth: 140 }}
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: "auto", minWidth: 140 }}
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value as ServiceType)}
          >
            <option value="all">All Services</option>
            {Object.entries(SERVICE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: "auto", minWidth: 120 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AlertStatus)}
          >
            <option value="all">Any Status</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>

          <button
            className="btn-secondary"
            style={{ marginLeft: "auto" }}
            onClick={() => {
              setSeverityFilter("all");
              setClientFilter("all");
              setServiceFilter("all");
              setStatusFilter("all");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ padding: "16px 24px", width: "40px" }}></th>
                <th style={{ padding: "16px 12px", textAlign: "left" }}>Client / Service</th>
                <th style={{ padding: "16px 12px", textAlign: "left" }}>Issue</th>
                <th style={{ padding: "16px 12px", textAlign: "left" }}>Trigger / Threshold</th>
                <th style={{ padding: "16px 12px", textAlign: "right" }}>Detected</th>
                <th style={{ padding: "16px 24px", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
                    No alerts match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((alert) => (
                  <tr key={alert.id}>
                    <td style={{ padding: "16px 0 16px 24px", textAlign: "center" }}>
                      <TrafficDot status={alert.severity} />
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{alert.clientName}</div>
                      <div className="service-badge" style={{ marginTop: 4 }}>{SERVICE_LABELS[alert.service]}</div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ fontSize: 13, lineHeight: 1.4 }}>{alert.message}</div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{alert.triggerCondition}</div>
                      <div style={{ fontSize: 12, fontWeight: 500, marginTop: 4, color: "var(--accent-red)" }}>{alert.thresholdBreached}</div>
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "var(--text-primary)" }}>
                        {new Date(alert.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {new Date(alert.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                      {alert.status === "resolved" ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <span className="badge positive">Resolved</span>
                          {alert.resolvedAt && (
                            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                              {new Date(alert.resolvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="badge outline-green" style={{ color: "var(--accent-green)", borderColor: "var(--accent-green)" }}>
                          Open
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
