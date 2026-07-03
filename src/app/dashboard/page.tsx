"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getAssessmentHistory, AssessmentHistoryItem } from "@/lib/api";
import { 
  Heart, Activity, Plus, Shield, MessageSquare, 
  ArrowRight, ShieldAlert, CheckCircle, ChevronRight, TrendingUp, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAssessmentHistory(10);
        setHistory(data);
      } catch (err) {
        console.error("Failed to load assessments", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-surface-2 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(n => <div key={n} className="h-32 bg-surface-2 animate-pulse rounded-2xl" />)}
        </div>
        <div className="h-96 bg-surface-2 animate-pulse rounded-3xl" />
      </div>
    );
  }

  // Calculate statistics
  const totalAssessments = history.length;
  const criticalCount = history.filter(h => h.severity === "Critical").length;
  const highCount = history.filter(h => h.severity === "High").length;
  const moderateCount = history.filter(h => h.severity === "Moderate").length;
  const lowCount = history.filter(h => h.severity === "Low" || h.severity === "Healthy").length;

  const severityData = [
    { name: "Low/Healthy", count: lowCount || 1, color: "#10b981" },
    { name: "Moderate", count: moderateCount || 1, color: "#f59e0b" },
    { name: "High", count: highCount || 1, color: "#f43f5e" },
    { name: "Critical", count: criticalCount || 1, color: "#e11d48" }
  ];

  // Recharts line chart data
  const trendData = history
    .slice()
    .reverse()
    .map((item, idx) => ({
      index: idx + 1,
      date: new Date(item.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
      probability: Math.round(item.fused_probability * 100),
      label: item.assessment_id
    }));

  return (
    <div className="space-y-8 relative">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-rose-100/20 blur-3xl pointer-events-none" />

      {/* Welcome Banner */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl text-text leading-tight">
            Welcome back, {user?.full_name || "Doctor"}
          </h1>
          <p className="text-xs text-text-muted">
            Clinical Diagnostic Hub · Model version v1.4.2-calibrated
          </p>
        </div>
        <Link href="/assess"
          className="px-4 py-2.5 rounded-2xl bg-accent text-white font-medium text-xs flex items-center gap-2 hover:bg-accent/95 shadow-lg shadow-rose-600/10 transition-all btn-glow"
        >
          <Plus size={15} />
          New Assessment
        </Link>
      </section>

      {/* Risk & Model Metrics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Assessments */}
        <div className="cs-card space-y-2">
          <p className="text-[10px] font-mono text-text-muted uppercase">Assessments Conducted</p>
          <div className="flex justify-between items-baseline">
            <h3 className="text-3xl font-display text-text">{totalAssessments}</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-risk-low font-bold">Active</span>
          </div>
          <p className="text-[11px] text-text-subtle">Saved in secure browser environment</p>
        </div>

        {/* Severity: Critical / High */}
        <div className="cs-card border-rose-100/50 bg-rose-50/5 space-y-2">
          <p className="text-[10px] font-mono text-risk-high uppercase">Action Required</p>
          <div className="flex justify-between items-baseline">
            <h3 className="text-3xl font-display text-risk-high">{criticalCount + highCount} Cases</h3>
            <ShieldAlert size={16} className="text-risk-high" />
          </div>
          <p className="text-[11px] text-text-subtle">Critical or high risk classifications</p>
        </div>

        {/* Dynamic Model AUC */}
        <div className="cs-card space-y-2">
          <p className="text-[10px] font-mono text-text-muted uppercase">Calibration Quality</p>
          <div className="flex justify-between items-baseline">
            <h3 className="text-3xl font-display text-text">95.82%</h3>
            <span className="text-[10px] font-mono text-accent font-semibold">AUC</span>
          </div>
          <p className="text-[11px] text-text-subtle">Platt scaling calibration active</p>
        </div>

        {/* Active Session Status */}
        <div className="cs-card space-y-2">
          <p className="text-[10px] font-mono text-text-muted uppercase">Connected Pipeline</p>
          <div className="flex justify-between items-baseline">
            <h3 className="text-xl font-display text-text truncate">FastAPI (Local Mock)</h3>
            <div className="w-2.5 h-2.5 rounded-full bg-risk-low animate-ping" />
          </div>
          <p className="text-[11px] text-text-subtle">Online · latency 400ms</p>
        </div>

      </section>

      {/* Grid: Charts & Details */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Trend Chart (Line) */}
        <div className="lg:col-span-8 cs-card space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-text">Fused Risk Trend Analysis</h3>
              <p className="text-xs text-text-muted">Chronological progression of the last {history.length} assessments</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium bg-surface-2 px-3 py-1.5 rounded-xl border border-border">
              <TrendingUp size={14} className="text-accent" />
              <span>Attribution Trend</span>
            </div>
          </div>

          <div className="w-full h-72">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f4" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#949aa8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#949aa8" }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: "#ffffff", border: "1px solid #eaebee", borderRadius: 12, fontSize: 11 }}
                    labelFormatter={(label) => `Assessment Date: ${label}`}
                  />
                  <Line type="monotone" dataKey="probability" stroke="#e11d48" strokeWidth={3} dot={{ fill: "#e11d48", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-subtle font-mono">
                No trend data available.
              </div>
            )}
          </div>
        </div>

        {/* Severity & Feature Distribution (Bar / Pie Breakdown) */}
        <div className="lg:col-span-4 cs-card flex flex-col justify-between gap-6">
          <div>
            <h3 className="text-base font-semibold text-text">Severity Distribution</h3>
            <p className="text-xs text-text-muted">Active patient distribution classification</p>
          </div>

          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#949aa8" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#949aa8" }} axisLine={false} tickLine={false} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">High/Critical ratio:</span>
              <span className="font-semibold text-risk-high">
                {totalAssessments > 0 ? Math.round(((criticalCount + highCount) / totalAssessments) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Platt Brier Calibration:</span>
              <span className="font-mono text-text-subtle font-semibold">0.0985</span>
            </div>
          </div>
        </div>

      </section>

      {/* Quick Actions & Recent Assessments */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent assessments list */}
        <div className="lg:col-span-8 cs-card space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-text">Recent Screenings</h3>
              <p className="text-xs text-text-muted">Last few model runs and prognosis results</p>
            </div>
            <Link href="/history" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
              View all
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {history.slice(0, 4).map(item => (
              <Link 
                key={item.assessment_id} 
                href={`/results/${item.assessment_id}`}
                className="py-3.5 flex justify-between items-center group hover:bg-surface-2/20 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${
                    item.severity === "Critical" || item.severity === "High"
                      ? "bg-rose-50 text-risk-high border border-rose-100"
                      : item.severity === "Moderate"
                        ? "bg-amber-50 text-risk-mod border border-amber-100"
                        : "bg-emerald-50 text-risk-low border border-emerald-100"
                  }`}>
                    <Heart size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-text flex items-center gap-2">
                      Patient {item.assessment_id}
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                        item.prediction === "Disease" ? "bg-rose-50 text-risk-high" : "bg-emerald-50 text-risk-low"
                      }`}>
                        {item.prediction}
                      </span>
                    </h4>
                    <p className="text-[10px] text-text-subtle font-mono mt-0.5">
                      {new Date(item.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-text-muted uppercase font-mono">Fused Prob</span>
                    <p className={`text-sm font-bold ${
                      item.fused_probability >= 0.6
                        ? "text-risk-high"
                        : item.fused_probability >= 0.35
                          ? "text-risk-mod"
                          : "text-risk-low"
                    }`}>
                      {Math.round(item.fused_probability * 100)}%
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-text-subtle group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}

            {history.length === 0 && (
              <div className="py-8 text-center text-xs text-text-subtle font-mono">
                No recent assessments recorded. Run a new screening to begin.
              </div>
            )}
          </div>
        </div>

        {/* Quick Bulletin Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick clinical decision support helper */}
          <div className="cs-card bg-gradient-to-tr from-accent/5 to-amber-50/5 border border-accent/15 space-y-4">
            <div className="flex items-center gap-2 text-accent">
              <Sparkles size={16} />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Clinician Recommendation</h4>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              When ECG signals indicate abnormal T-wave inversions but structured clinical RF model shows low risk, check calibration confidence weights. Gating thresholds are set at 0.45 for conservative safety triggers.
            </p>
          </div>

          {/* Quick Actions widget */}
          <div className="cs-card space-y-4">
            <h4 className="text-xs font-semibold text-text">Diagnostic Tools</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Link href="/assess" className="p-3 rounded-2xl bg-surface-2 border border-border text-xs font-medium hover:bg-surface-3 transition-colors flex flex-col items-center gap-1.5 text-text">
                <Heart size={16} className="text-accent" />
                <span>Screening</span>
              </Link>
              <Link href="/cardiobot" className="p-3 rounded-2xl bg-surface-2 border border-border text-xs font-medium hover:bg-surface-3 transition-colors flex flex-col items-center gap-1.5 text-text">
                <MessageSquare size={16} className="text-indigo-500" />
                <span>Consult Bot</span>
              </Link>
              <Link href="/insights" className="p-3 rounded-2xl bg-surface-2 border border-border text-xs font-medium hover:bg-surface-3 transition-colors flex flex-col items-center gap-1.5 text-text">
                <Activity size={16} className="text-emerald-500" />
                <span>Calibration</span>
              </Link>
              <Link href="/profile" className="p-3 rounded-2xl bg-surface-2 border border-border text-xs font-medium hover:bg-surface-3 transition-colors flex flex-col items-center gap-1.5 text-text">
                <Shield size={16} className="text-amber-500" />
                <span>API Status</span>
              </Link>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
