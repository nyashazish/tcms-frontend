"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MagnifyingGlass, Plus, UploadSimple, Users, CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { Client } from "@/lib/types";
import { SERVICE_LABELS } from "@/lib/types";
import { TrafficDot } from "@/components/dashboard/TrafficDot";
import { AddClientModal } from "@/components/dashboard/AddClientModal";
import { UploadCSVModal } from "@/components/dashboard/UploadCSVModal";

interface PaginationMeta {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

interface Props {
  clients: Client[];
  pagination?: PaginationMeta;
}

const HEALTH_LABELS: Record<string, string> = {
  green: "Healthy",
  yellow: "Warning",
  red: "Critical",
};

const HEALTH_COLORS: Record<string, string> = {
  green: "var(--accent-green)",
  yellow: "var(--accent-yellow)",
  red: "var(--accent-red)",
};

export function ClientGrid({ clients: initialClients, pagination }: Props) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const filtered = query.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.industry.toLowerCase().includes(query.toLowerCase())
      )
    : clients;

  function handleAdd(client: Client) {
    setClients((prev) => [...prev, client]);
  }

  function handleUpload(incoming: Client[]) {
    setClients((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const deduped = incoming.filter((c) => !existingIds.has(c.id));
      return [...prev, ...deduped];
    });
  }

  return (
    <>
      {/* Section header with action buttons */}
      <div className="section-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2>Clients</h2>
          <span
            className="text-muted"
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}
          >
            <Users size={14} weight="regular" />
            {pagination ? pagination.total : clients.length} client{(pagination ? pagination.total : clients.length) !== 1 ? "s" : ""}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-secondary" onClick={() => setUploadOpen(true)}>
            <UploadSimple size={14} weight="bold" />
            Upload CSV
          </button>
          <button className="btn-primary" onClick={() => setAddOpen(true)}>
            <Plus size={14} weight="bold" />
            Add Client
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="client-search">
        <span className="client-search-icon">
          <MagnifyingGlass size={16} />
        </span>
        <input
          type="search"
          className="form-input client-search-input"
          placeholder="Search by name or industry…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p
          className="text-muted"
          style={{ fontSize: 13, padding: "40px 0", textAlign: "center" }}
        >
          {query.trim()
            ? <>No clients match &ldquo;{query}&rdquo;</>
            : "No clients yet. Add one above or upload a CSV."}
        </p>
      ) : (
        <div className="client-grid">
          {filtered.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="client-card card"
            >
              <div className="client-card-header">
                <div>
                  <p className="client-card-name">{client.name}</p>
                  <p className="card-subtitle">
                    {client.industry || (client.googleId ? `ID: ${client.googleId}` : "New client")}
                  </p>
                </div>
                <div className="client-card-health">
                  <TrafficDot status={client.overallHealth} size="md" />
                  <span
                    className="client-card-health-label"
                    style={{ color: HEALTH_COLORS[client.overallHealth] }}
                  >
                    {HEALTH_LABELS[client.overallHealth]}
                  </span>
                </div>
              </div>

              {client.activeServices.length > 0 && (
                <div className="client-card-services">
                  {client.activeServices.map((service) => (
                    <div key={service} className="client-card-service">
                      <TrafficDot status={client.serviceHealth[service]!.status} />
                      <span>{SERVICE_LABELS[service]}</span>
                    </div>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border-color)" }}>
          <span className="pagination-info">
            {(() => {
              const start = (pagination.page - 1) * pagination.limit + 1;
              const end = Math.min(pagination.page * pagination.limit, pagination.total);
              return `${start}–${end} of ${pagination.total} clients`;
            })()}
          </span>
          <div className="pagination-controls">
            <button
              className={`pagination-btn${pagination.page === 1 ? " disabled" : ""}`}
              disabled={pagination.page === 1}
              onClick={() => router.push(`${pathname}?page=${pagination.page - 1}`)}
            >
              <CaretLeft size={12} />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>
                ) : (
                  <button
                    key={p}
                    className={`pagination-btn${p === pagination.page ? " active" : ""}`}
                    onClick={() => router.push(`${pathname}?page=${p}`)}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              className={`pagination-btn${pagination.page === pagination.totalPages ? " disabled" : ""}`}
              disabled={pagination.page === pagination.totalPages}
              onClick={() => router.push(`${pathname}?page=${pagination.page + 1}`)}
            >
              <CaretRight size={12} />
            </button>
          </div>
        </div>
      )}

      {addOpen && (
        <AddClientModal
          onClose={() => setAddOpen(false)}
          onAdd={(client) => {
            handleAdd(client);
            setAddOpen(false);
          }}
        />
      )}

      {uploadOpen && (
        <UploadCSVModal
          onClose={() => setUploadOpen(false)}
          onUpload={(incoming) => {
            handleUpload(incoming);
            setUploadOpen(false);
          }}
        />
      )}
    </>
  );
}
