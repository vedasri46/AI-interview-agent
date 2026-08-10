import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  VERDICT_HEX,
  type SummaryAnalytics,
} from "@/lib/summary-analytics";

const axis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
};

const tooltipStyle = {
  background: "var(--color-surface-raised)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--color-foreground)",
};

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-raised/40 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">{title}</h3>
      <div className="mt-3 h-56 w-full min-w-0">{children}</div>
    </div>
  );
}

export function SummaryCharts({ analytics }: { analytics: SummaryAnalytics }) {
  const { breakdown, questions, topics, scores } = analytics;

  return (
    <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-2">
      {breakdown.length > 0 && (
        <Panel title="Performance breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdown}
                dataKey="value"
                nameKey="label"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={3}
                stroke="none"
              >
                {breakdown.map((d) => (
                  <Cell key={d.key} fill={VERDICT_HEX[d.key]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} answers`, ""]} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 11, color: "var(--color-muted-foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {scores && (
        <Panel title="Score profile">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={[
                { metric: "Technical", value: scores.technical },
                { metric: "Communication", value: scores.communication },
                { metric: "Confidence", value: scores.confidence },
                { metric: "Problem solving", value: scores.problemSolving },
                { metric: "Overall", value: scores.overall },
              ]}
            >
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="metric" tick={{ ...axis, fill: axis.stroke }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                dataKey="value"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.3}
              />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {questions.length > 0 && (
        <Panel title="Question performance">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={questions.map((q) => ({
                name: q.day ? `Q${q.n} · D${q.day}` : `Q${q.n}`,
                score: q.score,
                verdict: q.verdict,
              }))}
              margin={{ top: 4, right: 8, bottom: 4, left: -18 }}
            >
              <XAxis dataKey="name" tick={{ ...axis, fill: axis.stroke }} interval={0} angle={-30} textAnchor="end" height={48} />
              <YAxis domain={[0, 100]} tick={{ ...axis, fill: axis.stroke }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-accent)", opacity: 0.2 }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {questions.map((q) => (
                  <Cell key={q.n} fill={VERDICT_HEX[q.verdict]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {topics.length > 0 && (
        <Panel title="Topic performance">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topics}
              margin={{ top: 4, right: 12, bottom: 4, left: 8 }}
            >
              <XAxis type="number" domain={[0, 100]} tick={{ ...axis, fill: axis.stroke }} />
              <YAxis
                type="category"
                dataKey="topic"
                width={110}
                tick={{ ...axis, fill: axis.stroke }}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-accent)", opacity: 0.2 }} />
              <Bar dataKey="score" fill="var(--color-primary)" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}
    </div>
  );
}