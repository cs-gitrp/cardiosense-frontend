"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getMe, clearToken } from "@/lib/api";
import { 
  User, Shield, Bell, Database, Server, RefreshCw, 
  Trash2, Download, Copy, Check, Eye, EyeOff, Loader2, Key
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // States
  const [apiKey, setApiKey] = useState("cs_live_9a8f23b1c5e6d7f8a9b0c1d2");
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [backendUrl, setBackendUrl] = useState("http://localhost:8000");
  const [savingBackend, setSavingBackend] = useState(false);
  const [clearingDb, setClearingDb] = useState(false);
  const [themeMode, setThemeMode] = useState("light");

  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    weeklyReports: false,
    modelUpdates: true
  });

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGenerateKey = () => {
    const newKey = "cs_live_" + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
    setApiKey(newKey);
  };

  const handleSaveBackend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBackend(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setSavingBackend(false);
  };

  const handleResetDb = async () => {
    if (!confirm("WARNING: This will clear all saved patient assessment records and reset the system database. This action is irreversible. Proceed?")) return;
    
    setClearingDb(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear local storage
    localStorage.removeItem("cs_assessments");
    localStorage.removeItem("cs_user");
    clearToken();
    setClearingDb(false);
    
    // Log out and redirect
    logout();
    router.push("/");
  };

  const handleExportJSON = () => {
    const data = localStorage.getItem("cs_assessments") || "[]";
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "CardioSense_Backup_Database.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      
      {/* Glow background */}
      <div className="absolute top-[-5%] left-[-5%] w-72 h-72 rounded-full bg-rose-100/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display text-2xl text-text flex items-center gap-2">
          <User size={20} className="text-accent" />
          Settings & Profile
        </h1>
        <p className="text-xs text-text-muted">Manage clinical keys, export datasets, and configure endpoints.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Doctor Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="cs-card bg-white border border-border p-6 rounded-3xl text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-tr from-rose-400 to-coral-500 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
              {user?.full_name?.split(" ").pop()?.charAt(0) || "S"}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-text">{user?.full_name || "Dr. Sarah Jenkins"}</h3>
              <p className="text-xs text-text-muted font-mono truncate">{user?.email}</p>
            </div>
            <div className="pt-2 border-t border-border flex justify-around text-center text-xs">
              <div>
                <span className="text-[10px] text-text-subtle font-mono">CREDENTIALS</span>
                <p className="font-semibold text-text">MD, FACC</p>
              </div>
              <div>
                <span className="text-[10px] text-text-subtle font-mono">WORKSPACE</span>
                <p className="font-semibold text-text">Research</p>
              </div>
            </div>
          </div>

          {/* Database management tools */}
          <div className="cs-card space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border pb-2 flex items-center gap-1.5">
              <Database size={13} />
              Data Operations
            </h4>
            
            <div className="space-y-2 text-xs">
              <button 
                onClick={handleExportJSON}
                className="w-full py-2.5 rounded-xl border border-border bg-white text-text font-medium hover:bg-surface-2 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={13} />
                Export Database (JSON)
              </button>

              <button 
                onClick={handleResetDb}
                disabled={clearingDb}
                className="w-full py-2.5 rounded-xl border border-rose-100 hover:bg-rose-50 text-risk-high font-medium transition-colors flex items-center justify-center gap-2"
              >
                {clearingDb ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
                Reset Local Database
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Configuration panels */}
        <div className="md:col-span-2 space-y-6">
          
          {/* API Keys (Security) */}
          <div className="cs-card bg-white border border-border p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-semibold text-text flex items-center gap-2 border-b border-border pb-3">
              <Shield size={15} className="text-accent" />
              API Security & Integration Keys
            </h4>

            <div className="space-y-4 text-xs">
              <p className="text-text-muted leading-relaxed">
                Use clinical keys to authenticate automated script requests. Keep this secret.
              </p>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-muted">Live Integration Key</label>
                <div className="relative flex items-center bg-surface-2 border border-border rounded-xl px-3 py-2.5 font-mono text-xs">
                  <input 
                    type={showKey ? "text" : "password"} 
                    value={apiKey} 
                    readOnly
                    className="bg-transparent border-0 text-text outline-none flex-grow mr-10 font-mono py-0 text-xs w-full focus:ring-0 focus:shadow-none"
                    style={{ background: "none!important", border: "0!important", boxShadow: "none!important" }}
                  />
                  <div className="absolute right-3 flex items-center gap-2">
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="text-text-subtle hover:text-text-muted transition-colors"
                    >
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button 
                      onClick={handleCopyKey}
                      className="text-text-subtle hover:text-text-muted transition-colors"
                    >
                      {copiedKey ? <Check size={14} className="text-risk-low" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerateKey}
                className="px-3.5 py-2 rounded-xl bg-surface border border-border font-medium hover:bg-surface-2 transition-colors flex items-center gap-2"
              >
                <Key size={13} />
                Generate New Key
              </button>
            </div>
          </div>

          {/* Connected Backend (FastAPI Endpoint) */}
          <div className="cs-card bg-white border border-border p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-semibold text-text flex items-center gap-2 border-b border-border pb-3">
              <Server size={15} className="text-indigo-500" />
              Connected Pipeline Endpoint
            </h4>

            <form onSubmit={handleSaveBackend} className="space-y-4 text-xs">
              <p className="text-text-muted leading-relaxed">
                Connect the frontend to a running FastAPI backend instance containing weight models.
              </p>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-muted">FastAPI Service URL</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    value={backendUrl}
                    onChange={e => setBackendUrl(e.target.value)}
                    required
                    placeholder="http://localhost:8000"
                    className="flex-grow px-3 py-2 outline-none text-xs"
                  />
                  <button 
                    type="submit"
                    disabled={savingBackend}
                    className="px-4 py-2 bg-accent text-white font-semibold rounded-xl hover:bg-accent/95 flex items-center gap-1.5 shrink-0 shadow-md shadow-rose-600/5 transition-all"
                  >
                    {savingBackend && <Loader2 size={13} className="animate-spin" />}
                    Save
                  </button>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2 text-[11px] text-risk-low">
                <div className="w-2 h-2 rounded-full bg-risk-low animate-pulse shrink-0" />
                <span>Calibrated Gating Pipeline Connected (v1.4.2)</span>
              </div>
            </form>
          </div>

          {/* Notification toggles */}
          <div className="cs-card bg-white border border-border p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-semibold text-text flex items-center gap-2 border-b border-border pb-3">
              <Bell size={15} className="text-amber-500" />
              Diagnostic Alerts
            </h4>

            <div className="space-y-3 text-xs text-text-muted">
              {[
                { key: "criticalAlerts", label: "Critical Fused Risk Alerts", desc: "Notify immediately when patient fusion score exceeds critical threshold." },
                { key: "weeklyReports", label: "Weekly Calibration Audit", desc: "Receive summary recalibration Brier scores and ECE bounds." },
                { key: "modelUpdates", label: "Model Version Recalibrations", desc: "Notify when FastAPI updates dynamic branch classifiers." }
              ].map(opt => (
                <div key={opt.key} className="flex justify-between items-center gap-4 py-2 border-b border-border/5 last:border-b-0">
                  <div>
                    <span className="font-semibold text-text">{opt.label}</span>
                    <p className="text-[10px] text-text-subtle mt-0.5 leading-normal">{opt.desc}</p>
                  </div>
                  
                  {/* Toggle button */}
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof typeof notifications] }))}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors relative shrink-0 focus:outline-none ${
                      notifications[opt.key as keyof typeof notifications] ? "bg-accent" : "bg-surface-3"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      notifications[opt.key as keyof typeof notifications] ? "translate-x-4" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
