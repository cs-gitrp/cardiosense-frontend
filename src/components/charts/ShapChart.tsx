"use client";
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  features: Array<{ feature: string; shap_value: number }>;
}

const FEATURE_LABELS: Record<string, string> = {
  cp: "Chest Pain Type", exang: "Exercise Angina", ca: "Fluoroscopy Vessels",
  sex: "Sex", chol_missing: "Cholesterol Missing", slope_missing: "Slope Missing",
  thal: "Thalassemia", thalach: "Max Heart Rate", age: "Age",
  oldpeak: "ST Depression", fbs: "Fasting Blood Sugar",
};

export default function ShapChart({ features }: Props) {
  const data = features
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .map(f => ({
      name: FEATURE_LABELS[f.feature] || f.feature,
      value: f.shap_value,
      abs: Math.abs(f.shap_value),
    }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-sm font-semibold text-text">
            Clinical Feature Attribution (SHAP)
          </h3>
          <p className="text-[11px] text-text-muted">Features contributing to model prognostic output</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted">
          <span className="flex items-center gap-1">
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "#f43f5e", display: "inline-block" }} />
            Risk ↑
          </span>
          <span className="flex items-center gap-1">
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "#10b981", display: "inline-block" }} />
            Risk ↓
          </span>
        </div>
      </div>

      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 10, fill: "#949aa8", fontFamily: "var(--font-mono)" }}
              axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={130}
              tick={{ fontSize: 10, fill: "#606470" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #eaebee", borderRadius: 12, fontSize: 11, color: "var(--text)" }}
              labelStyle={{ color: "var(--text)", fontWeight: 600 }}
              formatter={(v: any) => [Number(v).toFixed(4), "SHAP value"]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.value > 0 ? "#f43f5e" : "#10b981"} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
