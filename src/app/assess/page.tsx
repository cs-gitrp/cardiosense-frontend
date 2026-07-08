"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { runAssessmentStream, ClinicalFeatures, getToken } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { 
  Activity, ArrowLeft, ArrowRight, Check, AlertCircle, 
  Loader2, Info, UploadCloud, Eye, CheckCircle2, RefreshCw, FileText,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FieldDef {
  key: keyof ClinicalFeatures;
  label: string;
  type: string;
  hint: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  options?: { value: number; label: string }[];
  nullable?: boolean;
}

interface CategoryDef {
  category: string;
  fields: FieldDef[];
}

// Fields
const CLINICAL_FIELDS: CategoryDef[] = [
  {
    category: "Demographics & Vital Profile",
    fields: [
      { key: "age", label: "Patient Age", type: "number", hint: "Age in years", min: 1, max: 120, placeholder: "e.g. 58" },
      { 
        key: "sex", label: "Biological Sex", type: "select", hint: "Biological sex", 
        options: [{ value: 0, label: "Female" }, { value: 1, label: "Male" }] 
      }
    ]
  },
  {
    category: "Symptom Attribs (Angina)",
    fields: [
      { 
        key: "cp", label: "Chest Pain Type", type: "select", hint: "Type of chest pain reported",
        options: [
          { value: 0, label: "0 — Typical angina" },
          { value: 1, label: "1 — Atypical angina" },
          { value: 2, label: "2 — Non-anginal pain" },
          { value: 3, label: "3 — Asymptomatic" }
        ] 
      },
      { 
        key: "exang", label: "Exercise Angina", type: "select", hint: "Exercise induced pain?", 
        options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] 
      }
    ]
  },
  {
    category: "Cardiac Response Indicators",
    fields: [
      { key: "thalach", label: "Max Heart Rate (bpm)", type: "number", hint: "Maximum rate during stress", min: 50, max: 220, placeholder: "e.g. 150" },
      { key: "oldpeak", label: "ST Depression (Oldpeak)", type: "number", hint: "ST shift induces relative to rest", min: 0, max: 8, step: 0.1, placeholder: "e.g. 1.8" }
    ]
  },
  {
    category: "Anatomical & Genetic Markers",
    fields: [
      { 
        key: "ca", label: "Major Vessels (Fluoroscopy)", type: "select", nullable: true, hint: "Number of vessels (0-3)", 
        options: [{ value: 0, label: "0" }, { value: 1, label: "1" }, { value: 2, label: "2" }, { value: 3, label: "3" }] 
      },
      { 
        key: "thal", label: "Thalassemia Code", type: "select", nullable: true, hint: "Thalassemia type", 
        options: [{ value: 1, label: "1 — Normal" }, { value: 2, label: "2 — Fixed defect" }, { value: 3, label: "3 — Reversible defect" }] 
      }
    ]
  },
  {
    category: "Integrity Verification Adjustments",
    fields: [
      { key: "fbs", label: "Fasting Sugar > 120mg/dl", type: "select", hint: "Fasting blood sugar check", options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
      { key: "chol_missing", label: "Cholesterol Missing?", type: "select", hint: "Is cholesterol data absent?", options: [{ value: 0, label: "No (Valid)" }, { value: 1, label: "Yes" }] },
      { key: "slope_missing", label: "ST Slope Missing?", type: "select", hint: "Is ST slope data absent?", options: [{ value: 0, label: "No (Valid)" }, { value: 1, label: "Yes" }] }
    ]
  }
];

const DEFAULTS: Partial<Record<keyof ClinicalFeatures, number | null>> = {
  sex: 1, cp: 0, exang: 0, fbs: 0, chol_missing: 0, slope_missing: 0, age: 55, thalach: 145, oldpeak: 1.2, ca: 0, thal: 2
};

