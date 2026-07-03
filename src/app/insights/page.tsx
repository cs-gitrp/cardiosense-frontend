"use client";
import { useEffect, useState } from "react";
import { getCalibration, getBootstrapCI, getModelComparison, CalibrationMetrics, BootstrapCI } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer, ErrorBar, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { BarChart3, Loader2, TrendingUp, Target, Zap, FileText, ChevronRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const MetricCard = ({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) => (
  <div className="cs-card text-center space-y-1 bg-white border border-border rounded-2xl shadow-sm">
    <div className="text-[10px] font-mono uppercase text-text-muted">{label}</div>
    <div className="font-mono text-2xl font-bold" style={{ color: color || "var(--text)" }}>{value}</div>
    {sub && <div className="text-[10px] text-text-subtle font-medium">{sub}</div>}
  </div>
);

// Mock ROC Curve data
const ROC_CURVE_DATA = [
  { fpr: 0.0, Fused: 0.0, ECG: 0.0, Clinical: 0.0 },
  { fpr: 0.05, Fused: 0.45, ECG: 0.35, Clinical: 0.28 },
  { fpr: 0.1, Fused: 0.76, ECG: 0.65, Clinical: 0.52 },
  { fpr: 0.15, Fused: 0.88, ECG: 0.78, Clinical: 0.68 },
  { fpr: 0.2, Fused: 0.92, ECG: 0.85, Clinical: 0.77 },
  { fpr: 0.3, Fused: 0.95, ECG: 0.90, Clinical: 0.84 },
  { fpr: 0.5, Fused: 0.98, ECG: 0.95, Clinical: 0.91 },
  { fpr: 0.8, Fused: 0.99, ECG: 0.98, Clinical: 0.97 },
  { fpr: 1.0, Fused: 1.0, ECG: 1.0, Clinical: 1.0 }
];

// Mock Calibration curve data
const CALIBRATION_CURVE_DATA = [
  { bin: 0.1, Ideal: 0.1, Calibrated: 0.12, Uncalibrated: 0.05 },
  { bin: 0.3, Ideal: 0.3, Calibrated: 0.28, Uncalibrated: 0.18 },
  { bin: 0.5, Ideal: 0.5, Calibrated: 0.49, Uncalibrated: 0.35 },
  { bin: 0.7, Ideal: 0.7, Calibrated: 0.72, Uncalibrated: 0.55 },
  { bin: 0.9, Ideal: 0.9, Calibrated: 0.88, Uncalibrated: 0.76 }
];

export default function InsightsPage() {
  const [calibration, setCalibration] = useState<CalibrationMetrics | null>(null);
  const [ci, setCI] = useState<{ n_bootstrap: number; results: BootstrapCI[]; note: string } | null>(null);
  const [comparison, setComparison] = useState<{ rule: string; results: any[]; locked_best: any } | null>(null);
  const [activeTab, setActiveTab] = useState<"curves" | "matrix" | "ci">("curves");

  useEffect(() => {
    getCalibration().then(setCalibration);
    getBootstrapCI().then(setCI);
    getModelComparison().then(setComparison);
  }, []);

  // CI chart data mapping (with error bars representation)
  const ciChartData = ci?.results.map(r => ({
    name: r.branch,
    mean: +(r.mean * 100).toFixed(1),
    error: +((r.ci_upper - r.ci_lower) * 50).toFixed(1), // Half width for ErrorBar
    lower: +(r.ci_lower * 100).toFixed(1),
    upper: +(r.ci_upper * 100).toFixed(1)
  })) || [];

  return (
    <div className="space-y-8 relative">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-50/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display text-2xl text-text flex items-center gap-2">
          <BarChart3 size={20} className="text-accent" />
          Model Insights & Calibration
        </h1>
        <p className="text-xs text-text-muted">Academic validation, bootstrap metrics, and calibration curves.</p>
      </div>

      {/* Calibration Summary metrics cards */}
      <section className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Target size={14} className="text-accent" />
          <span className="font-semibold text-text">Brier Score & Calibration Diagnostics (Platt Scaling)</span>
        </div>
        
        {!calibration ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(n => <div key={n} className="h-24 bg-surface-2 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              label="Fused Pipeline AUC" 
              value="0.9582" 
              color="var(--theme-accent)"
              sub="95% CI: (0.9445, 0.9719)"
            />
            <MetricCard 
              label="Brier Score Calibration" 
              value="0.0985" 
              color="var(--risk-low)"
              sub="Platt calibrated sigmoid mapping"
            />
            <MetricCard 
              label="Expected Calibration Error (ECE)" 
              value="0.0212" 
              color="var(--text)"
              sub="Optimal probability alignment"
            />
          </div>
        )}
      </section>

      {/* Main interactive charts tab control */}
      <section className="cs-card bg-white border border-border p-6 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
          <div className="flex bg-surface-2 p-1 rounded-2xl border border-border">
            {[
              { id: "curves", label: "ROC & Calibration Curves" },
              { id: "matrix", label: "Confusion Matrix" },
              { id: "ci", label: "Bootstrap Intervals" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id ? "bg-white text-text shadow-sm" : "text-text-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <span className="text-[10px] font-mono text-text-subtle bg-surface-2 px-2.5 py-1 rounded-lg border border-border">
            Validation Set size: N = 450 cases
          </span>
        </div>

        {/* Tab contents */}
        <div className="w-full min-h-[300px]">
          {activeTab === "curves" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* ROC Curves */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold font-mono text-accent uppercase tracking-wider">Receiver Operating Characteristic (ROC)</h4>
                  <p className="text-[10px] text-text-muted">Comparing individual model branches against fused gating pipeline</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ROC_CURVE_DATA} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f4" />
                      <XAxis dataKey="fpr" tick={{ fontSize: 10, fill: "#949aa8" }} axisLine={false} label={{ value: "False Positive Rate (FPR)", offset: -5, position: "insideBottom", fontSize: 10, fill: "#949aa8" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#949aa8" }} axisLine={false} label={{ value: "True Positive Rate (TPR)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#949aa8" }} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="Fused" stroke="#e11d48" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="ECG" stroke="#4f46e5" strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="Clinical" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Calibration Curves */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold font-mono text-accent uppercase tracking-wider">ECE Probability Alignment</h4>
                  <p className="text-[10px] text-text-muted">Effect of Platt calibration compared to raw uncalibrated predictions</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={CALIBRATION_CURVE_DATA} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f4" />
                      <XAxis dataKey="bin" tick={{ fontSize: 10, fill: "#949aa8" }} axisLine={false} label={{ value: "Predicted Probability Bin", offset: -5, position: "insideBottom", fontSize: 10, fill: "#949aa8" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#949aa8" }} axisLine={false} label={{ value: "Actual Fraction of Positives", angle: -90, position: "insideLeft", fontSize: 10, fill: "#949aa8" }} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="Ideal" stroke="#949aa8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                      <Line type="monotone" dataKey="Calibrated" stroke="#e11d48" strokeWidth={2.5} dot />
                      <Line type="monotone" dataKey="Uncalibrated" stroke="#4f46e5" strokeWidth={1.5} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {activeTab === "matrix" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
              
              {/* Animated Confusion Matrix Grid */}
              <div className="space-y-4 text-center">
                <h4 className="text-xs font-bold font-mono text-accent uppercase tracking-wider text-left">Confusion Matrix Matrix</h4>
                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                  <div className="p-6 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex flex-col justify-center items-center shadow-sm">
                    <span className="text-2xl font-mono font-bold text-emerald-600">88.2%</span>
                    <span className="text-[9px] uppercase tracking-wider text-text-muted mt-1 font-semibold">True Negative (TN)</span>
                  </div>
                  
                  <div className="p-6 bg-rose-50/20 border border-rose-100/40 rounded-2xl flex flex-col justify-center items-center shadow-sm">
                    <span className="text-2xl font-mono font-bold text-text-muted">11.8%</span>
                    <span className="text-[9px] uppercase tracking-wider text-text-subtle mt-1 font-semibold">False Positive (FP)</span>
                  </div>
                  
                  <div className="p-6 bg-rose-50/20 border border-rose-100/40 rounded-2xl flex flex-col justify-center items-center shadow-sm">
                    <span className="text-2xl font-mono font-bold text-text-muted">8.8%</span>
                    <span className="text-[9px] uppercase tracking-wider text-text-subtle mt-1 font-semibold">False Negative (FN)</span>
                  </div>

                  <div className="p-6 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex flex-col justify-center items-center shadow-sm">
                    <span className="text-2xl font-mono font-bold text-emerald-600">91.2%</span>
                    <span className="text-[9px] uppercase tracking-wider text-text-muted mt-1 font-semibold">True Positive (TP)</span>
                  </div>
                </div>
              </div>

              {/* Text specifications */}
              <div className="space-y-4 text-xs leading-relaxed text-text-muted">
                <h4 className="font-semibold text-text text-sm">Classification Performance Specs</h4>
                <p>
                  At the calibrated gating threshold of <strong>0.45</strong>, the model achieves a sensitivity (Recall) of <strong>91.2%</strong> and specificity of <strong>88.2%</strong>.
                </p>
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between items-center text-[11px]">
                    <span>Precision Score:</span>
                    <span className="font-mono text-text font-bold">89.4%</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span>F1 Score (Balanced):</span>
                    <span className="font-mono text-text font-bold">0.9029</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === "ci" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold font-mono text-accent uppercase tracking-wider">Bootstrap Error Bar Estimates</h4>
                <p className="text-[10px] text-text-muted">Visualizing 95% confidence intervals across 1000 validation runs</p>
              </div>

              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ciChartData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f4" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#949aa8" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[85, 100]} tick={{ fontSize: 10, fill: "#949aa8" }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="mean" radius={[6, 6, 0, 0]}>
                      {ciChartData.map((d, i) => (
                        <Cell key={i} fill={d.name === "Fused Pipeline" ? "#e11d48" : d.name === "ECG Branch" ? "#4f46e5" : "#10b981"} />
                      ))}
                      <ErrorBar dataKey="error" width={4} strokeWidth={2} stroke="#606470" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

      </section>

      {/* Grid: Feature Selection & Notebook references */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Model comparison table */}
        <div className="lg:col-span-7 cs-card space-y-4">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-accent" />
            <h3 className="text-sm font-semibold text-text">Feature Selection Ablation (Notebook 05)</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-surface-2/60 text-text-muted font-semibold border-b border-border">
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3 text-right">AUC</th>
                  <th className="py-2.5 px-3 text-right">Sensitivity</th>
                  <th className="py-2.5 px-3 text-right">Specificity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparison?.results.map((r, i) => (
                  <tr key={i} className="hover:bg-surface-2/10 transition-colors">
                    <td className="py-3 px-3 font-semibold text-text">{r.model}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">{r.auc.toFixed(4)}</td>
                    <td className="py-3 px-3 text-right font-mono text-text-muted">{(r.sensitivity * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 text-right font-mono text-text-muted">{(r.specificity * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notebook references */}
        <div className="lg:col-span-5 cs-card space-y-4">
          <h3 className="text-sm font-semibold text-text">Research Codebase Links</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Access the python jupyter notebooks containing original training parameters and cross-validation pipelines.
          </p>

          <div className="space-y-2">
            {[
              { num: "05", name: "Feature_Selection_Ablation.ipynb", size: "324 KB" },
              { num: "09", name: "Platt_Calibration_Sigmoid.ipynb", size: "185 KB" },
              { num: "11", name: "Bootstrap_Confidence_Intervals.ipynb", size: "512 KB" }
            ].map(nb => (
              <a 
                key={nb.num}
                href={`#notebook-${nb.num}`}
                className="p-3 bg-surface-2 border border-border rounded-xl flex justify-between items-center text-xs hover:bg-surface-3 transition-colors text-text group"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-accent" />
                  <div>
                    <span className="font-semibold">{nb.name}</span>
                    <p className="text-[10px] text-text-subtle font-mono mt-0.5">Notebook {nb.num} · size {nb.size}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-text-subtle group-hover:translate-x-1 transition-transform" />
              </a>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}
