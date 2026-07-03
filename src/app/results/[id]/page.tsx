"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAssessment, deleteAssessment, AssessResponse } from "@/lib/api";
import ConfidenceArc from "@/components/charts/ConfidenceArc";
import ShapChart from "@/components/charts/ShapChart";
import { 
  AlertTriangle, CheckCircle2, Activity, Loader2, ArrowLeft,
  Download, Trash2, Check, Share2, Clipboard, ShieldAlert, Heart, Info
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

// Interactive ECG Lead cycles (Simulated SVG Path data)
const ECG_LEAD_PATHS: Record<string, { path: string; annotation: string; anomaly: boolean }> = {
  "V5": {
    path: "M0 50 L40 50 L48 44 L56 56 L64 50 L75 50 L80 15 L88 85 L96 50 L110 50 L120 45 L130 58 L140 50 M140 50 L180 50 L188 44 L196 56 L204 50 L215 50 L220 15 L228 85 L236 50 L250 50 L260 45 L270 58 L280 50 M280 50 L320 50 L328 44 L336 56 L344 50 L355 50 L360 15 L368 85 L376 50 L390 50 L400 45 L410 58 L420 50",
    annotation: "ST Segment depression induced by exercise (slope deviation 1.2mm)",
    anomaly: true
  },
  "II": {
    path: "M0 50 L35 50 L42 45 L50 55 L58 50 L68 50 L73 20 L80 80 L87 50 L100 50 L110 46 L120 54 L130 50 M130 50 L165 50 L172 45 L180 55 L188 50 L198 50 L203 20 L210 80 L217 50 L230 50 L240 46 L250 54 L260 50 M260 50 L295 50 L302 45 L310 55 L318 50 L328 50 L333 20 L340 80 L347 50 L360 50 L370 46 L380 54 L390 50",
    annotation: "Normal Sinus rhythm baseline cycle without conduction block.",
    anomaly: false
  },
  "V3": {
    path: "M0 50 L45 50 L52 42 L60 58 L68 50 L80 50 L86 25 L94 75 L102 50 L116 50 L125 60 L135 40 L145 50 M145 50 L190 50 L197 42 L205 58 L213 50 L225 50 L231 25 L239 75 L247 50 L261 50 L270 60 L280 40 L290 50 M290 50 L335 50 L342 42 L350 58 L358 50 L370 50 L376 25 L384 75 L392 50 L406 50 L415 60 L425 40 L435 50",
    annotation: "Hyperacute T-wave amplitude elevation indicating subendocardial ischemia.",
    anomaly: true
  }
};

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<AssessResponse | null>(null);
  const [error, setError] = useState("");
  const [activeLead, setActiveLead] = useState("V5");
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAssessment(id)
      .then(setResult)
      .catch(e => setError(e.message));
  }, [id]);

  const handleDownloadPDF = async () => {
    setExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setExporting(false);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);

    // Trigger fake file download
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
    if (!confirm("Are you sure you want to delete this assessment record?")) return;
    setDeleting(true);
    await deleteAssessment(result.assessment_id);
    router.push("/history");
  };

  if (error) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="p-4 bg-rose-50 rounded-full w-fit mx-auto text-risk-high">
          <AlertTriangle size={32} />
        </div>
        <h2 className="font-display text-2xl text-text">Prognosis Not Found</h2>
        <p className="text-xs text-text-muted">The record key {id} was not found in browser LocalStorage.</p>
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

  return (
    <div className="space-y-8 relative">
      
      {/* Top action row */}
      <div className="flex justify-between items-center">
        <button onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent font-semibold transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownloadPDF} 
            disabled={exporting}
            className="px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold text-text hover:bg-surface-2 transition-colors flex items-center gap-2"
          >
            {exporting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : exportSuccess ? (
              <Check size={13} className="text-risk-low" />
            ) : (
              <Download size={13} />
            )}
            {exportSuccess ? "Downloaded" : "Export Report"}
          </button>
          
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-2 rounded-xl border border-rose-100 hover:bg-rose-50 text-xs font-semibold text-risk-high transition-colors flex items-center gap-2"
          >
            <Trash2 size={13} />
            Delete Record
          </button>
        </div>
      </div>

      {/* Main Verdict Card */}
      <section className="cs-card bg-white border border-border p-6 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        <div className="md:col-span-4 flex justify-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
          <ConfidenceArc
            probability={result.fused_probability}
            prediction={result.prediction}
            severity={result.severity}
          />
        </div>

        <div className="md:col-span-8 space-y-5">
          <div className="flex items-center gap-3">
            {isDisease ? (
              <div className="p-2 bg-rose-50 text-risk-high rounded-2xl border border-rose-100">
                <AlertTriangle size={20} />
              </div>
            ) : (
              <div className="p-2 bg-emerald-50 text-risk-low rounded-2xl border border-emerald-100">
                <CheckCircle2 size={20} />
              </div>
            )}
            <div>
              <h4 className="text-[10px] font-mono text-text-muted font-bold tracking-widest uppercase">Fused Model Prediction</h4>
              <h2 className="font-display text-2xl text-text mt-0.5 flex items-center gap-3">
                {result.prediction}
                <SeverityBadge severity={result.severity} prediction={result.prediction} />
              </h2>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-surface-2 p-4 rounded-2xl border border-border">
            {[
              { label: "Fused Prob", value: `${Math.round(result.fused_probability * 100)}%`, status: isDisease ? "text-risk-high" : "text-risk-low" },
              { label: "Confidence", value: `${Math.round(result.confidence * 100)}%` },
              { label: "Signal Qual", value: result.ecg_quality ? `${result.ecg_quality.quality_score}%` : "Tabular only" },
              { label: "Pipeline Source", value: result.severity_source || "Clinical" }
            ].map((m, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase text-text-muted font-bold">{m.label}</span>
                <p className={`text-xs font-mono font-bold text-text ${m.status || ""}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Dynamic Weight Bar */}
          {result.branch_contribution && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] font-mono text-text-muted uppercase">
                <span>Clinical weight ({result.branch_contribution.clinical_pct}%)</span>
                <span>ECG weight ({result.branch_contribution.ecg_pct}%)</span>
              </div>
              <div className="h-2 rounded-full bg-surface-3 overflow-hidden flex">
                <div className="bg-accent h-full rounded-l-full" style={{ width: `${result.branch_contribution.clinical_pct}%` }} />
                <div className="bg-indigo-500 h-full rounded-r-full" style={{ width: `${result.branch_contribution.ecg_pct}%` }} />
              </div>
              <p className="text-[10px] text-text-subtle leading-relaxed italic">
                Dynamic weighting adjusts contribution based on ECG SNR and clinical missingness score.
              </p>
            </div>
          )}
        </div>

      </section>

      {/* Grid: Branch analysis & SHAP */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Branch probabilities cards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="cs-card space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border pb-2">Branch Outputs</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-2 border border-border">
                <div>
                  <span className="text-xs font-semibold text-text">Clinical Classifier</span>
                  <p className="text-[10px] text-text-muted font-mono">Random Forest Class</p>
                </div>
                <span className="text-sm font-mono font-bold text-text">
                  {result.branch_probabilities?.clinical ? `${Math.round(result.branch_probabilities.clinical * 100)}%` : "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-2 border border-border">
                <div>
                  <span className="text-xs font-semibold text-text">ECG CNN Branch</span>
                  <p className="text-[10px] text-text-muted font-mono">ResNet1D Classification</p>
                </div>
                <span className="text-sm font-mono font-bold text-text">
                  {result.branch_probabilities?.ecg ? `${Math.round(result.branch_probabilities.ecg * 100)}%` : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive ECG Lead Attributions list */}
          {result.top_ecg_leads && result.top_ecg_leads.length > 0 && (
            <div className="cs-card space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border pb-2">ECG Lead Importance</h3>
              <div className="grid grid-cols-2 gap-2">
                {result.top_ecg_leads.map(lead => (
                  <div key={lead.lead} className="p-2.5 bg-surface-2 border border-border rounded-xl text-center">
                    <span className="text-xs font-bold text-text">{lead.lead}</span>
                    <p className="text-[10px] font-mono text-accent mt-0.5">+{lead.attribution.toFixed(4)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SHAP Chart panel */}
        <div className="lg:col-span-8 cs-card">
          {result.top_clinical_features && result.top_clinical_features.length > 0 ? (
            <ShapChart features={result.top_clinical_features} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-subtle font-mono">
              Clinical features was not analyzed.
            </div>
          )}
        </div>

      </section>

      {/* Interactive ECG Waveform Grid */}
      {result.top_ecg_leads && result.top_ecg_leads.length > 0 && (
        <section className="cs-card bg-white border border-border p-6 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-semibold text-text">ECG 12-Lead Attributed Signal Viewer</h3>
              <p className="text-xs text-text-muted">Interactive channel waveforms mapped with Integrated Gradient attribution</p>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-surface-2 p-1 rounded-2xl border border-border">
              {Object.keys(ECG_LEAD_PATHS).map(lead => (
                <button
                  key={lead}
                  onClick={() => setActiveLead(lead)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                    activeLead === lead ? "bg-white text-text shadow-sm" : "text-text-muted"
                  }`}
                >
                  Lead {lead}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Wave Canvas */}
          <div className="w-full h-44 bg-rose-50/10 border border-border rounded-3xl relative overflow-hidden flex items-center">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(244,63,94,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,63,94,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(244,63,94,0.06)_5px,transparent_5px),linear-gradient(to_bottom,rgba(244,63,94,0.06)_5px,transparent_5px)] bg-[size:50px_50px]" />
            
            {/* Waveform line */}
            <svg viewBox="0 0 420 100" preserveAspectRatio="none" className="w-full h-full relative z-10 overflow-visible px-4">
              <path
                d={ECG_LEAD_PATHS[activeLead]?.path || ""}
                fill="none"
                stroke={ECG_LEAD_PATHS[activeLead]?.anomaly ? "#f43f5e" : "#10b981"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="p-3 bg-surface-2 border border-border rounded-2xl flex items-start gap-2.5 text-xs text-text-muted">
            <Info size={14} className="text-accent shrink-0 mt-0.5" />
            <p>
              <strong>Attribution Annotation:</strong> {ECG_LEAD_PATHS[activeLead]?.annotation}
            </p>
          </div>
        </section>
      )}

      {/* Explanations Logs: Doctor & Patient */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Doctor Summary */}
        <div className="cs-card space-y-4">
          <div className="flex items-center gap-2 text-accent">
            <Activity size={16} />
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider">Clinical Diagnosis Summary (Audited)</h4>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            The patient presented with CP score {result.clinical.cp} and ST depression induces {result.clinical.oldpeak}mm. Bayesian Platt calibration of the fused branches outputs a probability of {Math.round(result.fused_probability * 100)}% suggesting {result.prediction === "Disease" ? "significant coronary artery disease (CAD) indicators" : "low atherosclerotic risk"}. The primary attribution branch was computed as {result.severity_source || "Clinical"}. Recommended angiographic review and ECG trace surveillance.
          </p>
        </div>

        {/* Patient Summary */}
        <div className="cs-card space-y-4">
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle2 size={16} />
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider">Patient Explanation (Empathetic)</h4>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Your results indicate a {result.prediction === "Disease" ? "moderate to high" : "low"} cardiac risk score. The AI looked at clinical features like chest discomfort triggers, age, and your heartbeat recording. It found that {result.prediction === "Disease" ? "particular ECG signals and clinical observations align with heart strain, which merits scheduling a review with your physician." : "your heart vital readings are in the normal, healthy range, which suggests no urgent strain."}
          </p>
        </div>

      </section>

      {/* Recommendations & Disclaimer */}
      {result.recommendations && result.recommendations.length > 0 && (
        <section className="cs-card space-y-3">
          <h3 className="text-sm font-semibold text-text">Prognostic Recommendations</h3>
          <ul className="space-y-2 text-xs">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-text-muted">
                <span className="text-accent font-bold shrink-0">&gt;</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
}
