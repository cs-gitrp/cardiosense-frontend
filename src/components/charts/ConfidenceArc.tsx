"use client";
import { useEffect, useRef } from "react";

interface Props {
  probability: number;        // 0–1
  prediction: "Disease" | "No Disease";
  severity: string | null;
  size?: number;
}

function riskColor(prob: number) {
  if (prob >= 0.7) return "#e11d48"; // Critical / Rose-600
  if (prob >= 0.45) return "#f59e0b"; // Moderate / Amber-500
  return "#10b981"; // Healthy / Emerald-500
}

export default function ConfidenceArc({ probability, prediction, severity, size = 220 }: Props) {
  const circleRef = useRef<SVGCircleElement>(null);

  const r = 84;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;   // ≈ 528
  const fillLength = circumference * probability;
  const dashOffset = circumference - fillLength;
  const color = riskColor(probability);

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    el.style.strokeDashoffset = String(circumference);
    requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.strokeDashoffset = String(dashOffset);
    });
  }, [probability, dashOffset, circumference]);

  return (
    <div className="flex flex-col items-center gap-4 relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Glow filter */}
        <defs>
          <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle cx={cx} cy={cy} r={r}
          fill="none" stroke="#eef0f2" strokeWidth="8"
          strokeDasharray={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />

        {/* Fill arc */}
        <circle ref={circleRef} cx={cx} cy={cy} r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          filter="url(#arc-glow)"
          style={{ transition: "none" }} />

        {/* Center text */}
        <text x={cx} y={cy - 12} textAnchor="middle"
          style={{ fontFamily: "var(--font-mono)", fontSize: "28px", fontWeight: 700, fill: "var(--text)" }}>
          {Math.round(probability * 100)}%
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle"
          style={{ fontFamily: "var(--font-body)", fontSize: "10px", fill: "var(--text-muted)", fontWeight: 500 }}>
          FUSED RISK
        </text>
        <text x={cx} y={cy + 28} textAnchor="middle"
          style={{ fontFamily: "var(--font-display)", fontSize: "14px", fill: color, fontWeight: 700 }}>
          {prediction === "Disease" ? (severity || "Abnormal") : "No Disease"}
        </text>
      </svg>
    </div>
  );
}
