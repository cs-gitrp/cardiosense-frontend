"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Heart, Activity, Shield, BarChart3, ArrowRight, Zap, 
  Database, FileSpreadsheet, Play, CheckCircle, Quote 
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Custom stats counters
  const [assessmentsCount, setAssessmentsCount] = useState(0);
  useEffect(() => {
    const target = 920;
    const duration = 2000;
    const step = Math.ceil(target / (duration / 30));
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setAssessmentsCount(target);
        clearInterval(timer);
      } else {
        setAssessmentsCount(current);
      }
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden space-y-24">
      
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-200/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-amber-100/10 blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8 md:pt-16">
        
        <div className="lg:col-span-7 space-y-6 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-soft text-accent border border-accent/10"
          >
            <Activity size={13} className="animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase">
              PLATT-CALIBRATED NEURAL FUSION
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl text-text leading-[1.08] tracking-tight"
          >
            Multimodal<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500">
              Cardiac Intelligence
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-text-muted leading-relaxed max-w-xl"
          >
            Confidence-adaptive fusion of 12-lead ECG signals and clinical observations. Explainable predictions validated with SHAP attributions and Integrated Gradients.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Link href={user ? "/assess" : "/auth"}
              className="group px-6 py-3.5 rounded-2xl bg-accent text-white font-medium text-sm hover:bg-accent/95 shadow-lg shadow-rose-500/10 flex items-center gap-2 transition-all btn-glow"
            >
              {user ? "Start Assessment" : "Get Started Now"}
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/insights"
              className="px-6 py-3.5 rounded-2xl bg-surface border border-border text-text font-medium text-sm hover:bg-surface-2 transition-all flex items-center gap-2"
            >
              <Play size={14} className="fill-current text-text" />
              View Validation Study
            </Link>
          </motion.div>

          {/* Quick specs list */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-6 border-t border-border flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-text-subtle"
          >
            <span>ECG AUC: 0.9424</span>
            <span>·</span>
            <span>Clinical AUC: 0.9266</span>
            <span>·</span>
            <span>ECE Calibration: 0.034</span>
          </motion.div>
        </div>

        {/* Animated ECG & Floating Heart Container */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          
          {/* Circular glowing bg */}
          <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-rose-400/20 to-amber-300/25 blur-3xl pointer-events-none animate-pulse" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="w-full aspect-square max-w-sm rounded-[32px] bg-white border border-border p-8 shadow-2xl relative flex flex-col justify-between overflow-hidden"
          >
            {/* Top widgets */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-accent font-mono tracking-widest">LIVE HEARTBEAT</p>
                <h4 className="text-xl font-display text-text mt-0.5">V5 Lead Diagnostic</h4>
              </div>
              <div className="p-2.5 rounded-2xl bg-accent-soft text-accent border border-accent/15 animate-heart-float">
                <Heart size={20} style={{ fill: "rgba(244, 63, 94, 0.2)" }} />
              </div>
            </div>

            {/* Embedded ECG Grid Canvas Illustration */}
            <div className="w-full h-32 my-6 bg-rose-50/20 border border-rose-100/30 rounded-2xl relative overflow-hidden flex items-center">
              {/* ECG Grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(244,63,94,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,63,94,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(244,63,94,0.08)_5px,transparent_5px),linear-gradient(to_bottom,rgba(244,63,94,0.08)_5px,transparent_5px)] bg-[size:50px_50px]" />
              
              {/* Animated ECG line SVG */}
              <svg viewBox="0 0 400 100" className="w-full h-full relative z-10 overflow-visible">
                <motion.path
                  d="M0 50 L50 50 L60 40 L70 60 L80 50 L95 50 L102 10 L110 90 L118 50 L130 50 L140 45 L150 55 L160 50 L200 50 L210 40 L220 60 L230 50 L245 50 L252 10 L260 90 L268 50 L280 50 L290 45 L300 55 L310 50 L350 50 L360 40 L370 60 L380 50 L400 50"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-ecg-line"
                />
              </svg>
            </div>

            {/* Bottom details */}
            <div className="flex justify-between items-center text-xs font-mono text-text-muted">
              <div>
                <span className="text-[10px] text-text-subtle">QRS DURATION</span>
                <p className="font-semibold text-text">98 ms</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-text-subtle">INFERENCE TIME</span>
                <p className="font-semibold text-risk-low">43 ms</p>
              </div>
            </div>

          </motion.div>
        </div>

      </section>

      {/* Statistics Section */}
      <section className="cs-card bg-surface-2/30 border border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 rounded-3xl p-8 relative z-10">
        {[
          { label: "Clinical Records Evaluated", value: assessmentsCount.toLocaleString() + "+" },
          { label: "Clinical Parameters Analyzed", value: "11 Features" },
          { label: "12-Lead ECG Attributions", value: "1000 × 12 Matrix" },
          { label: "Fusion Accuracy (AUC)", value: "95.82%" }
        ].map((stat, i) => (
          <div key={i} className="space-y-1 text-center sm:text-left">
            <p className="text-xs font-mono uppercase tracking-wider text-text-muted">{stat.label}</p>
            <h3 className="text-3xl font-display text-text bg-clip-text text-transparent bg-gradient-to-r from-text to-text-muted">
              {stat.value}
            </h3>
          </div>
        ))}
      </section>

      {/* Feature Cards Section */}
      <section className="space-y-12 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-display text-3xl md:text-4xl text-text">
            Three pillars of medical diagnostic fusion
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            CardioSense AI combines clinical metadata with complex signal analysis in a single, robust inference pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: FileSpreadsheet,
              title: "Structured Clinical Vitals",
              desc: "Analyzes 11 core clinical parameters including Chest Pain Type, ST depression, exercise-induced angina, age, biological sex, and fasting blood sugar levels.",
              badge: "Tabular RF"
            },
            {
              icon: Activity,
              title: "ECG Waveform Intelligence",
              desc: "Deep convolutional neural networks analyze the 12-lead signal matrix to capture cardiac morphology patterns, ST-segment shifts, and waveform amplitude variations.",
              badge: "1D CNN"
            },
            {
              icon: Shield,
              title: "Confidence-Adaptive Fusion",
              desc: "Dynamic weighting algorithm balances the clinical and ECG branches based on model confidence, validated using Platt calibration scaling.",
              badge: "Adaptive Gate"
            }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="cs-card cs-card-hover space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="p-3 bg-accent-soft rounded-2xl text-accent border border-accent/5">
                  <feat.icon size={20} />
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-2 text-text-muted border border-border">
                  {feat.badge}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-text">{feat.title}</h3>
              <p className="text-xs leading-relaxed text-text-muted">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

      </section>

      {/* How it works Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">THE PIPELINE</span>
            <h2 className="font-display text-3xl md:text-4xl text-text">How CardioSense works</h2>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            Our fusion methodology leverages strengths from both clinical medicine and signal processing to reduce false positive rates and deliver granular, explainable diagnostics.
          </p>
          
          <div className="space-y-4">
            {[
              { step: "01", label: "Patient Demographics & Vitals Entry", desc: "Clinician inputs standard diagnostic characteristics including exercise-induced chest pain." },
              { step: "02", label: "12-Lead ECG Signal Upload", desc: "Standard 10-second ECG signals in raw format are uploaded and checked for signal drift or noise." },
              { step: "03", label: "Multi-branch Signal Processing", desc: "Dual pipelines run Random Forest on tabular features and a 1D CNN model on the signal matrix." },
              { step: "04", label: "Confidence-Adaptive Fusion Prediction", desc: "The gate network computes individual branch probabilities and outputs a fused risk assessment." }
            ].map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <span className="text-sm font-mono font-bold text-accent px-2 py-1 rounded bg-accent-soft border border-accent/10">
                  {step.step}
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-text">{step.label}</h4>
                  <p className="text-xs text-text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture preview grid */}
        <div className="cs-card bg-surface-2/20 border border-border p-6 rounded-[32px] space-y-6 relative overflow-hidden">
          <h4 className="text-sm font-semibold text-text font-mono border-b border-border pb-3 flex items-center gap-2">
            <Zap size={14} className="text-accent" />
            Model Pipeline Architecture
          </h4>

          {/* Diagram */}
          <div className="space-y-4 text-xs font-mono">
            {/* Input layer */}
            <div className="p-3 bg-surface border border-border rounded-xl flex justify-between items-center shadow-sm">
              <span>Patient Clinical Data (11-dim)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-muted">Input</span>
            </div>
            
            {/* Branches */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-surface border border-border rounded-xl space-y-1 shadow-sm">
                <span className="font-semibold text-text">Clinical Branch</span>
                <p className="text-[10px] text-text-muted">Random Forest Classifier</p>
                <div className="w-full bg-surface-2 rounded-full h-1.5 mt-2">
                  <div className="bg-accent h-1.5 rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
              
              <div className="p-3 bg-surface border border-border rounded-xl space-y-1 shadow-sm">
                <span className="font-semibold text-text">ECG Branch</span>
                <p className="text-[10px] text-text-muted">1D CNN (3-block)</p>
                <div className="w-full bg-surface-2 rounded-full h-1.5 mt-2">
                  <div className="bg-accent h-1.5 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
            </div>

            {/* Fusion node */}
            <div className="p-4 bg-accent-soft border border-accent/15 rounded-xl text-center space-y-1 relative">
              <div className="absolute top-[-8px] left-[50%] translate-x-[-50%] text-[8px] bg-accent text-white px-2 py-0.5 rounded-full">
                DYNAMIC GATE
              </div>
              <span className="font-semibold text-accent">Confidence-Adaptive Fusion Gating</span>
              <p className="text-[10px] text-text-muted">Platt calibrated probabilities weighted dynamically</p>
            </div>

            {/* Output Node */}
            <div className="p-3 bg-surface border border-border rounded-xl flex justify-between items-center shadow-sm">
              <span className="font-bold text-text">Final Prognosis & Attribution Map</span>
              <span className="text-[10px] text-risk-high font-semibold">SHAP + IntGradients</span>
            </div>

          </div>
        </div>

      </section>

      {/* Testimonials */}
      <section className="space-y-12 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-display text-3xl text-text">
            Grounded in clinical AI research
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            CardioSense AI helps research clinicians validate machine learning techniques in cardiovascular diagnostic workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              quote: "Many high-performance deep learning models remain 'black boxes,' limiting clinician trust; integrating XAI methods such as SHAP can partially mitigate this.",
              author: "PMC Systematic Review",
              role: "AI-Powered Clinical Decision Support Systems, 2024"
            },
            {
              quote: "The black box nature of AI models in cardiovascular imaging poses significant legal and ethical concerns — lack of transparency remains a critical barrier to clinical acceptance.",
              author: "Springer Nature",
              role: "Explainability in Cardiovascular AI, 2024"
            }
          ].map((t, idx) => (
            <div key={idx} className="cs-card bg-surface-2/10 border border-border p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <Quote size={28} className="text-accent/20" />
              <p className="text-xs md:text-sm italic leading-relaxed text-text-muted">{t.quote}</p>
              <div className="pt-4 border-t border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs">
                  {t.author.charAt(4)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-text">{t.author}</h4>
                  <p className="text-[10px] text-text-subtle">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

    </div>
  );
}
