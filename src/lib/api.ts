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

// ── Token helpers ────────────────────────────────────────────────

export const getToken = () => {
  if (typeof window === "undefined") return null;
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
  if (typeof window === "undefined") return null;
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

// ── Assessment API ────────────────────────────────────────────

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

// ── Insights Metrics API — live from backend ─────────────────────

async function insightsFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Insights fetch failed: ${res.status}`);
  return res.json();
}

export async function getCalibration(): Promise<CalibrationMetrics> {
  return insightsFetch<CalibrationMetrics>("/insights/calibration");
}

export async function getModelComparison() {
  return insightsFetch<{ rule: string; results: object[]; locked_best: object }>(
    "/insights/model-comparison"
  );
}

export async function getBootstrapCI(): Promise<{ n_bootstrap: number; results: BootstrapCI[]; note: string }> {
  return insightsFetch("/insights/bootstrap-ci");
}


// ── CardioBot Chat API ────────────────────────────────────────────

export interface ChatMessagePayload {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessagePayload[];
  assessment_id?: string | null;
}

/**
 * Streams CardioBot response from POST /chat.
 * Calls onChunk(text) for each streamed token.
 * Calls onDone() when stream completes.
 * Returns void — caller manages message state.
 */
export async function sendChatMessage(
  request: ChatRequest,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  const token = getToken();
  let res: Response;

  try {
    res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token || ""}`,
      },
      body: JSON.stringify(request),
    });
  } catch {
    onError("Network error — is the backend running?");
    return;
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    onError(errData.detail || `Server error ${res.status}`);
    return;
  }

  if (!res.body) {
    onError("Streaming not supported by this browser.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(data);
        if (parsed.error) { onError(parsed.error); return; }
        if (parsed.content) onChunk(parsed.content);
      } catch { /* skip malformed */ }
    }
  }
  onDone();
}
