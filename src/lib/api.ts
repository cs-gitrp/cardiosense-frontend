/**
 * CardioSense AI - Pure Frontend Mock API client
 * Simulates all API operations via localStorage to allow
 * 100% functional client-side demo (History, Assessment, Auth, etc.).
 */

// ── Types ────────────────────────────────────────────────────────

export interface ClinicalFeatures {
  cp: number;
  exang: number;
  ca: number | null;
  sex: number;
  chol_missing: number;
  slope_missing: number;
  thal: number | null;
  thalach: number;
  age: number;
  oldpeak: number;
  fbs: number;
}

export interface AssessRequest {
  clinical: ClinicalFeatures;
  ecg_filename?: string;
  ecg_signal?: number[] | null;
}

export interface BranchContribution {
  clinical_pct: number;
  ecg_pct: number;
}

export interface AssessResponse {
  assessment_id: string;
  prediction: "Disease" | "No Disease";
  fused_probability: number;
  severity: string | null;
  severity_source: string | null;
  confidence: number;
  branch_contribution: BranchContribution | null;
  branch_probabilities: { clinical: number; ecg: number | null } | null;
  top_clinical_features: Array<{ feature: string; shap_value: number }> | null;
  top_ecg_leads: Array<{ lead: string; attribution: number }> | null;
  ecg_quality: { quality_score: number; flags: string[]; is_acceptable: boolean } | null;
  recommendations: string[] | null;
  feature_missingness_map: Record<string, boolean> | null;
  disclaimer: string;
  created_at: string;
  clinical: ClinicalFeatures;
}

export interface AssessmentHistoryItem {
  assessment_id: string;
  prediction: string;
  fused_probability: number;
  severity: string | null;
  created_at: string;
}

export interface CalibrationMetrics {
  clinical: { auc: number; brier_score: number; expected_calibration_error: number };
  ecg:      { auc: number; brier_score: number; expected_calibration_error: number };
  note: string;
}

export interface BootstrapCI {
  branch: string;
  metric: string;
  mean: number;
  std: number;
  ci_lower: number;
  ci_upper: number;
}

// ── Sample Init Data ─────────────────────────────────────────────

const MOCK_USER = {
  id: "doc_123",
  email: "dr.jenkins@cardiosense.ai",
  full_name: "Dr. Sarah Jenkins, MD"
};

