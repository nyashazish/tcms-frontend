import { Clock } from "@phosphor-icons/react/dist/ssr";

interface Props {
  service: "google-ads" | "gbp" | "seo";
}

const LAG_TEXT = {
  "google-ads": "Data typically lags by ~3 hours",
  gbp: "Data typically lags by ~24 hours",
  seo: "Data typically lags by 2-3 days (Google Search Console)",
};

export function DataLagBanner({ service }: Props) {
  return (
    <div className="data-lag-banner">
      <Clock size={14} weight="fill" />
      <span>{LAG_TEXT[service]}</span>
    </div>
  );
}
