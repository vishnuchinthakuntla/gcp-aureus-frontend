import React, { useEffect, useMemo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "./Observability.css";
import { toast } from 'react-hot-toast';

const formatUSD = (value) => {
  if (value == null || Number.isNaN(value)) return "-$";
  return `$${Number(value).toFixed(6)}`;
};

const TIME_RANGE_OPTIONS = [
  { label: "Last 5 min", value: "5min" },
  { label: "Last 30 min", value: "30min" },
  { label: "Last 1 hour", value: "1hour" },
  { label: "Last 3 hours", value: "3hours" },
  { label: "Last 1 day", value: "1day" },
  { label: "Last 7 days", value: "7days" },
  { label: "Last 30 days", value: "30days" },
  { label: "Last 90 days", value: "90days" },
  { label: "Last 1 year", value: "1year" },
  { label: "Custom", value: "custom" },
];

const MODEL_FILTER_OPTIONS = [
  { label: "All models", value: "" },
  { label: "Gemini", value: "gemini" },
  { label: "Azure OpenAI", value: "gpt-4o" },
  { label: "Others", value: "others" },
];

const sampleObservabilityData = {
  traces_card: {
    total_traces: 17,
    traces_breakdown: [
      { agent: "observer", count: 4 },
      { agent: "rca", count: 4 },
      { agent: "decision", count: 4 },
      { agent: "ticket_agent", count: 4 },
      { agent: "data_quality", count: 1 },
    ],
  },
  model_costs_card: {
    total_cost_usd: 0.009293,
    total_tokens: 10839,
    total_llm_calls: 7,
    model_breakdown: [
      { model: "gemini-2.0-flash", calls: 4, tokens: 2333, cost_usd: 0.000364 },
      { model: "gpt-4o-mini-prod", calls: 3, tokens: 8506, cost_usd: 0.008929 },
    ],
  },
  traces_by_time: {
    total_traces: 7,
    time_series: [
      { timestamp: "07:00 - 11:00", count: 0 },
      { timestamp: "11:00 - 15:00", count: 0 },
      { timestamp: "15:00 - 19:00", count: 0 },
      { timestamp: "19:00 - 23:00", count: 0 },
      { timestamp: "23:00 - 03:00", count: 0 },
      { timestamp: "03:00 - 07:00", count: 7 },
    ],
    interval: "4hour",
  },
  model_usage: {
    total_cost_usd: 0.009293,
    time_series: [
      { timestamp: "07:00 - 11:00", cost: 0 },
      { timestamp: "11:00 - 15:00", cost: 0 },
      { timestamp: "15:00 - 19:00", cost: 0 },
      { timestamp: "19:00 - 23:00", cost: 0 },
      { timestamp: "23:00 - 03:00", cost: 0 },
      { timestamp: "03:00 - 07:00", cost: 0.009293 },
    ],
    model_filter: "all_models",
    interval: "4hour",
  },
  metadata: {
    time_range: "1day",
    start_date: "2026-06-03T07:01:44.249835",
    end_date: "2026-06-04T07:01:44.249835",
    total_llm_calls: 7,
  },
};

const Observability = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);
  const [timeRange, setTimeRange] = useState("1day");
  const [modelFilter, setModelFilter] = useState("");
  const [customModelFilter, setCustomModelFilter] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const formatDateForBackend = (value, isEnd = false) => {
    if (!value) return "";
    const suffix = isEnd ? "23:59:59" : "00:00:00";
    return `${value} ${suffix}`;
  };

  const buildObservabilityUrl = () => {
    const params = new URLSearchParams();
    params.append("time_range", timeRange);
    if (modelFilter === "others") {
      if (customModelFilter.trim()) {
        params.append("model_filter", customModelFilter.trim());
      }
    } else if (modelFilter) {
      params.append("model_filter", modelFilter);
    }
    if (timeRange === "custom") {
      if (customStartDate) params.append("start_date", formatDateForBackend(customStartDate, false));
      if (customEndDate) params.append("end_date", formatDateForBackend(customEndDate, true));
    }
    return `/api/llm/usage?${params.toString()}`;
  };


  const fetchObservability = async () => {
    setLoading(true);
    setError(null);
    setIsFallback(false);

    if (timeRange === "custom" && (!customStartDate || !customEndDate)) {
      setError("Please select both start and end dates for a custom time range.");
      setLoading(false);
      return;
    }
    if (modelFilter === "others" && !customModelFilter.trim()) {
      setError("Please enter a custom model name when Others is selected.");
      setLoading(false);
      return;
    }

    const url = buildObservabilityUrl();
    console.log("[Observability] Fetching URL:", url);

    try {
      const response = await fetch(url);
      console.log("[Observability] Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("[Observability] Error response:", errorText);

        if (response.status === 404) {
          console.log("[Observability] Endpoint not found, using fallback data");
          setData(sampleObservabilityData);
          setIsFallback(true);
          setLoading(false);
          return;
        }
        throw new Error(`Failed to load observability data (${response.status}): ${errorText}`);
      }

      const payload = await response.json();
      console.log("[Observability] Success, received data:", payload);
      setData(payload);

      // If backend indicates the selected model filter is invalid, notify user and show all models
      if (payload?.metadata && payload.metadata.model_filter_bool === false) {
        toast("You selected wrong models; showing All models instead.", { icon: '⚠️' });
        setModelFilter("");
      }

    } catch (err) {
      console.error("[Observability] Error:", err);
      setError(err.message || "Unable to load observability data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservability();
  }, []);

  const tracesByTimeCategories = data?.traces_by_time?.time_series?.map((item) => item.timestamp) || [];
  const tracesByTimeSeries = data?.traces_by_time?.time_series?.map((item) => item.count) || [];
  const modelUsageCategories = data?.model_usage?.time_series?.map((item) => item.timestamp) || [];
  const modelUsageSeries = data?.model_usage?.time_series?.map((item) => item.cost) || [];

  const tracesChartOptions = useMemo(() => ({
    chart: { type: "column", backgroundColor: "transparent", borderRadius: 12 },
    title: { text: "" },
    xAxis: { categories: tracesByTimeCategories, title: { text: "Time range" }, labels: { style: { color: "#64748B" } } },
    yAxis: { title: { text: "Trace count" }, min: 0, labels: { style: { color: "#64748B" } } },
    series: [{ name: "Traces", data: tracesByTimeSeries, color: "#2563eb" }],
    credits: { enabled: false },
    legend: { enabled: false },
    plotOptions: { column: { borderRadius: 6, pointPadding: 0.2, groupPadding: 0.12 } },
  }), [tracesByTimeCategories, tracesByTimeSeries]);

  const usageChartOptions = useMemo(() => ({
    chart: { type: "areaspline", backgroundColor: "transparent", borderRadius: 12 },
    title: { text: "" },
    xAxis: { categories: modelUsageCategories, title: { text: "Time range" }, labels: { style: { color: "#64748B" } } },
    yAxis: { title: { text: "USD" }, min: 0, labels: { formatter() { return `$${this.value}`; }, style: { color: "#64748B" } } },
    series: [{ name: "Cost", data: modelUsageSeries, color: "#0c58b7", fillOpacity: 0.15 }],
    credits: { enabled: false },
    legend: { enabled: false },
    plotOptions: { areaspline: { lineWidth: 3, marker: { enabled: false } } },
  }), [modelUsageCategories, modelUsageSeries]);

  return (
    <div className="observability-page">
      <div className="pages-header">
        <h1 className="pages-title">Observability</h1>
        <p className="pages-description">
          Monitor pipeline traces, model costs, and usage trends from backend observability data.
        </p>
      </div>

      <div className="obs-filters">
        <div className="obs-filter">
          <label htmlFor="timeRange">Time range</label>
          <select id="timeRange" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            {TIME_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="obs-filter">
          <label htmlFor="modelFilter">Model filter</label>
          <select
            id="modelFilter"
            value={modelFilter}
            onChange={(e) => {
              setModelFilter(e.target.value);
              if (e.target.value !== "others") {
                setCustomModelFilter("");
              }
            }}
          >
            {MODEL_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {modelFilter === "others" && (
          <div className="obs-filter">
            <label htmlFor="customModelFilter">Custom model</label>
            <input
              id="customModelFilter"
              type="text"
              placeholder="Enter model name"
              value={customModelFilter}
              onChange={(e) => setCustomModelFilter(e.target.value)}
            />
          </div>
        )}

        {timeRange === "custom" && (
          <>
            <div className="obs-filter">
              <label htmlFor="customStartDate">Start date</label>
              <input
                id="customStartDate"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>
            <div className="obs-filter">
              <label htmlFor="customEndDate">End date</label>
              <input
                id="customEndDate"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </>
        )}

        <button className="obs-filter-apply" onClick={fetchObservability}>Apply</button>
      </div>

      {loading ? (
        <div className="obs-status obs-loading">Loading observability metrics…</div>
      ) : error ? (
        <div className="obs-status obs-error">{error}</div>
      ) : (
        <>
          {isFallback && (
            <div className="obs-status obs-warning">
              Backend endpoint <strong>/api/llm/usage</strong> returned 404.
              Showing mock observability data until the backend route is available.
            </div>
          )}
          <div className="obs-summary-grid">
            <div className="obs-summary-card">
              <span className="obs-summary-label">Total Traces</span>
              <strong>{data?.traces_card?.total_traces ?? 0}</strong>
            </div>
            <div className="obs-summary-card">
              <span className="obs-summary-label">Total Cost</span>
              <strong>{formatUSD(data?.model_costs_card?.total_cost_usd)}</strong>
              <span>{data?.model_costs_card?.total_llm_calls ?? 0} llm calls</span>
            </div>
            <div className="obs-summary-card">
              <span className="obs-summary-label">Total Tokens</span>
              <strong>{data?.model_costs_card?.total_tokens ?? 0}</strong>
            </div>
          </div>

          <div className="obs-cards-row">
            <section className="obs-card obs-card--breakdown">
              <div className="obs-card-header">
                <div>
                  <h2>Traces Breakdown</h2>
                  <p>{data?.traces_card?.total_traces ?? 0} traces across agents</p>
                </div>
              </div>
              <div className="obs-breakdown-list">
                {data?.traces_card?.traces_breakdown?.length > 0 ? (
                  data?.traces_card?.traces_breakdown?.map((item) => (
                    <div key={item.agent} className="obs-breakdown-item">
                      <span className="obs-breakdown-agent">{item.agent}</span>
                      <span className="obs-breakdown-count">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="obs-empty-message">No traces breakdown available</div>
                )}
              </div>
            </section>

            <section className="obs-card obs-card--models">
              <div className="obs-card-header">
                <div>
                  <h2>Model Cost Breakdown</h2>
                  <p>{data?.model_costs_card?.model_breakdown?.length ?? 0} models</p>
                </div>
              </div>
              <div className="obs-model-table">
                {data?.model_costs_card?.model_breakdown?.length > 0 ? (
                  <>
                    <div className="obs-model-row obs-model-row--head">
                      <span>Model</span>
                      <span>Calls</span>
                      <span>Tokens</span>
                      <span>Cost</span>
                    </div>
                    {data?.model_costs_card?.model_breakdown?.map((item) => (
                      <div key={item.model} className="obs-model-row">
                        <span>{item.model}</span>
                        <span>{item.calls}</span>
                        <span>{item.tokens}</span>
                        <span>{formatUSD(item.cost_usd)}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="obs-model-empty">No model breakdown data available</div>
                )}
              </div>
            </section>
          </div>

          <div className="obs-charts-grid">
            <div className="obs-chart-card">
              <div className="obs-chart-card-header">
                <h3>Traces by Time</h3>
              </div>
              <HighchartsReact highcharts={Highcharts} options={tracesChartOptions} />
            </div>
            <div className="obs-chart-card">
              <div className="obs-chart-card-header">
                <h3>Model Usage</h3>
              </div>
              <HighchartsReact highcharts={Highcharts} options={usageChartOptions} />
            </div>
          </div>

          <div className="obs-metadata-panel">
            <h3>Metadata</h3>
            <div className="obs-metadata-grid">
              <div>
                <span>Time range</span>
                <strong>{data?.metadata?.time_range ?? "-"}</strong>
              </div>
              <div>
                <span>Start date</span>
                <strong>{data?.metadata?.start_date ?? "-"}</strong>
              </div>
              <div>
                <span>End date</span>
                <strong>{data?.metadata?.end_date ?? "-"}</strong>
              </div>
              <div>
                <span>Total LLM calls</span>
                <strong>{data?.metadata?.total_llm_calls ?? 0}</strong>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Observability;
