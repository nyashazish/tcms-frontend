import { getClientById, getReviewMetrics } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  ChatCircleText,
  WarningCircle,
  Checks,
  GoogleLogo,
  FacebookLogo,
} from "@phosphor-icons/react/dist/ssr";
import { TrafficDot } from "@/components/dashboard/TrafficDot";
import { ReviewRatingTrendChart } from "@/components/dashboard/DynamicServiceCharts";

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClientById(id);
  const metrics = getReviewMetrics(id);

  if (!client || !metrics) notFound();

  const health = client.serviceHealth["reviews"];

  return (
    <div>
      {/* ── Back link ─────────────────────────────────────────────────────── */}
      <Link href={`/clients/${id}`} className="back-link">
        <ArrowLeft size={14} />
        {client.name}
      </Link>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2>Reputation & Reviews</h2>
          {health && <TrafficDot status={health.status} size="md" />}
        </div>
        <div className="stats-filters">
          <span className="text-muted" style={{ fontSize: 13 }}>
            {metrics.dateRange}
          </span>
        </div>
      </div>

      {/* ── KPI Grid ─────────────────────────────────────────────────────── */}
      <div className="kpi-grid" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="card-title">
            <Star size={16} /> Average Rating
          </div>
          <p className="kpi-value">{metrics.averageRating}★</p>
          <p className="card-subtitle">across all platforms</p>
        </div>

        <div className="card">
          <div className="card-title">
            <ChatCircleText size={16} /> Total Reviews
          </div>
          <p className="kpi-value">{metrics.totalReviews}</p>
          <p className="card-subtitle">+{metrics.newReviews} in period</p>
        </div>

        <div className="card">
          <div className="card-title">
            <WarningCircle size={16} /> Unanswered
          </div>
          <p className={`kpi-value ${metrics.unansweredReviews > 0 ? "kpi-value--red" : ""}`}>
            {metrics.unansweredReviews}
          </p>
          <p className="card-subtitle">reviews needing attention</p>
        </div>

        <div className="card">
          <div className="card-title">
            <Checks size={16} /> Response Rate
          </div>
          <p className="kpi-value">
            {(((metrics.totalReviews - metrics.unansweredReviews) / metrics.totalReviews) * 100).toFixed(0)}%
          </p>
          <p className="card-subtitle">goal: 100%</p>
        </div>
      </div>

      {/* ── Chart ─────────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <p className="card-title">Rating Trend (14 Days)</p>
        </div>
        <ReviewRatingTrendChart data={metrics.trend} />
      </div>

      {/* ── Recent Reviews Table ───────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="card-header" style={{ padding: "20px 24px 16px", marginBottom: 0 }}>
          <p className="card-title" style={{ margin: 0 }}>Recent Feedback</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ padding: "0 24px 12px", textAlign: "left" }}>Reviewer</th>
                <th style={{ textAlign: "center", padding: "0 12px 12px" }}>Rating</th>
                <th style={{ padding: "0 12px 12px", width: "40%", textAlign: "left" }}>Comment</th>
                <th style={{ textAlign: "center", padding: "0 12px 12px" }}>Status</th>
                <th style={{ textAlign: "right", padding: "0 24px 12px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentReviews.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: "12px 24px" }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{r.author}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      {r.source === "google" && <GoogleLogo size={12} weight="bold" color="#4285F4" />}
                      {r.source === "facebook" && <FacebookLogo size={12} weight="bold" color="#1877F2" />}
                      <span className="text-muted" style={{ fontSize: 11, textTransform: "capitalize" }}>{r.source}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "center", padding: "12px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, fontWeight: 600, color: "var(--accent-yellow)" }}>
                      {r.rating}<Star size={12} weight="fill" />
                    </div>
                  </td>
                  <td style={{ padding: "12px 12px", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    {r.text}
                  </td>
                  <td style={{ textAlign: "center", padding: "12px 12px" }}>
                    {r.answered ? (
                      <span className="badge positive">Answered</span>
                    ) : (
                      <span className="badge negative">Pending</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right", padding: "12px 24px", color: "var(--text-muted)", fontSize: 12 }}>
                    {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