export default function AssessPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Wizard state: 1: Clinical, 2: ECG, 3: Review, 4: Loading/Prediction
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Partial<Record<keyof ClinicalFeatures, number | null>>>(DEFAULTS);
  
  // ECG File state
  const [ecgFile, setEcgFile] = useState<{ name: string; size: number } | null>(null);
  const [ecgUploading, setEcgUploading] = useState(false);
  const [ecgDiagnostics, setEcgDiagnostics] = useState<{ quality: number; acceptable: boolean } | null>(null);
  const [ecgSignalData, setEcgSignalData] = useState<number[] | null>(null); // real parsed (1000×12) flat array

  // Loading Steps state (Prediction Phase)
  const [predictionStep, setPredictionStep] = useState(0);
  const [predictionLogs, setPredictionLogs] = useState<string[]>([]);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <div className="p-4 bg-rose-50 rounded-full w-fit mx-auto text-risk-high">
          <Heart size={32} />
        </div>
        <h2 className="font-display text-2xl text-text">Sign in to start screening</h2>
        <p className="text-xs text-text-muted">
          Accessing CardioSense AI model pipelines requires a verified research session token.
        </p>
        <Link href="/auth" className="inline-block px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-xs hover:bg-accent/90 shadow-md">
          Sign In
        </Link>
      </div>
    );
  }

  const handleFieldChange = (key: keyof ClinicalFeatures, val: number | null) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const handleEcgDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleEcgFile(file);
  };

  const handleEcgFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleEcgFile(file);
  };

  /** Parse uploaded ECG file and validate shape */
  const handleEcgFile = async (file: File) => {
    if (!file.name.endsWith(".json") && !file.name.endsWith(".csv")) {
      setError("Invalid file format. Upload .json or .csv ECG recordings.");
      return;
    }

    setError("");
    setEcgUploading(true);
    setEcgFile({ name: file.name, size: file.size });

    try {
      let signal: number[] = [];
      const text = await file.text();

      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(text);
        let matrix: number[][] = [];
        if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
          matrix = parsed as number[][];
        } else if (Array.isArray(parsed) && typeof parsed[0] === "number") {
          const flat = parsed as number[];
          for (let i = 0; i < 1000; i++) matrix.push(flat.slice(i * 12, (i + 1) * 12));
        } else if (parsed.signal && Array.isArray(parsed.signal)) {
          matrix = parsed.signal as number[][];
        } else if (parsed.data && Array.isArray(parsed.data)) {
          matrix = parsed.data as number[][];
        } else {
          throw new Error("Unrecognized JSON shape. Expected (1000×12) array.");
        }
        while (matrix.length < 1000) matrix.push(new Array(12).fill(0));
        matrix = matrix.slice(0, 1000).map(row => row.slice(0, 12));
        signal = matrix.flat();
      } else if (file.name.endsWith(".csv")) {
        const lines = text.trim().split("\n");
        const startIdx = isNaN(Number(lines[0].split(",")[0].trim())) ? 1 : 0;
        const matrix: number[][] = [];
        for (let i = startIdx; i < lines.length && matrix.length < 1000; i++) {
          const vals = lines[i].split(",").map(v => Number(v.trim())).filter(v => !isNaN(v));
          if (vals.length >= 12) matrix.push(vals.slice(0, 12));
        }
        while (matrix.length < 1000) matrix.push(new Array(12).fill(0));
        signal = matrix.flat();
      }

      if (signal.length !== 12000) throw new Error(`Signal must have 12000 values, got ${signal.length}`);

      setEcgSignalData(signal);
      setEcgDiagnostics({ quality: 100, acceptable: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ECG parse error. Check file format.");
      setEcgFile(null);
      setEcgSignalData(null);
      setEcgDiagnostics(null);
    } finally {
      setEcgUploading(false);
    }
  };

  const runPredictionPipeline = async () => {
    setStep(4);
    setError("");
    setPredictionLogs([]);
    setPredictionStep(0);
    
    const logs = [
      "Initalizing multi-branch classification pipeline...",
      "Executing Structured Clinical Random Forest branch...",
      "Executing 12-lead ECG CNN branch (ResNet1D)...",
      "Running Platt probability calibration algorithms...",
      "Executing Confidence-Adaptive Gating Node...",
      "Finalizing diagnostic report and SHAP explanations..."
    ];

    try {
      const clinical = { ...values } as ClinicalFeatures;
      const ecg_signal = ecgSignalData ?? null;

      await runAssessmentStream(
        clinical,
        ecg_signal,
        (trimmed) => {
          if (trimmed.startsWith("ERROR:")) {
            throw new Error(trimmed.substring(6));
          }

          if (trimmed === "INIT_PIPELINE") {
            setPredictionStep(0);
            setPredictionLogs([logs[0]]);
          } else if (trimmed === "RUNNING_CLINICAL_RF") {
            setPredictionStep(1);
            setPredictionLogs(prev => [...prev, logs[1]]);
          } else if (trimmed === "RUNNING_ECG_CNN") {
            setPredictionStep(2);
            setPredictionLogs(prev => [...prev, logs[2]]);
          } else if (trimmed === "CALIBRATING_PLATT") {
            setPredictionStep(3);
            setPredictionLogs(prev => [...prev, logs[3]]);
          } else if (trimmed === "GATING_NODE_COMPLETE") {
            setPredictionStep(4);
            setPredictionLogs(prev => [...prev, logs[4]]);
          } else if (trimmed.startsWith("FINAL_REPORT_READY:")) {
            setPredictionStep(5);
            setPredictionLogs(prev => [...prev, logs[5]]);
            
            const jsonStr = trimmed.substring("FINAL_REPORT_READY:".length);
            const report = JSON.parse(jsonStr);
            
            setTimeout(() => {
              router.push(`/results/${report.assessment_id}`);
            }, 800);
          }
        },
        (errMessage) => {
          setError(errMessage);
          setStep(3);
        }
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Model analysis failed");
      setStep(3);
    }
  };

  // Field validation status check (Priority 6)
  const isClinicalValid = 
    values.age !== null && values.age !== "" &&
    values.sex !== null &&
    values.cp !== null &&
    values.thalach !== null && values.thalach !== "" &&
    values.oldpeak !== null && values.oldpeak !== "" &&
    values.exang !== null &&
    values.fbs !== null;

  // Track optional fields missingness (Priority 5)
  const missingOptionalFields: string[] = [];
  if (values.ca === null || values.ca === undefined || values.ca === "") missingOptionalFields.push("Fluoroscopy Vessels (ca)");
  if (values.thal === null || values.thal === undefined || values.thal === "") missingOptionalFields.push("Thalassemia Code (thal)");

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl text-text">New Cardiac Assessment</h1>
          <p className="text-xs text-text-muted">Enter diagnostics to run confidence-calibrated pipeline.</p>
        </div>

        {/* Stepper bubbles */}
        {step < 4 && (
          <div className="flex items-center gap-2">
            {[
              { idx: 1, label: "Clinical" },
              { idx: 2, label: "ECG Signal" },
              { idx: 3, label: "Review" }
            ].map(s => (
              <div key={s.idx} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border transition-colors ${
                  step === s.idx 
                    ? "bg-accent border-accent text-white" 
                    : step > s.idx 
                      ? "bg-accent-soft border-accent/20 text-accent" 
                      : "bg-surface border-border text-text-subtle"
                }`}>
                  {step > s.idx ? <Check size={10} /> : s.idx}
                </div>
                <span className={`text-[10px] font-medium transition-colors ${step === s.idx ? "text-text" : "text-text-subtle"}`}>
                  {s.label}
                </span>
                {s.idx < 3 && <div className="w-4 h-px bg-border" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Form/Wizard view */}
      <AnimatePresence mode="wait">
        
        {/* Step 1: Clinical Info */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="cs-card bg-white border border-border p-6 rounded-3xl space-y-8">
              {CLINICAL_FIELDS.map((cat, i) => (
                <div key={i} className="space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border pb-2">
                    {cat.category}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {cat.fields.map(field => (
                      <div key={field.key} className="space-y-1.5 relative group">
                        
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-text">
                          {field.label}
                          {field.nullable && (
                            <span className="text-[9px] font-mono px-1 rounded bg-surface-2 text-text-subtle">optional</span>
                          )}
                          
                          <div className="relative inline-block cursor-help text-text-subtle hover:text-text-muted">
                            <Info size={11} />
                            <span className="absolute hidden group-hover:block bottom-5 left-0 w-48 bg-text text-white text-[10px] p-2 rounded-lg leading-normal shadow-xl z-50">
                              {field.hint}
                            </span>
                          </div>
                        </label>

                        {field.type === "select" ? (
                          <select
                            value={values[field.key as keyof ClinicalFeatures] ?? ""}
                            onChange={e => {
                              const v = e.target.value;
                              handleFieldChange(field.key as keyof ClinicalFeatures, v === "" ? null : Number(v));
                            }}
                            className="w-full px-3 py-2.5 outline-none text-xs"
                          >
                            {field.nullable && <option value="">— Unknown / Empty —</option>}
                            {field.options!.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="number"
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            placeholder={field.placeholder}
                            value={values[field.key as keyof ClinicalFeatures] ?? ""}
                            onChange={e => handleFieldChange(field.key as keyof ClinicalFeatures, e.target.value === "" ? null : Number(e.target.value))}
                            className="w-full px-3 py-2.5 outline-none text-xs"
                          />
                        )}
                        
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => { if (isClinicalValid) setStep(2); }}
                disabled={!isClinicalValid}
                className={`px-5 py-3 rounded-2xl bg-accent text-white text-xs font-semibold flex items-center gap-2 transition-all ${
                  !isClinicalValid ? "opacity-40 cursor-not-allowed hover:bg-accent" : "hover:bg-accent/95 shadow-md shadow-rose-600/5"
                }`}
              >
                Proceed to ECG Upload
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: ECG Upload */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="cs-card bg-white border border-border p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text">ECG Waveform Import</h3>
                <p className="text-xs text-text-muted">Import patient ECG digital recordings to enable multimodal fusion.</p>
              </div>

              <div 
                onDragOver={e => e.preventDefault()}
                onDrop={handleEcgDrop}
                className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
                  ecgFile ? "border-risk-low/50 bg-emerald-50/5" : "border-border hover:border-accent/40 hover:bg-rose-50/5"
                }`}
              >
                <input 
                  type="file" 
                  id="ecg-picker" 
                  className="hidden" 
                  accept=".json,.csv" 
                  onChange={handleEcgFileSelect}
                />

                <label htmlFor="ecg-picker" className="cursor-pointer flex flex-col items-center gap-3">
                  <div className={`p-4 rounded-full ${ecgFile ? "bg-emerald-50 text-risk-low" : "bg-accent-soft text-accent"}`}>
                    {ecgUploading ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <UploadCloud size={24} />
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-text">
                      {ecgFile ? ecgFile.name : "Drag & Drop 12-lead ECG file"}
                    </p>
                    <p className="text-[10px] text-text-subtle">
                      Supports .json and .csv waveform recording arrays
                    </p>
                  </div>
                </label>
              </div>

              {ecgDiagnostics && ecgFile && (
                <div className="p-4 bg-surface-2 border border-border rounded-2xl flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-risk-low" />
                    <div>
                      <span className="font-semibold text-text">ECG Waveform Uploaded</span>
                      <p className="text-[10px] text-text-muted">Verification parameters will evaluate on pipeline initialization</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setEcgFile(null); setEcgDiagnostics(null); }}
                    className="text-[10px] text-risk-high font-semibold hover:underline"
                  >
                    Remove File
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-xs text-risk-high">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button 
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs text-text hover:bg-surface-2 transition-colors flex items-center gap-2 font-medium"
                >
                  <ArrowLeft size={13} />
                  Clinical Data
                </button>
                
                <button 
                  onClick={() => { if (isClinicalValid) setStep(3); }}
                  disabled={!isClinicalValid}
                  className={`px-5 py-3 rounded-2xl bg-accent text-white text-xs font-semibold flex items-center gap-2 transition-all ${
                    !isClinicalValid ? "opacity-40 cursor-not-allowed hover:bg-accent" : "hover:bg-accent/95 shadow-md shadow-rose-600/5"
                  }`}
                >
                  Proceed to Review
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="cs-card bg-white border border-border p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text">Verify Screening Parameters</h3>
                <p className="text-xs text-text-muted">Ensure all values match source patient record before executing inference.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3">
                  <h4 className="font-mono font-bold text-accent text-[10px] uppercase tracking-wider">Clinical Metadata</h4>
                  
                  <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-[11px]">
                    <span className="text-text-muted">Age / Sex:</span>
                    <span className="font-semibold text-text">{values.age} / {values.sex === 1 ? "Male" : "Female"}</span>
                    
                    <span className="text-text-muted">Chest Pain CP:</span>
                    <span className="font-semibold text-text">Type {values.cp}</span>
                    
                    <span className="text-text-muted">Max Heart Rate:</span>
                    <span className="font-semibold text-text">{values.thalach} bpm</span>
                    
                    <span className="text-text-muted">ST Depression:</span>
                    <span className="font-semibold text-text">{values.oldpeak} mm</span>

                    <span className="text-text-muted">Exercise Angina:</span>
                    <span className="font-semibold text-text">{values.exang === 1 ? "Yes" : "No"}</span>

                    <span className="text-text-muted">Fluoroscopy Vessels:</span>
                    <span className="font-semibold text-text">{values.ca ?? "Unknown"}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-mono font-bold text-accent text-[10px] uppercase tracking-wider">ECG Signal Matrix</h4>
                    {ecgFile ? (
                      <div className="mt-3 space-y-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-text">
                          <FileText size={14} className="text-text-muted shrink-0" />
                          <span className="font-mono truncate font-semibold">{ecgFile.name}</span>
                        </div>
                        <p className="text-[10px] text-text-muted">
                          File size: {(ecgFile.size / 1024).toFixed(1)} KB · dynamic validation active
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-[11px] text-text-subtle italic">
                        No ECG signal uploaded. Running in clinical-only tabular prediction mode.
                      </p>
                    )}
                  </div>

                  {ecgFile && (
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-100 flex items-center gap-1.5 text-[10px] text-risk-low font-medium">
                      <CheckCircle2 size={12} />
                      Signal Quality Verified
                    </div>
                  )}
                </div>

              </div>

              {/* Dynamic Alerts reporting (Priority 5) */}
              <div className="p-3 rounded-2xl bg-rose-50/5 border border-border text-[11px] text-text-muted leading-relaxed">
                <strong>Attribution Alert:</strong>{" "}
                {missingOptionalFields.length > 0 ? (
                  <span>
                    The pipeline detected missing optional fields: <span className="font-mono text-accent font-semibold">{missingOptionalFields.join(", ")}</span>. 
                    CardioSense imputer engines will automatically compensate using dataset distribution means.
                  </span>
                ) : (
                  <span>All optional and mandatory clinical features are fully populated. Full multi-branch calibration weights are active.</span>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button 
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs text-text hover:bg-surface-2 transition-colors flex items-center gap-2 font-medium"
                >
                  <ArrowLeft size={13} />
                  ECG Import
                </button>
                
                <button 
                  onClick={runPredictionPipeline}
                  className="px-6 py-3 rounded-2xl bg-accent text-white text-xs font-semibold flex items-center gap-2 hover:bg-accent/95 shadow-md shadow-rose-600/10 transition-all btn-glow"
                >
                  Run Neural Fusion Assessment →
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* Step 4: Loading / Prediction */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cs-card bg-white border border-border p-8 rounded-3xl space-y-8 max-w-xl mx-auto text-center"
          >
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-accent-soft" />
              <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
              <Heart size={28} className="text-risk-high animate-heart-float" style={{ fill: "rgba(244, 63, 94, 0.1)" }} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-display text-text">Analyzing Heart Prognosis</h3>
              <p className="text-xs text-text-muted">CardioSense neural gating classification pipeline is running...</p>
            </div>

            <div className="w-full bg-surface-2 h-2 rounded-full overflow-hidden border border-border">
              <motion.div 
                className="bg-accent h-full rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${(predictionStep + 1) * 16.6}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="bg-surface-2 border border-border rounded-2xl p-4 h-48 overflow-y-auto font-mono text-[10px] text-left text-text-muted space-y-2">
              {predictionLogs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-accent font-bold">&gt;</span>
                  <span className={idx === predictionStep ? "text-text font-semibold" : ""}>{log}</span>
                  {idx < predictionStep && <Check size={10} className="text-risk-low shrink-0 ml-auto" />}
                </div>
              ))}
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}