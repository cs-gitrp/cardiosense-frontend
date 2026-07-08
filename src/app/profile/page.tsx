"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getAssessmentHistory, clearToken } from "@/lib/api";
import { 
  User, Database, Trash2, Download, Loader2, Info, Heart
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [exporting, setExporting] = useState(false);
  const [clearingDb, setClearingDb] = useState(false);

  // Compiles authentic history array straight from PostgreSQL database endpoint (Priority Data Ops)
  const handleExportJSON = async () => {
    setExporting(true);
    try {
      const liveHistory = await getAssessmentHistory(100);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(liveHistory, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `CardioSense_Registry_Export.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Database backup loop aborted:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleResetDb = async () => {
    if (!confirm("WARNING: This will log out your active user instance and clear local secure workspace tokens. This action cannot be undone. Proceed?")) return;
    
    setClearingDb(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    clearToken();
    localStorage.removeItem("cs_user");
    setClearingDb(false);
    
    logout();
    router.push("/");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 relative py-4">
      
      {/* Glow asset background */}
      <div className="absolute top-[-5%] left-[-5%] w-72 h-72 rounded-full bg-rose-100/10 blur-3xl pointer-events-none" />

      {/* Profile Header section */}
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="font-display text-2xl text-text flex items-center justify-center sm:justify-start gap-2">
          <User size={20} className="text-accent" />
          Settings & Profile
        </h1>
        <p className="text-xs text-text-muted">Review authenticated researcher credentials and manage localized workspace logs.</p>
      </div>

      <div className="space-y-6">
        
        {/* User Identity Panel Section */}
        <div className="cs-card bg-white border border-border p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-16 h-16 bg-gradient-to-tr from-rose-400 to-coral-500 rounded-full flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-md shrink-0">
            {user?.full_name ? user.full_name.split(" ").pop()?.charAt(0).toUpperCase() : "S"}
          </div>
          <div className="space-y-1.5 flex-grow">
            <h3 className="text-base font-semibold text-text">{user?.full_name || "Research Clinician"}</h3>
            <p className="text-xs font-mono text-text-muted">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-3 text-text-muted border border-border">
                RESEARCH WORKSPACE
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-risk-low border border-emerald-100 flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-risk-low animate-pulse" />
                Session Secure (JWT)
              </span>
            </div>
          </div>
        </div>

        {/* Data Operations Panel Section */}
        <div className="cs-card bg-white border border-border p-6 rounded-3xl space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border pb-2 flex items-center gap-1.5">
            <Database size={13} />
            Data Operations
          </h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Manage your localized workspace parameters. Exporting downloads verified patient metadata compiled straight from your active network history registers.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button 
              onClick={handleExportJSON}
              disabled={exporting}
              className="py-2.5 rounded-xl border border-border bg-white text-xs font-semibold text-text hover:bg-surface-2 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              Export Screening Registry (JSON)
            </button>

            <button 
              onClick={handleResetDb}
              disabled={clearingDb}
              className="py-2.5 rounded-xl border border-rose-100 hover:bg-rose-50 text-xs font-semibold text-risk-high transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {clearingDb ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Clear Diagnostic Workspace
            </button>
          </div>
        </div>

        {/* Compliance Notice Legal Guardrail section */}
        <div className="p-4 bg-rose-50/10 border border-border rounded-2xl flex items-start gap-3 text-xs text-text-muted leading-relaxed">
          <Info size={15} className="text-accent shrink-0 mt-0.5" />
          <p>
            <strong>Research Compliance Safeguard:</strong> CardioSense AI is a research-grade pipeline demonstration aid. It is not an FDA-cleared diagnostic terminal and must not be utilized for live clinical treatment or therapeutic decision-making matrices.
          </p>
        </div>

      </div>

    </div>
  );
}