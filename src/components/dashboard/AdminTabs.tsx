"use client";

import { useState } from "react";
import {
  Users,
  Gear,
  ArrowsClockwise,
  Plus,
  Monitor,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import type { AdminUser, Client, SyncStatus, ServiceThreshold } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { SERVICE_LABELS } from "@/lib/types";

interface Props {
  users: AdminUser[];
  clients: Client[];
  syncStatus: SyncStatus[];
  thresholds: ServiceThreshold[];
}

export function AdminTabs({ users, clients, syncStatus, thresholds }: Props) {
  const [activeTab, setActiveTab] = useState<"users" | "clients" | "thresholds" | "sync">("users");

  return (
    <>
      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="marketplace-tabs" style={{ marginBottom: 24 }}>
        <button
          className={`tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={14} style={{ marginRight: 6 }} />
          Users
        </button>
        <button
          className={`tab ${activeTab === "clients" ? "active" : ""}`}
          onClick={() => setActiveTab("clients")}
        >
          <Gear size={14} style={{ marginRight: 6 }} />
          Clients
        </button>
        <button
          className={`tab ${activeTab === "thresholds" ? "active" : ""}`}
          onClick={() => setActiveTab("thresholds")}
        >
          <Monitor size={14} style={{ marginRight: 6 }} />
          Thresholds
        </button>
        <button
          className={`tab ${activeTab === "sync" ? "active" : ""}`}
          onClick={() => setActiveTab("sync")}
        >
          <ArrowsClockwise size={14} style={{ marginRight: 6 }} />
          Sync Status
        </button>
      </div>

      {/* ── User Management ──────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "20px 24px", marginBottom: 0, alignItems: "center" }}>
            <p className="card-title" style={{ margin: 0 }}>System Users</p>
            <button className="btn-primary">
              <Plus size={14} weight="bold" />
              Add User
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: "0 24px 12px", textAlign: "left" }}>User</th>
                  <th style={{ padding: "0 12px 12px", textAlign: "left" }}>Role</th>
                  <th style={{ padding: "0 12px 12px", textAlign: "left" }}>Assigned Clients</th>
                  <th style={{ padding: "0 12px 12px", textAlign: "right" }}>Last Login</th>
                  <th style={{ padding: "0 24px 12px", textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ padding: "12px 24px" }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</div>
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      <span className="service-badge">{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      {u.role === "admin" ? (
                        <span className="text-muted" style={{ fontSize: 12 }}>All Clients</span>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {u.assignedClients.length > 0 ? (
                            u.assignedClients.slice(0, 2).map(id => (
                              <span key={id} className="badge" style={{ background: "var(--bg-base)", border: "1px solid var(--border-color)", fontSize: 10 }}>
                                {clients.find(c => c.id === id)?.name || id}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted" style={{ fontSize: 12 }}>None</span>
                          )}
                          {u.assignedClients.length > 2 && (
                            <span className="text-muted" style={{ fontSize: 10 }}>+{u.assignedClients.length - 2} more</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 12px", textAlign: "right", fontSize: 12, color: "var(--text-secondary)" }}>
                      {new Date(u.lastLogin).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td style={{ padding: "12px 24px", textAlign: "center" }}>
                      <span className={`badge ${u.status === "active" ? "positive" : "text-muted"}`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Client Configuration ─────────────────────────────────────────── */}
      {activeTab === "clients" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "20px 24px", marginBottom: 0 }}>
            <p className="card-title" style={{ margin: 0 }}>Service Configuration</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: "0 24px 12px", textAlign: "left" }}>Client</th>
                  <th style={{ padding: "0 12px 12px", textAlign: "left" }}>Active Services</th>
                  <th style={{ padding: "0 12px 12px", textAlign: "center" }}>API Connectivity</th>
                  <th style={{ padding: "0 24px 12px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.industry}</div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {c.activeServices.map(s => (
                          <span key={s} className="service-badge" style={{ fontSize: 9 }}>{SERVICE_LABELS[s]}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                        <div title="Google Ads connected"><ShieldCheck size={18} weight="fill" color="var(--accent-green)" /></div>
                        <div title="Search Console connected"><ShieldCheck size={18} weight="fill" color="var(--accent-green)" /></div>
                        <div title="GBP needs reauth"><WarningCircle size={18} weight="fill" color="var(--accent-yellow)" /></div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 8px" }}>Configure</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Threshold Management ─────────────────────────────────────────── */}
      {activeTab === "thresholds" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "20px 24px", marginBottom: 0 }}>
            <p className="card-title" style={{ margin: 0 }}>Global Threshold Defaults</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: "0 24px 12px", textAlign: "left" }}>Service</th>
                  <th style={{ padding: "0 12px 12px", textAlign: "left" }}>Target Metric</th>
                  <th style={{ padding: "0 12px 12px", textAlign: "center" }}>Healthy (Green)</th>
                  <th style={{ padding: "0 12px 12px", textAlign: "center" }}>Warning (Yellow)</th>
                  <th style={{ padding: "0 24px 12px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {thresholds.map((t, i) => (
                  <tr key={i}>
                    <td style={{ padding: "16px 24px", fontWeight: 500, fontSize: 13 }}>{SERVICE_LABELS[t.service]}</td>
                    <td style={{ padding: "16px 12px", fontSize: 13 }}>{t.metric}</td>
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
                      <span className="badge positive">≥ {t.greenMin}{t.unit}</span>
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
                      <span className="badge" style={{ color: "var(--accent-yellow)", background: "rgba(234, 179, 8, 0.1)" }}>≥ {t.yellowMin}{t.unit}</span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 8px" }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "16px 24px", background: "var(--bg-base)", fontSize: 12, color: "var(--text-muted)" }}>
            <WarningCircle size={12} style={{ marginRight: 4 }} />
            Critical (Red) status is automatically triggered when a metric falls below the Warning threshold.
          </div>
        </div>
      )}

      {/* ── Sync Status Monitor ──────────────────────────────────────────── */}
      {activeTab === "sync" && (
        <div style={{ display: "grid", gap: 24 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="card-header" style={{ padding: "20px 24px", marginBottom: 0 }}>
              <p className="card-title" style={{ margin: 0 }}>API Integration Status</p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ padding: "0 24px 12px", textAlign: "left" }}>Integration</th>
                    <th style={{ padding: "0 12px 12px", textAlign: "left" }}>Last Successful Sync</th>
                    <th style={{ padding: "0 12px 12px", textAlign: "left" }}>Next Scheduled</th>
                    <th style={{ padding: "0 24px 12px", textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {syncStatus.map((s) => (
                    <tr key={s.service}>
                      <td style={{ padding: "16px 24px", fontWeight: 500, fontSize: 13 }}>{SERVICE_LABELS[s.service]}</td>
                      <td style={{ padding: "16px 12px", fontSize: 13 }}>
                        {new Date(s.lastSync).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </td>
                      <td style={{ padding: "16px 12px", fontSize: 13, color: "var(--text-muted)" }}>
                        {new Date(s.nextSync).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "center" }}>
                        {s.status === "ok" ? (
                          <CheckCircle size={20} weight="fill" color="var(--accent-green)" />
                        ) : s.status === "warning" ? (
                          <WarningCircle size={20} weight="fill" color="var(--accent-yellow)" />
                        ) : (
                          <XCircle size={20} weight="fill" color="var(--accent-red)" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <p className="card-title">Recent Error Logs</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {syncStatus.flatMap(s => s.errorLog).slice(0, 5).map((log, i) => (
                <div key={i} style={{ padding: "10px 12px", background: "var(--accent-red-bg)", borderRadius: 6, fontSize: 12, border: "1px solid var(--accent-red)" }}>
                  {log}
                </div>
              ))}
              {syncStatus.every(s => s.errorLog.length === 0) && (
                <p className="text-muted" style={{ fontSize: 13, textAlign: "center", padding: "20px 0" }}>No errors in the last 24 hours.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
