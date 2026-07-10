import Link from "next/link";
import { Heart, FileText, Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-20 py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="space-y-3 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-risk-high" />
              <span className="font-display text-lg tracking-tight text-text">
                CardioSense AI
              </span>
            </div>
            <p className="text-xs text-text-muted max-w-sm leading-relaxed">
              Advancing multi-modal cardiac diagnostics through Platt-calibrated fusion of clinical observations and 12-lead ECG signals. Designed for medical research validation.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="text-text-muted hover:text-accent transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/assess" className="text-text-muted hover:text-accent transition-colors">
                  Run Screening
                </Link>
              </li>
              <li>
                <Link href="/insights" className="text-text-muted hover:text-accent transition-colors">
                  Model Insights
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text">Research</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://github.com/cs-gitrp/cardiosense-backend/tree/main/research" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent transition-colors flex items-center gap-1.5">
                  <FileText size={12} /> Training Notebooks
                </a>
              </li>
              <li>
                <a href="https://github.com/cs-gitrp/cardiosense-backend" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent transition-colors flex items-center gap-1.5">
                  <Activity size={12} /> GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://github.com/cs-gitrp/cardiosense-backend/tree/main/research/notebooks/09-confidence-adaptive-fusion.ipynb" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent transition-colors flex items-center gap-1.5">
                  <Activity size={12} /> Calibration Protocol
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-text-subtle">
            &copy; {new Date().getFullYear()} CardioSense AI Inc. All rights reserved.
          </p>
          <div className="p-3 bg-risk-high/5 rounded-xl border border-risk-high/10 text-center max-w-xl">
            <p className="text-[10px] text-risk-high leading-normal">
              <strong>Research Disclaimer:</strong> CardioSense AI is a research demonstration prototype and is NOT cleared as a medical device for diagnostic or clinical evaluation. Not for patient care.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