const INITIAL_ASSESSMENTS: AssessResponse[] = [
  {
    assessment_id: "cs_81a2f3",
    prediction: "Disease",
    fused_probability: 0.84,
    severity: "High",
    severity_source: "Fused",
    confidence: 0.94,
    branch_contribution: { clinical_pct: 65, ecg_pct: 35 },
    branch_probabilities: { clinical: 0.88, ecg: 0.77 },
    top_clinical_features: [
      { feature: "cp", shap_value: 0.28 },
      { feature: "oldpeak", shap_value: 0.19 },
      { feature: "thalach", shap_value: -0.12 },
      { feature: "age", shap_value: 0.08 }
    ],
    top_ecg_leads: [
      { lead: "V5", attribution: 0.35 },
      { lead: "V6", attribution: 0.28 },
      { lead: "II", attribution: 0.18 },
      { lead: "I", attribution: 0.09 }
    ],
    ecg_quality: { quality_score: 96, flags: [], is_acceptable: true },
    recommendations: [
      "Refer for coronary angiography due to high fused probability and ST segment depression.",
      "Optimize beta-blocker therapy to control maximum heart rate response.",
      "Schedule echocardiogram to evaluate left ventricular function."
    ],
    feature_missingness_map: { cp: false, exang: false, ca: false, sex: false, chol_missing: false, slope_missing: false },
    disclaimer: "Research prototype. Not a medical device. Not for clinical use.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    clinical: {
      age: 62, sex: 1, cp: 0, thalach: 142, exang: 1, oldpeak: 2.3, fbs: 1, thal: 3, ca: 2, chol_missing: 0, slope_missing: 0
    }
  },
  {
    assessment_id: "cs_19f3b5",
    prediction: "No Disease",
    fused_probability: 0.15,
    severity: "Low",
    severity_source: "Fused",
    confidence: 0.91,
    branch_contribution: { clinical_pct: 50, ecg_pct: 50 },
    branch_probabilities: { clinical: 0.12, ecg: 0.18 },
    top_clinical_features: [
      { feature: "cp", shap_value: -0.22 },
      { feature: "thalach", shap_value: 0.15 },
      { feature: "exang", shap_value: -0.14 },
      { feature: "oldpeak", shap_value: -0.11 }
    ],
    top_ecg_leads: [
      { lead: "I", attribution: 0.04 },
      { lead: "aVL", attribution: 0.02 },
      { lead: "V2", attribution: -0.05 }
    ],
    ecg_quality: { quality_score: 98, is_acceptable: true, flags: [] },
    recommendations: [
      "Regular cardiovascular health checkup in 12 months.",
      "Encourage continued aerobic exercise and mediterranean diet plan.",
      "Screen lipid panel at next annual wellness visit."
    ],
    feature_missingness_map: null,
    disclaimer: "Research prototype. Not a medical device. Not for clinical use.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // 28 hours ago
    clinical: {
      age: 45, sex: 0, cp: 2, thalach: 172, exang: 0, oldpeak: 0.0, fbs: 0, thal: 2, ca: 0, chol_missing: 0, slope_missing: 0
    }
  },
  {
    assessment_id: "cs_53d8c1",
    prediction: "Disease",
    fused_probability: 0.93,
    severity: "Critical",
    severity_source: "ECG",
    confidence: 0.97,
    branch_contribution: { clinical_pct: 40, ecg_pct: 60 },
    branch_probabilities: { clinical: 0.76, ecg: 0.96 },
    top_clinical_features: [
      { feature: "oldpeak", shap_value: 0.32 },
      { feature: "ca", shap_value: 0.24 },
      { feature: "cp", shap_value: 0.18 },
      { feature: "thalach", shap_value: -0.09 }
    ],
    top_ecg_leads: [
      { lead: "V3", attribution: 0.44 },
      { lead: "V4", attribution: 0.41 },
      { lead: "V2", attribution: 0.38 },
      { lead: "V5", attribution: 0.22 }
    ],
    ecg_quality: { quality_score: 91, is_acceptable: true, flags: ["Subtle baseline wander"] },
    recommendations: [
      "IMMEDIATE cardiovascular consultation. ECG indicates critical ST-elevation / acute ischemia patterns in anterior chest leads V2-V4.",
      "Initiate anti-platelet and statin therapies if not contraindicated.",
      "Admit to cardiac monitoring ward for troponin screening and surveillance."
    ],
    feature_missingness_map: null,
    disclaimer: "Research prototype. Not a medical device. Not for clinical use.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 74).toISOString(), // 3 days ago
    clinical: {
      age: 68, sex: 1, cp: 0, thalach: 110, exang: 1, oldpeak: 3.2, fbs: 0, thal: 3, ca: 3, chol_missing: 0, slope_missing: 0
    }
  }
];

// Helper to initialize local storage
function initializeStorage() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("cs_assessments")) {
    localStorage.setItem("cs_assessments", JSON.stringify(INITIAL_ASSESSMENTS));
  }
  if (!localStorage.getItem("cs_token") && localStorage.getItem("cs_logged_in") === "true") {
    localStorage.setItem("cs_token", "mock_auth_token_123");
  }
}

// ── Token helpers ────────────────────────────────────────────────

export const getToken = () => {
  if (typeof window === "undefined") return null;
  initializeStorage();
  return localStorage.getItem("cs_token");
};

export const setToken = (t: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("cs_token", t);
  localStorage.setItem("cs_logged_in", "true");
};

export const clearToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cs_token");
  localStorage.setItem("cs_logged_in", "false");
};

