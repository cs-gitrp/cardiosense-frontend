"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAssessment, deleteAssessment, AssessResponse } from "@/lib/api";
import ConfidenceArc from "@/components/charts/ConfidenceArc";
import ShapChart from "@/components/charts/ShapChart";
import { 
  AlertTriangle, CheckCircle2, Activity, Loader2, ArrowLeft,
  Download, Trash2, Check, Info
} from "lucide-react";
import { motion } from "framer-motion";

function SeverityBadge({ severity, prediction }: { severity: string | null; prediction: string }) {
  const s = severity || (prediction === "No Disease" ? "Low" : "Unknown");
  const styles: Record<string, string> = {
    Low:      "bg-emerald-50 text-risk-low border-emerald-100",
    Moderate: "bg-amber-50 text-risk-mod border-amber-100",
    High:     "bg-rose-50 text-risk-high border-rose-100",
    Critical: "bg-rose-100 text-accent border-rose-200"
  };
  const styleClass = styles[s] || styles["Moderate"];
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${styleClass}`}>
      {s.toUpperCase()}
    </span>
  );
}

// System Identification Source Converter Map (Prompt 2 - Rule 4)
const PIPELINE_LABELS: Record<string, string> = {
  "trained_multiclass_rf": "Notebook 13 Severity Model",
  "binary_gate_no_disease": "Binary Safety Gate",
  "heuristic_probability_band": "Probability Threshold Heuristic"
};

// Baseline waveform pathways used as a future-proof structural fallback context (Prompt 3)
const STATIC_FALLBACK_PATHS: Record<string, string> = {
  "V5": "M0 50 L40 50 L48 44 L56 56 L64 50 L75 50 L80 15 L88 85 L96 50 L110 50 L120 45 L130 58 L140 50 M140 50 L180 50 L188 44 L196 56 L204 50 L215 50 L220 15 L228 85 L236 50 L250 50 L260 45 L270 58 L280 50 M280 50 L320 50 L328 44 L336 56 L344 50 L355 50 L360 15 L368 85 L376 50 L390 50 L400 45 L410 58 L420 50",
  "II": "M0 50 L35 50 L42 45 L50 55 L58 50 L68 50 L73 20 L80 80 L87 50 L100 50 L110 46 L113 54"
};

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeLead, setActiveLead] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAssessment(id)
      .then(data => {
        setResult(data);
        if (data.top_ecg_leads && data.top_ecg_leads.length > 0) {
          setActiveLead(data.top_ecg_leads[0].lead);
        } else {
          setActiveLead("II");
        }
      })
      .catch(e => setError(e.message));
  }, [id]);

  const handleDownloadPDF = async () => {
    setExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setExporting(false);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `CardioSense_Report_${id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDelete = async () => {
    if (!result) return;
    if (!confirm("Are you sure you want to permanently delete this assessment record?")) return;
    setDeleting(true);
    await deleteAssessment(result.assessment_id);
    router.push("/history");
  };

  if (error) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="p-4 bg-rose-50 rounded-full w-fit mx-auto text-risk-high"><AlertTriangle size={32} /></div>
        <h2 className="font-display text-2xl text-text">Prognosis Key Not Found</h2>
        <p className="text-xs text-text-muted">The record key {id} was not found in the secure database indexes.</p>
        <button onClick={() => router.push("/history")} className="px-4 py-2 rounded-xl bg-surface border border-border text-xs text-text hover:bg-surface-2 transition-colors">
          Back to History
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-text-muted">
        <Loader2 size={24} className="animate-spin text-accent" />
        <span className="text-xs font-mono">Assembling neural attributions...</span>
      </div>
    );
  }

  const isDisease = result.prediction === "Disease";
  const clinicalWeight = result.branch_contribution ? result.branch_contribution.clinical_pct : 100;
  const ecgWeight = result.branch_contribution ? result.branch_contribution.ecg_pct : 0;
  
  // Rule 4: System source converted into friendly labels safely
  const friendlyPipelineSource = PIPELINE_LABELS[result.severity_source] || result.severity_source || "Heuristic Gating Node";

  return (
    <div className="space-y-8 relative">
      
      {/* Top Action Navigation Bar */}
      <div className="flex justify-between items-center">
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent font-semibold transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleDownloadPDF} disabled={exporting} className="px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold text-text hover:bg-surface-2 transition-colors flex items-center gap-2">
            {exporting ? <Loader2 size={13} className="animate-spin" /> : exportSuccess ? <Check size={13} className="text-risk-low" /> : <Download size={13} />}
            {exportSuccess ? "Downloaded" : "Export Report"}
          </button>
          <button onClick={handleDelete} disabled={deleting} className="px-3 py-2 rounded-xl border border-rose-100 hover:bg-rose-50 text-xs font-semibold text-risk-high transition-colors flex items-center gap-2">
            <Trash2 size={13} /> Delete Record
          </button>
        </div>
      </div>

      {/* Primary Fusion Verdict Metric Block */}
      <section className="cs-card bg-white border border-border p-6 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-4 flex justify-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
          <ConfidenceArc probability={result.fused_probability} prediction={result.prediction} severity={result.severity} />
        </div>

        <div className="md:col-span-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-2xl border ${isDisease ? "bg-rose-50 text-risk-high border-rose-100" : "bg-emerald-50 text-risk-low border-emerald-100"}`}>
              {isDisease ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div>
              <h4 className="text-[10px] font-mono text-text-muted font-bold tracking-widest uppercase">Fused Model Prediction</h4>
              <h2 className="font-display text-2xl text-text mt-0.5 flex items-center gap-3">
                {result.prediction}
                <SeverityBadge severity={result.severity} prediction={result.prediction} />
              </h2>
            </div>
          </div>

          {/* Core Telemetry Grid Parameters - Labeled correctly (Prompt 2 - Rule 5 & 7) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-surface-2 p-4 rounded-2xl border border-border">
            {[
              { label: "Fused Prob", value: `${Math.round(result.fused_probability * 100)}%`, status: isDisease ? "text-risk-high" : "text-risk-low" },
              { label: "Model Confidence", value: `${Math.round(result.confidence * 100)}%` },
              { label: "Signal Qual", value: result.ecg_quality ? `${result.ecg_quality.quality_score}%` : "0%" },
              { label: "Pipeline Source", value: friendlyPipelineSource }
            ].map((m, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase text-text-muted font-bold">{m.label}</span>
                <p className={`text-xs font-mono font-bold text-text ${m.status || ""}`}>{m.value}</p>
                {m.label === "Signal Qual" && result.ecg_quality && (
                  <span className={`text-[9px] block font-semibold ${result.ecg_quality.is_acceptable ? "text-risk-low" : "text-risk-high"}`}>
                    {result.ecg_quality.is_acceptable ? "Acceptable" : "Needs Review"}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Dynamic Weight Proportions Bar slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[10px] font-mono text-text-muted uppercase">
              <span>Clinical weight ({clinicalWeight}%)</span>
              <span>ECG weight ({ecgWeight}%)</span>
            </div>
            <div className="h-2 rounded-full bg-surface-3 overflow-hidden flex">
              <div className="bg-accent h-full rounded-l-full" style={{ width: `${clinicalWeight}%` }} />
              <div className="bg-indigo-500 h-full rounded-r-full" style={{ width: `${ecgWeight}%` }} />
            </div>
            <p className="text-[10px] text-text-subtle leading-relaxed italic">
              Dynamic weighting adjusts contribution based on ECG SNR and clinical missingness score.
            </p>
          </div>
        </div>
      </section>

      {/* Explainability Engine Outputs (SHAP & Lead Importance) - Labels modified (Prompt 2 - Rule 6) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="cs-card space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border pb-2">Branch Probabilities</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-2 border border-border">
                <div>
                  <span className="text-xs font-semibold text-text">Clinical Branch Probability</span>
                  <p className="text-[10px] text-text-muted font-mono">Random Forest Class</p>
                </div>
                <span className="text-sm font-mono font-bold text-text">
                  {result.branch_probabilities?.clinical !== undefined ? `${Math.round(result.branch_probabilities.clinical * 100)}%` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-2 border border-border">
                <div>
                  <span className="text-xs font-semibold text-text">ECG Branch Probability</span>
                  <p className="text-[10px] text-text-muted font-mono">ResNet1D Classification</p>
                </div>
                <span className="text-sm font-mono font-bold text-text">
                  {result.branch_probabilities?.ecg !== null && result.branch_probabilities?.ecg !== undefined ? `${Math.round(result.branch_probabilities.ecg * 100)}%` : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Integrated Gradient Lead Mapping */}
          <div className="cs-card space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border pb-2">ECG Lead Importance</h3>
            {result.top_ecg_leads && result.top_ecg_leads.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {result.top_ecg_leads.map((lead: any) => (
                  <div key={lead.lead} className="p-2.5 bg-surface-2 border border-border rounded-xl text-center">
                    <span className="text-xs font-bold text-text">{lead.lead}</span>
                    <p className="text-[10px] font-mono text-accent mt-0.5">+{lead.attribution.toFixed(4)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-text-subtle font-mono italic">No ECG lead attributions available in clinical-only mode.</div>
            )}
          </div>
        </div>

        {/* Dynamic SHAP Graph Box Container */}
        <div className="lg:col-span-8 cs-card">
          {result.top_clinical_features && result.top_clinical_features.length > 0 ? (
            <ShapChart features={result.top_clinical_features} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-subtle font-mono italic">Clinical feature impact mapping unavailable.</div>
          )}
        </div>
      </section>

      {/* Dynamic 12-Lead Signal Viewer Graph — Implements Prompt 3 Future-proof Wrapper */}
      {result.top_ecg_leads && result.top_ecg_leads.length > 0 && (
        <section className="cs-card bg-white border border-border p-6 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-semibold text-text">ECG 12-Lead Attributed Signal Viewer</h3>
              <p className="text-xs text-text-muted">Interactive channel waveforms mapped with Integrated Gradient attribution coefficients</p>
            </div>
            <div className="flex bg-surface-2 p-1 rounded-2xl border border-border flex-wrap gap-1">
              {result.top_ecg_leads.map((leadObj: any) => (
                <button key={leadObj.lead} onClick={() => setActiveLead(leadObj.lead)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${activeLead === leadObj.lead ? "bg-white text-text shadow-sm" : "text-text-muted"}`}>
                  Lead {leadObj.lead}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-44 bg-rose-50/10 border border-border rounded-3xl relative overflow-hidden flex items-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(244,63,94,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,63,94,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />
            <svg viewBox="0 0 420 100" preserveAspectRatio="none" className="w-full h-full relative z-10 overflow-visible px-4">
              <path
                d={result.display_waveforms?.[activeLead] || STATIC_FALLBACK_PATHS[activeLead] || STATIC_FALLBACK_PATHS["II"]}
                fill="none"
                stroke={STATIC_FALLBACK_PATHS[activeLead] ? "#10b981" : "#f43f5e"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Dynamic Annotation Description Details (Prompt 2 - Rule 1) */}
          <div className="p-3 bg-surface-2 border border-border rounded-2xl flex items-start gap-2.5 text-xs text-text-muted">
            <Info size={14} className="text-accent shrink-0 mt-0.5" />
            <p><strong>Attribution Annotation:</strong> {result.lead_annotation || "No active signal annotation returned by database context."}</p>
          </div>
        </section>
      )}

      {/* Diagnosis Explanations pulling 100% from backend core models (Prompt 2 - Rule 2 & 3) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="cs-card space-y-4">
          <div className="flex items-center gap-2 text-accent">
            <Activity size={16} />
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider">Clinical Diagnosis Summary (Audited)</h4>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">{result.doctor_summary}</p>
        </div>

        <div className="cs-card space-y-4">
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle2 size={16} />
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider">Patient Explanation (Empathetic)</h4>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">{result.patient_summary}</p>
        </div>
      </section>

      {/* Proactive Recommendations list & Disclaimer */}
      {((result.recommendations && result.recommendations.length > 0) || result.disclaimer) && (
        <section className="cs-card space-y-3">
          {result.recommendations && result.recommendations.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-text">Prognostic Recommendations</h3>
              <ul className="space-y-2 text-xs">
                {result.recommendations.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-text-muted">
                    <span className="text-accent font-bold shrink-0">&gt;</span><span>{r}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {result.disclaimer && <p className="text-[10px] text-text-muted leading-relaxed border-t border-border pt-3 mt-3 italic">{result.disclaimer}</p>}
        </section>
      )}

    </div>
  );
}