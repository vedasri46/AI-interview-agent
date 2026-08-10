import { jsPDF } from "jspdf";

import {
  VERDICT_HEX,
  type FeedbackShape,
  type SummaryAnalytics,
} from "./summary-analytics";

const INK = "#132033";
const MUTED = "#5b6b80";
const MINT = "#1f9d76";
const LINE = "#d8e0e8";

type Meta = { name?: string | undefined; role?: string | undefined; sessionId?: string | undefined };

export function downloadSummaryPdf(
  feedback: FeedbackShape,
  analytics: SummaryAnalytics,
  meta: Meta,
) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = 0;

  const ensure = (needed: number) => {
    if (y + needed > H - 48) {
      doc.addPage();
      y = 56;
    }
  };

  // ---- Header -------------------------------------------------------------
  doc.setFillColor(INK);
  doc.rect(0, 0, W, 96, "F");
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold").setFontSize(20);
  doc.text("Interview Summary Report", M, 44);
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.setTextColor("#b8c6d6");
  doc.text("Nova — AI Cohort Interview Agent", M, 64);
  doc.text(new Date().toLocaleString(), W - M, 64, { align: "right" });
  y = 128;

  // ---- Interview details ---------------------------------------------------
  doc.setTextColor(INK).setFont("helvetica", "bold").setFontSize(12);
  doc.text("Interview details", M, y);
  y += 16;
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(MUTED);
  const details = [
    ["Candidate", meta.name ?? "—"],
    ["Target role", meta.role ?? "—"],
    ["Session", meta.sessionId ? meta.sessionId.slice(0, 8) : "—"],
    ["Questions answered", String(analytics.questions.length || "—")],
  ];
  for (const [k, v] of details) {
    doc.setTextColor(MUTED).text(`${k}`, M, y);
    doc.setTextColor(INK).text(String(v), M + 130, y);
    y += 15;
  }
  y += 10;

  // ---- Scores --------------------------------------------------------------
  if (analytics.scores) {
    const s = analytics.scores;
    const cards: [string, number][] = [
      ["Overall", s.overall],
      ["Technical", s.technical],
      ["Communication", s.communication],
      ["Confidence", s.confidence],
      ["Problem solving", s.problemSolving],
    ];
    ensure(80);
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(INK);
    doc.text("Performance summary", M, y);
    y += 14;
    const cw = (W - M * 2 - 8 * (cards.length - 1)) / cards.length;
    cards.forEach(([label, value], i) => {
      const x = M + i * (cw + 8);
      doc.setDrawColor(LINE).setFillColor("#f4f7fa");
      doc.roundedRect(x, y, cw, 54, 8, 8, "FD");
      doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(MINT);
      doc.text(`${value}`, x + cw / 2, y + 27, { align: "center" });
      doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(MUTED);
      doc.text(label.toUpperCase(), x + cw / 2, y + 42, { align: "center" });
    });
    y += 74;
  }

  // ---- Donut: performance breakdown ---------------------------------------
  if (analytics.breakdown.length) {
    ensure(190);
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(INK);
    doc.text("Performance breakdown", M, y);
    y += 12;
    const cx = M + 80;
    const cy = y + 78;
    drawDonut(doc, cx, cy, 66, 36, analytics.breakdown.map((d) => ({ value: d.value, color: VERDICT_HEX[d.key] })));
    const total = analytics.breakdown.reduce((a, d) => a + d.value, 0);
    let ly = y + 44;
    analytics.breakdown.forEach((d) => {
      doc.setFillColor(VERDICT_HEX[d.key]);
      doc.circle(cx + 110, ly - 3, 4, "F");
      doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(INK);
      doc.text(
        `${d.label} — ${d.value} (${Math.round((d.value / total) * 100)}%)`,
        cx + 122,
        ly,
      );
      ly += 18;
    });
    y = cy + 90;
  }

  // ---- Question performance -----------------------------------------------
  if (analytics.questions.length) {
    ensure(200);
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(INK);
    doc.text("Question performance", M, y);
    y += 12;
    drawColumns(
      doc,
      M,
      y,
      W - M * 2,
      140,
      analytics.questions.map((q) => ({
        label: q.day ? `Q${q.n}\nD${q.day}` : `Q${q.n}`,
        value: q.score,
        color: VERDICT_HEX[q.verdict],
      })),
    );
    y += 170;
  }

  // ---- Topic performance ---------------------------------------------------
  if (analytics.topics.length) {
    const h = analytics.topics.length * 22 + 20;
    ensure(h + 30);
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(INK);
    doc.text("Topic / skill performance", M, y);
    y += 18;
    analytics.topics.forEach((t) => {
      doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(MUTED);
      doc.text(truncate(doc, t.topic, 130), M, y + 8);
      const barX = M + 140;
      const barW = W - M - 40 - barX;
      doc.setFillColor("#e8eef4");
      doc.roundedRect(barX, y, barW, 10, 5, 5, "F");
      doc.setFillColor(MINT);
      doc.roundedRect(barX, y, Math.max(4, (barW * t.score) / 100), 10, 5, 5, "F");
      doc.setTextColor(INK).setFontSize(9);
      doc.text(`${t.score}`, W - M, y + 8, { align: "right" });
      y += 22;
    });
    y += 12;
  }

  // ---- Narrative sections ---------------------------------------------------
  section(doc, "Summary", [feedback.summary], () => y, (v) => (y = v), M, W, ensure);
  section(doc, "Strengths", feedback.strengths, () => y, (v) => (y = v), M, W, ensure, true);
  section(doc, "Gaps", feedback.gaps, () => y, (v) => (y = v), M, W, ensure, true);
  section(doc, "Recommended next steps", feedback.next, () => y, (v) => (y = v), M, W, ensure, true);

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(MUTED);
    doc.text(`Page ${i} of ${total}`, W - M, H - 24, { align: "right" });
    doc.text("Generated by Nova — AI Cohort Interview Agent", M, H - 24);
  }

  const slug = (meta.name ?? "candidate").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  doc.save(`interview-summary-${slug}.pdf`);
}

