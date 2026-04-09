"use client";

import { useState } from "react";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { Client } from "@/lib/types";
import { SERVICE_LABELS } from "@/lib/types";
import { TrafficDot } from "@/components/dashboard/TrafficDot";

interface Props {
  clients: Client[];
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

export function ClientGrid({ clients }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.industry.toLowerCase().includes(query.toLowerCase())
      )
    : clients;

  return (
    <>
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
          No clients match &ldquo;{query}&rdquo;
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
                  <p className="card-subtitle">{client.industry}</p>
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

              <div className="client-card-services">
                {client.activeServices.map((service) => (
                  <div key={service} className="client-card-service">
                    <TrafficDot
                      status={client.serviceHealth[service]!.status}
                    />
                    <span>{SERVICE_LABELS[service]}</span>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