// ── Auth API ─────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function register(email: string, password: string, full_name?: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, full_name }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Registration failed");
  }
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Incorrect email or password.");
  }
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function getMe() {
  if (typeof window === "undefined") return MOCK_USER;
  initializeStorage();
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch user details");
  }
  const user = await res.json();
  localStorage.setItem("cs_user", JSON.stringify(user));
  return user;
}

// ── Assessment API ───────────────────────────────────────────────

export async function createAssessment(payload: AssessRequest): Promise<AssessResponse> {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate deep model inference latency
  
  initializeStorage();
  
  // Calculate mock predictions based on clinical data values (to keep it interactive and logical)
  const score = 
    (payload.clinical.age > 60 ? 2 : 0) +
    (payload.clinical.sex === 1 ? 1 : 0) +
    (payload.clinical.cp === 0 ? 3 : 0) +
    (payload.clinical.exang === 1 ? 2 : 0) +
    (payload.clinical.oldpeak > 1.5 ? 3 : 0) +
    (payload.clinical.ca && payload.clinical.ca > 0 ? 2 : 0);
  
  // Probability calculations
  const rawProb = Math.min(0.99, Math.max(0.05, score / 12));
  // Add some random wobble
  const clinicalProb = Math.min(0.98, Math.max(0.02, rawProb + (Math.random() - 0.5) * 0.08));
  
  // If ECG is uploaded
  const hasECG = !!payload.ecg_filename;
  const ecgProb = hasECG 
    ? Math.min(0.97, Math.max(0.03, rawProb + (Math.random() - 0.5) * 0.12))
    : null;
  
  // Confidence-adaptive weight
  let fusedProb = clinicalProb;
  let clinicalPct = 100;
  let ecgPct = 0;
  let confidence = 0.90;
  
  if (hasECG && ecgProb !== null) {
    // Fused weight calculation: if ecg is high quality, give it good weight
    clinicalPct = 55;
    ecgPct = 45;
    fusedProb = clinicalProb * (clinicalPct / 100) + ecgProb * (ecgPct / 100);
    confidence = 0.93 + Math.random() * 0.05;
  }
  
  const prediction = fusedProb >= 0.45 ? "Disease" : "No Disease";
  
  let severity = "Low";
  if (prediction === "Disease") {
    if (fusedProb >= 0.8) severity = "Critical";
    else if (fusedProb >= 0.6) severity = "High";
    else severity = "Moderate";
  }
  
  const randomId = "cs_" + Math.random().toString(36).substr(2, 6);
  
  // Custom SHAP and ECG lead attributions
  const shap_values = [
    { feature: "cp", shap_value: prediction === "Disease" ? 0.25 * Math.random() : -0.2 * Math.random() },
    { feature: "oldpeak", shap_value: payload.clinical.oldpeak > 1.5 ? 0.28 : -0.1 },
    { feature: "thalach", shap_value: payload.clinical.thalach < 130 ? 0.18 : -0.15 },
    { feature: "ca", shap_value: payload.clinical.ca ? 0.22 : -0.05 },
    { feature: "exang", shap_value: payload.clinical.exang === 1 ? 0.19 : -0.12 },
    { feature: "age", shap_value: 0.05 * (payload.clinical.age - 50) / 10 }
  ];

  const ecg_leads = hasECG ? [
    { lead: "V3", attribution: fusedProb > 0.6 ? 0.35 : 0.08 },
    { lead: "V4", attribution: fusedProb > 0.6 ? 0.33 : 0.07 },
    { lead: "II", attribution: 0.12 },
    { lead: "V5", attribution: 0.22 },
    { lead: "aVL", attribution: 0.05 }
  ] : null;

  const recommendations = prediction === "Disease"
    ? [
        "Schedule standard coronary angiogram within 2 weeks.",
        "Consider optimization of anti-ischemic pharmacological therapy.",
        "Recommend patient monitoring with portable cardiac event recorder."
      ]
    : [
        "No acute ischemic markers detected. Standard follow-up in 12 months.",
        "Encourage regular physical activity and smoking cessation if applicable.",
        "Re-evaluate if typical symptoms recur under exertion."
      ];

  const result: AssessResponse = {
    assessment_id: randomId,
    prediction,
    fused_probability: fusedProb,
    severity,
    severity_source: hasECG ? (Math.random() > 0.5 ? "ECG" : "Fused") : "Clinical",
    confidence,
    branch_contribution: { clinical_pct: clinicalPct, ecg_pct: ecgPct },
    branch_probabilities: { clinical: clinicalProb, ecg: ecgProb },
    top_clinical_features: shap_values,
    top_ecg_leads: ecg_leads,
    ecg_quality: hasECG ? { quality_score: 95, flags: [], is_acceptable: true } : null,
    recommendations,
    feature_missingness_map: {
      ca: payload.clinical.ca === null,
      thal: payload.clinical.thal === null,
      cp: false, sex: false, age: false, oldpeak: false, thalach: false
    },
    disclaimer: "Research prototype. Not a medical device. Not for clinical use.",
    created_at: new Date().toISOString(),
    clinical: payload.clinical
  };

  // Save to localStorage list
  const history = localStorage.getItem("cs_assessments");
  const list = history ? JSON.parse(history) : [];
  list.unshift(result);
  localStorage.setItem("cs_assessments", JSON.stringify(list));
  
  return result;
}

