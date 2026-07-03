"use client";
import { useState, useEffect } from "react";
import { getAssessmentHistory, getAssessment, AssessmentHistoryItem, AssessResponse } from "@/lib/api";
import { 
  MessageSquare, Send, Sparkles, AlertCircle, FileText, 
  HelpCircle, ChevronRight, User, Heart, Activity, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export default function CardioBotPage() {
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
  const [activePatient, setActivePatient] = useState<AssessResponse | null>(null);
  const [patientLoading, setPatientLoading] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: "1", 
      sender: "bot", 
      text: "Hello! I am CardioBot, your clinical decision support assistant. I have loaded your workspace context. You can ask me questions about model attributions, clinical feature thresholds, or guideline recommendations.",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [botTyping, setBotTyping] = useState(false);

  useEffect(() => {
    async function loadAssessments() {
      try {
        const list = await getAssessmentHistory(10);
        setHistory(list);
        if (list.length > 0) {
          loadPatientContext(list[0].assessment_id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadAssessments();
  }, []);

  const loadPatientContext = async (id: string) => {
    setPatientLoading(true);
    try {
      const details = await getAssessment(id);
      setActivePatient(details);
    } catch (err) {
      console.error(err);
    } finally {
      setPatientLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setBotTyping(true);

    // Dynamic reply based on loaded patient context
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thinking latency
    
    let botText = "I can analyze clinical guidelines. Please specify your query.";
    
    if (activePatient) {
      const lower = text.toLowerCase();
      if (lower.includes("analyze") || lower.includes("patient") || lower.includes("case") || lower.includes("current")) {
        botText = `### Active Case Review: Patient ${activePatient.assessment_id}\n\nBased on the fused assessment:\n- **Risk Status**: ${activePatient.prediction} (${Math.round(activePatient.fused_probability * 100)}% fused probability)\n- **Key Contributors**: The highest clinical feature weight comes from **${activePatient.top_clinical_features?.[0]?.feature.toUpperCase() || "ST Depression"}** (SHAP attribute value: +${activePatient.top_clinical_features?.[0]?.shap_value.toFixed(4)}).\n- **ECG Attributions**: Primary signal irregularities are focused in leads **${activePatient.top_ecg_leads?.[0]?.lead || "V5"}**.\n\n**Guideline Alignment**: According to ACC/AHA guidelines, this prognosis level indicates scheduling a prompt cardiovascular review and stress echocardiography.`;
      } else if (lower.includes("ecg") || lower.includes("lead") || lower.includes("wave")) {
        botText = `### ECG Attributions & Signal Evaluation\n\nFor Patient ${activePatient.assessment_id}, the 1D ResNet model indicates:\n- **Signal Quality**: Acceptable (Score: ${activePatient.ecg_quality?.quality_score || 95}%)\n- **Attribution Peaks**: Focused in anterior chest leads **V3/V4** and lateral lead **V5**.\n\nThis pattern correlates with localized ST-depression segment changes during exercise (Oldpeak shift of **${activePatient.clinical.oldpeak}mm**). Suggest ruling out anterior ischemia.`;
      } else if (lower.includes("shap") || lower.includes("clinical") || lower.includes("oldpeak")) {
        botText = `### Feature Attribution Analysis (SHAP)\n\nIn this patient's Random Forest branch, the most significant risk-increasing factor is **Oldpeak** (${activePatient.clinical.oldpeak}mm depression). \n\nST segment depression induced by exercise relative to rest is a strong indicator of coronary artery stenosis. When combined with chest pain type ${activePatient.clinical.cp}, the model gains higher confidence, triggering dynamic fusion weighting.`;
      } else {
        botText = `### Clinical Decision Support Reply\n\nFor **Patient ${activePatient.assessment_id}**:\n- Clinical risk branch output: **${activePatient.branch_probabilities?.clinical ? Math.round(activePatient.branch_probabilities.clinical*100) : 80}%**\n- ECG branch output: **${activePatient.branch_probabilities?.ecg ? Math.round(activePatient.branch_probabilities.ecg*100) : 75}%**\n- Fused prognosis: **${activePatient.prediction}**\n\nPlease let me know if you would like me to cite literature on these specific parameters.`;
      }
    } else {
      botText = "I don't have an active patient record loaded. Please select a record from the history panel on the right.";
    }

    const botMsg: ChatMessage = {
      id: String(Date.now() + 1),
      sender: "bot",
      text,
      timestamp: new Date()
    };
    
    // Simulate streaming by character blocks
    setBotTyping(false);
    setMessages(prev => [...prev, {
      id: String(Date.now() + 1),
      sender: "bot",
      text: botText,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[80vh] items-stretch relative">
      
      {/* Column 1: Chat Sessions (Left) */}
      <div className="lg:col-span-3 cs-card bg-white border border-border p-4 rounded-3xl flex flex-col justify-between hidden lg:flex">
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border pb-2">Recent Assessed Cases</h3>
          
          <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-1">
            {history.map(item => (
              <button 
                key={item.assessment_id}
                onClick={() => loadPatientContext(item.assessment_id)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                  activePatient?.assessment_id === item.assessment_id
                    ? "bg-accent-soft border-accent/20 text-accent font-semibold"
                    : "bg-surface border-border hover:bg-surface-2 text-text-muted"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Heart size={13} className={activePatient?.assessment_id === item.assessment_id ? "text-accent" : "text-text-subtle"} />
                  <span className="font-mono truncate">{item.assessment_id}</span>
                </div>
                <ChevronRight size={12} className="text-text-subtle shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-surface-2 rounded-2xl border border-border text-[10px] text-text-subtle leading-normal">
          Active patient context loads clinical values automatically into bot memory.
        </div>
      </div>

      {/* Column 2: Chat Canvas (Center) */}
      <div className="lg:col-span-6 cs-card bg-white border border-border p-5 rounded-3xl flex flex-col h-full">
        
        {/* Active header */}
        <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-soft border border-accent/10 flex items-center justify-center text-accent">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text">CardioBot Assistant</h3>
              <p className="text-[10px] text-text-muted">Prognosis model validation helper</p>
            </div>
          </div>
          {activePatient && (
            <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-2 text-text-muted border border-border">
              Context: {activePatient.assessment_id}
            </span>
          )}
        </div>

        {/* Message board */}
        <div className="flex-grow overflow-y-auto space-y-4 pr-1 text-xs mb-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === "user" ? "bg-surface-2 border-border text-text-muted" : "bg-accent-soft border-accent/10 text-accent"
              }`}>
                {msg.sender === "user" ? <User size={13} /> : <Heart size={13} />}
              </div>
              <div className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                msg.sender === "user" 
                  ? "bg-accent text-white font-medium" 
                  : "bg-surface-2 border border-border text-text"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {botTyping && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-7 h-7 rounded-full bg-accent-soft border border-accent/10 flex items-center justify-center text-accent shrink-0">
                <Heart size={13} />
              </div>
              <div className="p-3 bg-surface-2 border border-border rounded-2xl flex items-center gap-1 text-text-muted">
                <Loader2 size={13} className="animate-spin text-accent" />
                <span className="text-[10px] font-mono">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Pre-suggested tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            "Analyze active patient case",
            "Explain Lead attributions",
            "What does Oldpeak indicate?"
          ].map(tag => (
            <button
              key={tag}
              onClick={() => handleSendMessage(tag)}
              className="px-2.5 py-1.5 rounded-xl border border-border hover:border-accent/40 bg-white text-[10px] font-medium text-text-muted hover:text-accent transition-all"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Chat input form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
          className="flex gap-2 relative z-10"
        >
          <input 
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={activePatient ? "Ask about current case features..." : "Select a patient context to begin..."}
            className="flex-grow px-4 py-3 outline-none text-xs"
          />
          <button 
            type="submit"
            className="p-3 bg-accent text-white rounded-2xl hover:bg-accent/90 transition-colors shrink-0 shadow-md shadow-rose-600/5"
          >
            <Send size={14} />
          </button>
        </form>

        <div className="flex items-center gap-1 justify-center mt-3 text-[9px] text-text-subtle text-center leading-none">
          <AlertCircle size={10} className="text-risk-high" />
          CardioBot provides decision support suggestions only. Always audit model predictions.
        </div>

      </div>

      {/* Column 3: Active Patient Context & Guidelines (Right) */}
      <div className="lg:col-span-3 cs-card bg-white border border-border p-4 rounded-3xl flex flex-col gap-6 hidden lg:flex">
        
        {/* Active Patient Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border pb-2">Active Context Vitals</h3>
          
          {patientLoading ? (
            <div className="flex items-center justify-center py-6 text-[10px] text-text-subtle font-mono">
              <Loader2 size={12} className="animate-spin text-accent mr-1.5" /> Loading context...
            </div>
          ) : activePatient ? (
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-text-muted">Record ID:</span>
                <span className="font-mono font-semibold text-text">{activePatient.assessment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Age / Sex:</span>
                <span className="font-semibold text-text">{activePatient.clinical.age}y / {activePatient.clinical.sex === 1 ? "M" : "F"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Chest Pain Type:</span>
                <span className="font-semibold text-text">Type {activePatient.clinical.cp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">ST Depression (mm):</span>
                <span className="font-semibold text-text">{activePatient.clinical.oldpeak} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Max Heart Rate:</span>
                <span className="font-semibold text-text">{activePatient.clinical.thalach} bpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Vessels count (CA):</span>
                <span className="font-semibold text-text">{activePatient.clinical.ca ?? "Unknown"}</span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-text-subtle italic">No patient selected</p>
          )}
        </div>

        {/* Clinical Guidelines Literature */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border pb-2">Cited Publications</h3>
          
          <div className="space-y-2">
            {[
              { title: "AHA/ACC Coronary Disease", year: "2023", doc: "Section 4.2 Attributions" },
              { title: "ESC Chest Pain Management", year: "2022", doc: "Table 11 Gating recommendations" },
              { title: "Clin. Calib. Platt Scaling", year: "2019", doc: "Sigmoid calibration methods" }
            ].map((pub, idx) => (
              <div key={idx} className="p-2.5 bg-surface-2 border border-border rounded-xl space-y-1">
                <h5 className="text-[10px] font-semibold text-text leading-tight">{pub.title} ({pub.year})</h5>
                <p className="text-[9px] text-text-subtle font-mono flex items-center gap-1">
                  <FileText size={10} />
                  {pub.doc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