function truncate(doc: jsPDF, text: string, maxWidth: number) {
  let t = text;
  while (doc.getTextWidth(t) > maxWidth && t.length > 3) t = t.slice(0, -2);
  return t === text ? t : `${t}…`;
}

function section(
  doc: jsPDF,
  title: string,
  items: string[],
  getY: () => number,
  setY: (v: number) => void,
  M: number,
  W: number,
  ensure: (n: number) => void,
  bullets = false,
) {
  const list = (items ?? []).filter(Boolean);
  if (!list.length) return;
  ensure(60);
  let y = getY();
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(INK);
  doc.text(title, M, y);
  y += 16;
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(MUTED);
  for (const item of list) {
    const lines = doc.splitTextToSize(item, W - M * 2 - (bullets ? 14 : 0)) as string[];
    setY(y);
    ensure(lines.length * 14 + 8);
    y = getY();
    if (bullets) {
      doc.setFillColor(MINT);
      doc.circle(M + 3, y - 3, 2, "F");
      doc.text(lines, M + 14, y);
    } else {
      doc.text(lines, M, y);
    }
    y += lines.length * 14 + 6;
  }
  setY(y + 8);
}

/** Donut rendered as polygon slices (jsPDF has no native arc fill). */
function drawDonut(
  doc: jsPDF,
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  slices: { value: number; color: string }[],
) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  let angle = -Math.PI / 2;
  for (const s of slices) {
    const sweep = (s.value / total) * Math.PI * 2;
    const steps = Math.max(2, Math.ceil((sweep / (Math.PI * 2)) * 72));
    doc.setFillColor(s.color);
    for (let i = 0; i < steps; i++) {
      const a0 = angle + (sweep * i) / steps;
      const a1 = angle + (sweep * (i + 1)) / steps;
      const pts: [number, number][] = [
        [cx + outer * Math.cos(a0), cy + outer * Math.sin(a0)],
        [cx + outer * Math.cos(a1), cy + outer * Math.sin(a1)],
        [cx + inner * Math.cos(a1), cy + inner * Math.sin(a1)],
        [cx + inner * Math.cos(a0), cy + inner * Math.sin(a0)],
      ];
      const rel = pts.slice(1).map(([x, y], i2) => [x - pts[i2]![0], y - pts[i2]![1]] as [number, number]);
      doc.lines(rel, pts[0]![0], pts[0]![1], [1, 1], "F", true);
    }
    angle += sweep;
  }
}

function drawColumns(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  bars: { label: string; value: number; color: string }[],
) {
  const plotH = h - 26;
  // gridlines
  doc.setDrawColor(LINE).setLineWidth(0.5);
  [0, 25, 50, 75, 100].forEach((g) => {
    const gy = y + plotH - (plotH * g) / 100;
    doc.line(x + 24, gy, x + w, gy);
    doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(MUTED);
    doc.text(String(g), x + 18, gy + 3, { align: "right" });
  });
  const slot = (w - 24) / bars.length;
  const bw = Math.min(30, slot * 0.6);
  bars.forEach((b, i) => {
    const bx = x + 24 + i * slot + (slot - bw) / 2;
    const bh = Math.max(2, (plotH * b.value) / 100);
    doc.setFillColor(b.color);
    doc.roundedRect(bx, y + plotH - bh, bw, bh, 3, 3, "F");
    doc.setFontSize(7).setTextColor(MUTED);
    b.label.split("\n").forEach((line, li) => {
      doc.text(line, bx + bw / 2, y + plotH + 10 + li * 8, { align: "center" });
    });
  });
}