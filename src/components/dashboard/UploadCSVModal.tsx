"use client";

import { useState, useRef } from "react";
import { X, UploadSimple, CheckCircle, FileCsv, Warning } from "@phosphor-icons/react";
import type { Client } from "@/lib/types";

interface Props {
  onClose: () => void;
  onUpload: (clients: Client[]) => void;
}

type ParseResult =
  | { ok: true; clients: Client[]; skipped: number }
  | { ok: false; error: string };

function parseCSV(text: string): ParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2)
    return { ok: false, error: "CSV must have a header row and at least one data row." };

  const headers = lines[0].split(",").map((h) =>
    h.trim().toLowerCase().replace(/[\s_\-'"]+/g, "")
  );

  const nameIdx = headers.findIndex((h) => h === "name" || h === "clientname");
  const googleIdIdx = headers.findIndex(
    (h) => h === "googleid" || h === "clientgoogleid" || h === "googlecustomerid"
  );

  if (nameIdx === -1) return { ok: false, error: 'CSV must have a "name" column.' };
  if (googleIdIdx === -1) return { ok: false, error: 'CSV must have a "googleId" column.' };

  const clients: Client[] = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const name = cols[nameIdx] ?? "";
    const googleId = cols[googleIdIdx] ?? "";
    if (!name || !googleId) {
      skipped++;
      continue;
    }
    clients.push({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + i,
      name,
      googleId,
      industry: "",
      activeServices: [],
      serviceHealth: {},
      overallHealth: "green",
    });
  }

  return { ok: true, clients, skipped };
}

export function UploadCSVModal({ onClose, onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setParseResult(parseCSV(text));
    };
    reader.readAsText(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) handleFile(f);
  }

  function handleConfirm() {
    if (!parseResult?.ok || parseResult.clients.length === 0) return;
    onUpload(parseResult.clients);
    setUploaded(true);
  }

  const canImport = parseResult?.ok === true && parseResult.clients.length > 0;
  const importCount = parseResult?.ok ? parseResult.clients.length : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Upload Clients CSV</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} weight="bold" />
          </button>
        </div>

        {uploaded ? (
          <div className="modal-success">
            <CheckCircle size={36} weight="fill" color="var(--accent-green)" />
            <p className="modal-success-text">
              <strong>{importCount}</strong> client{importCount !== 1 ? "s" : ""} imported
              successfully.
            </p>
            <button className="btn-secondary" onClick={onClose} style={{ marginTop: 16 }}>
              Close
            </button>
          </div>
        ) : (
          <div className="modal-form">
            {/* Drop zone */}
            <div
              style={{
                border: `2px dashed ${dragging ? "var(--accent-clr)" : "var(--border-color)"}`,
                borderRadius: 8,
                padding: "32px 24px",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
                background: dragging ? "var(--bg-surface-hover)" : "var(--bg-surface)",
              }}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              {file ? (
                <>
                  <FileCsv
                    size={32}
                    color="var(--accent-clr)"
                    weight="fill"
                    style={{ marginBottom: 8 }}
                  />
                  <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px" }}>{file.name}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                    {(file.size / 1024).toFixed(1)} KB — click to replace
                  </p>
                </>
              ) : (
                <>
                  <UploadSimple
                    size={32}
                    color="var(--text-muted)"
                    style={{ marginBottom: 8 }}
                  />
                  <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 6px" }}>
                    Drop a CSV file here or click to browse
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                    Required columns:{" "}
                    <code style={{ fontSize: 11 }}>name</code>,{" "}
                    <code style={{ fontSize: 11 }}>googleId</code>
                  </p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>

            {/* Parse result feedback */}
            {parseResult && (
              <div style={{ marginTop: 12 }}>
                {parseResult.ok ? (
                  parseResult.clients.length > 0 ? (
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--accent-green)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        margin: 0,
                      }}
                    >
                      <CheckCircle size={14} weight="fill" />
                      {parseResult.clients.length} client
                      {parseResult.clients.length !== 1 ? "s" : ""} ready to import
                      {parseResult.skipped > 0
                        ? ` (${parseResult.skipped} row${parseResult.skipped !== 1 ? "s" : ""} skipped — missing fields)`
                        : ""}
                      .
                    </p>
                  ) : (
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--accent-yellow)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        margin: 0,
                      }}
                    >
                      <Warning size={14} weight="fill" />
                      No valid rows found.{" "}
                      {parseResult.skipped > 0 &&
                        `${parseResult.skipped} row${parseResult.skipped !== 1 ? "s" : ""} skipped — check that name and googleId are filled in.`}
                    </p>
                  )
                ) : (
                  <div className="form-server-error" style={{ marginBottom: 0 }}>
                    {parseResult.error}
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!canImport}
                onClick={handleConfirm}
              >
                <UploadSimple size={14} weight="bold" />
                Import{canImport ? ` ${importCount} Client${importCount !== 1 ? "s" : ""}` : " Clients"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
