"use client";
import { useEffect, useState } from "react";
import { getAssessmentHistory, deleteAssessment, AssessmentHistoryItem } from "@/lib/api";
import { 
  Clock, ArrowRight, Loader2, Search, Filter, 
  Trash2, Download, Table, Grid, GitCommit, AlertTriangle, CheckCircle2, LayoutList
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function SeverityDot({ s }: { s: string | null }) {
  const c = s === "Critical" ? "bg-red-500" : s === "High" ? "bg-rose-500" : s === "Moderate" ? "bg-amber-500" : "bg-emerald-500";
  return <span className={`w-2 h-2 rounded-full ${c} shrink-0`} />;
}

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<AssessmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [predictionFilter, setPredictionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, risk-desc, risk-asc
  const [viewMode, setViewMode] = useState<"list" | "grid" | "timeline">("list");
  const [exportSuccess, setExportSuccess] = useState(false);

  const fetchHistory = async () => {
    try {
      const data = await getAssessmentHistory(100);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigating to result page
    e.stopPropagation();
    if (!confirm(`Confirm deletion of assessment: ${id}?`)) return;
    
    // Optimistic state update
    setItems(prev => prev.filter(item => item.assessment_id !== id));
    await deleteAssessment(id);
  };

  const handleExportCSV = () => {
    // Generate mock CSV data
    const headers = "Assessment ID,Prediction,Fused Probability,Severity,Created At\n";
    const rows = items.map(item => 
      `"${item.assessment_id}","${item.prediction}",${item.fused_probability},"${item.severity || "Low"}","${item.created_at}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "CardioSense_Assessment_History.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  // Filter & Sort Calculations
  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.assessment_id.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severityFilter === "all" || item.severity === severityFilter;
      const matchesPrediction = predictionFilter === "all" || item.prediction === predictionFilter;
      return matchesSearch && matchesSeverity && matchesPrediction;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "risk-desc") return b.fused_probability - a.fused_probability;
      if (sortBy === "risk-asc") return a.fused_probability - b.fused_probability;
      return 0;
    });

  return (
    <div className="space-y-8 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl text-text flex items-center gap-2">
            <Clock size={20} className="text-accent" />
            Assessment History
          </h1>
          <p className="text-xs text-text-muted">Review, export, and search diagnostic audit records.</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs font-semibold hover:bg-surface-2 transition-colors flex items-center gap-2 text-text"
          >
            <Download size={13} />
            {exportSuccess ? "CSV Exported!" : "Export Database"}
          </button>
          
          <Link href="/assess"
            className="px-4 py-2.5 rounded-2xl bg-accent text-white font-medium text-xs hover:bg-accent/95 shadow-md shadow-rose-600/5 transition-all btn-glow"
          >
            + New Assessment
          </Link>
        </div>
      </div>

      {/* Controls: Search, Filter, Views */}
      <section className="cs-card bg-surface-2/20 border border-border p-4 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3.5 top-3 text-text-subtle" />
            <input 
              type="text"
              placeholder="Search by assessment ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs outline-none bg-white border border-border rounded-xl"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            <div className="flex items-center gap-1.5 text-xs text-text-muted bg-white border border-border px-2 py-1 rounded-xl">
              <Filter size={11} />
              <select 
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="bg-transparent border-0 font-medium py-0.5 text-xs outline-none text-text cursor-pointer focus:ring-0"
                style={{ background: "none!important", border: "0!important" }}
              >
                <option value="all">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low / Healthy</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-text-muted bg-white border border-border px-2 py-1 rounded-xl">
              <Filter size={11} />
              <select 
                value={predictionFilter}
                onChange={e => setPredictionFilter(e.target.value)}
                className="bg-transparent border-0 font-medium py-0.5 text-xs outline-none text-text cursor-pointer focus:ring-0"
                style={{ background: "none!important", border: "0!important" }}
              >
                <option value="all">All Prognoses</option>
                <option value="Disease">Disease</option>
                <option value="No Disease">No Disease</option>
              </select>
            </div>

            <select 
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-white border border-border px-2 py-1.5 rounded-xl font-medium text-xs text-text-muted outline-none cursor-pointer"
              style={{ background: "white!important" }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="risk-desc">Risk (High-Low)</option>
              <option value="risk-asc">Risk (Low-High)</option>
            </select>

            {/* View switcher */}
            <div className="flex bg-white rounded-xl border border-border p-0.5">
              {[
                { key: "list", icon: LayoutList },
                { key: "grid", icon: Grid },
                { key: "timeline", icon: GitCommit }
              ].map(mode => (
                <button
                  key={mode.key}
                  onClick={() => setViewMode(mode.key as any)}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === mode.key ? "bg-accent-soft text-accent" : "text-text-subtle hover:text-text-muted"}`}
                  title={`${mode.key} view`}
                >
                  <mode.icon size={13} />
                </button>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* Database Listing Panel */}
      {loading ? (
        <div className="flex items-center gap-2 justify-center py-20 text-text-muted">
          <Loader2 size={18} className="animate-spin text-accent" /> Loading history...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="cs-card text-center py-20 space-y-4 rounded-3xl">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-accent">
            <Search size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-text">No screening records found</h3>
            <p className="text-xs text-text-muted">Try adjusting your filters or search keywords.</p>
          </div>
          <button 
            onClick={() => { setSearch(""); setSeverityFilter("all"); setPredictionFilter("all"); }}
            className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-semibold text-text hover:bg-surface-2 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          
          {/* VIEW: Table List */}
          {viewMode === "list" && (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="cs-card bg-white border border-border rounded-3xl overflow-hidden p-0 shadow-md"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-2/60 border-b border-border text-text-muted font-medium">
                      <th className="py-3.5 px-6">Prognosis Verdict</th>
                      <th className="py-3.5 px-4">Record ID</th>
                      <th className="py-3.5 px-4 text-center">Severity</th>
                      <th className="py-3.5 px-4 text-right">Probability</th>
                      <th className="py-3.5 px-4">Conducted Date</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredItems.map(item => (
                      <tr 
                        key={item.assessment_id}
                        onClick={() => router.push(`/results/${item.assessment_id}`)}
                        className="hover:bg-surface-2/20 cursor-pointer group transition-colors"
                      >
                        <td className="py-4 px-6 font-semibold flex items-center gap-2 text-text">
                          <SeverityDot s={item.severity} />
                          {item.prediction}
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-text">{item.assessment_id}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            item.severity === "Critical" || item.severity === "High"
                              ? "bg-rose-50 text-risk-high border-rose-100"
                              : item.severity === "Moderate"
                                ? "bg-amber-50 text-risk-mod border-amber-100"
                                : "bg-emerald-50 text-risk-low border-emerald-100"
                          }`}>
                            {item.severity || "Low"}
                          </span>
                        </td>
                        <td className={`py-4 px-4 text-right font-mono font-bold ${
                          item.fused_probability >= 0.6
                            ? "text-risk-high"
                            : item.fused_probability >= 0.35
                              ? "text-risk-mod"
                              : "text-risk-low"
                        }`}>
                          {Math.round(item.fused_probability * 100)}%
                        </td>
                        <td className="py-4 px-4 text-text-muted">
                          {new Date(item.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end items-center gap-3">
                            <button
                              onClick={(e) => handleDeleteItem(e, item.assessment_id)}
                              className="p-2 rounded-lg hover:bg-rose-50 text-text-subtle hover:text-risk-high transition-all shrink-0"
                              title="Delete record"
                            >
                              <Trash2 size={13} />
                            </button>
                            <ArrowRight size={14} className="text-text-subtle group-hover:translate-x-1 transition-transform" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* VIEW: Grid Cards */}
          {viewMode === "grid" && (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredItems.map(item => (
                <Link 
                  key={item.assessment_id}
                  href={`/results/${item.assessment_id}`}
                  className="cs-card cs-card-hover bg-white border border-border p-5 rounded-2xl flex flex-col justify-between h-48 hover:-translate-y-1 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-mono text-text-subtle font-bold tracking-widest">RECORD {item.assessment_id.toUpperCase()}</p>
                      <h4 className="text-base font-display text-text mt-1 flex items-center gap-1.5">
                        {item.prediction}
                      </h4>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      item.severity === "Critical" || item.severity === "High"
                        ? "bg-rose-50 text-risk-high border-rose-100"
                        : item.severity === "Moderate"
                          ? "bg-amber-50 text-risk-mod border-amber-100"
                          : "bg-emerald-50 text-risk-low border-emerald-100"
                    }`}>
                      {item.severity || "LOW"}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-border">
                    <div>
                      <span className="text-[9px] text-text-subtle uppercase">Fused Risk</span>
                      <p className={`text-xl font-mono font-bold ${
                        item.fused_probability >= 0.6
                          ? "text-risk-high"
                          : item.fused_probability >= 0.35
                            ? "text-risk-mod"
                            : "text-risk-low"
                      }`}>
                        {Math.round(item.fused_probability * 100)}%
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-text-subtle uppercase">Date Checked</span>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {new Date(item.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}

          {/* VIEW: Timeline Chronological */}
          {viewMode === "timeline" && (
            <motion.div
              key="timeline-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative border-l border-border pl-6 ml-4 space-y-8"
            >
              {filteredItems.map((item, idx) => (
                <div key={item.assessment_id} className="relative">
                  
                  {/* Timeline point */}
                  <div className={`absolute left-[-31px] top-1.5 w-4.5 h-4.5 rounded-full border-2 border-white shadow flex items-center justify-center ${
                    item.severity === "Critical" || item.severity === "High"
                      ? "bg-risk-high"
                      : item.severity === "Moderate"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`} />

                  {/* Card content */}
                  <Link 
                    href={`/results/${item.assessment_id}`}
                    className="cs-card bg-white border border-border p-4 rounded-2xl block hover:bg-surface-2/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-text-subtle font-mono font-semibold">
                          {new Date(item.created_at).toLocaleString([], { dateStyle: "long", timeStyle: "short" })}
                        </span>
                        <h4 className="text-sm font-semibold text-text flex items-center gap-2">
                          Assessment Run: {item.assessment_id}
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                            item.prediction === "Disease" ? "bg-rose-50 text-risk-high border-rose-100" : "bg-emerald-50 text-risk-low border-emerald-100"
                          }`}>
                            {item.prediction}
                          </span>
                        </h4>
                      </div>

                      <div className="text-right sm:text-right shrink-0">
                        <span className="text-[9px] text-text-subtle uppercase font-mono">Fused Prob</span>
                        <p className={`text-base font-bold ${
                          item.fused_probability >= 0.6
                            ? "text-risk-high"
                            : item.fused_probability >= 0.35
                              ? "text-risk-mod"
                              : "text-risk-low"
                        }`}>
                          {Math.round(item.fused_probability * 100)}%
                        </p>
                      </div>
                    </div>
                  </Link>

                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      )}

    </div>
  );
}