export async function getAssessmentHistory(limit = 20, offset = 0): Promise<AssessmentHistoryItem[]> {
  const token = getToken();
  const res = await fetch(`${API_URL}/assess/history?limit=${limit}&offset=${offset}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token || ""}`,
    },
  });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function getAssessment(id: string): Promise<AssessResponse> {
  const token = getToken();
  const res = await fetch(`${API_URL}/assess/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token || ""}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Assessment not found");
  }
  return res.json();
}

export async function deleteAssessment(id: string): Promise<boolean> {
  const token = getToken();
  const res = await fetch(`${API_URL}/assess/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token || ""}`,
    },
  });
  return res.ok;
}

// ── Insights Metrics API ─────────────────────────────────────────

export async function getCalibration(): Promise<CalibrationMetrics> {
  return {
    clinical: { auc: 0.9266, brier_score: 0.1142, expected_calibration_error: 0.0384 },
    ecg:      { auc: 0.9424, brier_score: 0.0985, expected_calibration_error: 0.0212 },
    note: "Calibration calculated over 1,280 test patients using Platt scaling (sigmoid mapping)."
  };
}

export async function getModelComparison() {
  return {
    rule: "confidence-adaptive fusion gating threshold = 0.45",
    results: [
      { model: "Clinical RF (Baseline)", auc: 0.892, sensitivity: 0.814, specificity: 0.842 },
      { model: "ECG ResNet1D (Baseline)", auc: 0.915, sensitivity: 0.840, specificity: 0.871 },
      { model: "CardioSense Fused (No Calibration)", auc: 0.932, sensitivity: 0.882, specificity: 0.895 },
      { model: "CardioSense Fused (Calibrated)", auc: 0.958, sensitivity: 0.912, specificity: 0.924 }
    ],
    locked_best: { model: "CardioSense Fused (Calibrated)", auc: 0.958 }
  };
}

export async function getBootstrapCI(): Promise<{ n_bootstrap: number; results: BootstrapCI[]; note: string }> {
  return {
    n_bootstrap: 1000,
    results: [
      { branch: "Clinical Branch", metric: "AUC", mean: 0.9266, std: 0.012, ci_lower: 0.9031, ci_upper: 0.9501 },
      { branch: "ECG Branch", metric: "AUC", mean: 0.9424, std: 0.009, ci_lower: 0.9248, ci_upper: 0.9600 },
      { branch: "Fused Pipeline", metric: "AUC", mean: 0.9582, std: 0.007, ci_lower: 0.9445, ci_upper: 0.9719 }
    ],
    note: "95% bootstrap confidence intervals computed over 1,000 resamples of test set (n=450)."
  };
}
