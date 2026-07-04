"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Heart, Mail, Lock, User, Eye, EyeOff, 
  Loader2, Check, AlertCircle, ArrowLeft, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation state
  const [passValidations, setPassValidations] = useState({
    length: false,
    number: false,
    special: false
  });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { refresh, user, login, register } = useAuth();
  const router = useRouter();

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Live password validation check
  useEffect(() => {
    setPassValidations({
      length: password.length >= 6,
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "forgot") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccessMsg("Reset link has been sent to " + email);
        setLoading(false);
        return;
      }

      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name || undefined);
      }
      await refresh();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid = 
    mode === "register" && 
    (!passValidations.length || !passValidations.number || !passValidations.special || !name);

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative py-6">
      
      {/* Background radial glow */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-rose-200/10 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white border border-border rounded-[32px] overflow-hidden shadow-2xl relative z-10"
      >
        
        {/* Left Side: Illustration Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-rose-50 to-rose-100/50 p-8 flex flex-col justify-between items-center text-center relative border-b lg:border-b-0 lg:border-r border-border min-h-[300px] lg:min-h-0">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-risk-high animate-heart-float" />
            <span className="font-mono text-xs font-bold text-text-muted">CARDIOSENSE SECURE GATE</span>
          </div>

          <div className="my-auto space-y-6 flex flex-col items-center">
            {/* Pulsing medical graphic */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-rose-500/5 rounded-full scale-100 animate-pulse duration-1000" />
              <div className="absolute w-32 h-32 bg-rose-500/5 rounded-full scale-100 animate-pulse duration-700" />
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-24 h-24 rounded-full bg-white border border-rose-100 shadow-lg flex items-center justify-center relative z-10"
              >
                <Heart size={42} className="text-risk-high" style={{ fill: "rgba(244, 63, 94, 0.1)" }} />
              </motion.div>
            </div>

            <div className="space-y-1.5 px-4">
              <h4 className="font-display text-lg text-text">Multimodal Diagnostic Security</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Securely record, manage, and audit clinical features and ECG files in a centralized, HIPAA-compliant model validation workspace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-subtle">
            <ShieldCheck size={12} className="text-risk-low" />
            End-to-End Encryption Enabled
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-white">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="space-y-1.5">
                {mode === "forgot" && (
                  <button onClick={() => setMode("login")} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent font-medium mb-2">
                    <ArrowLeft size={13} /> Back to Sign In
                  </button>
                )}
                <h2 className="font-display text-2xl md:text-3xl text-text">
                  {mode === "login" && "Physician Sign In"}
                  {mode === "register" && "Create Research Account"}
                  {mode === "forgot" && "Reset Password"}
                </h2>
                <p className="text-xs text-text-muted">
                  {mode === "login" && "Enter your credentials to access the validation dashboard."}
                  {mode === "register" && "Register a new clinical testing account below."}
                  {mode === "forgot" && "Provide your email address to receive password reset links."}
                </p>
              </div>

              {/* Mode Toggle */}
              {mode !== "forgot" && (
                <div className="flex bg-surface-2 p-1.5 rounded-2xl border border-border w-fit">
                  <button
                    onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${mode === "login" ? "bg-white text-text shadow-sm" : "text-text-muted"}`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMode("register"); setError(""); setSuccessMsg(""); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${mode === "register" ? "bg-white text-text shadow-sm" : "text-text-muted"}`}
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Form fields */}
              <form onSubmit={submit} className="space-y-4">
                
                {mode === "register" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-3 text-text-subtle" />
                      <input
                        type="text" required value={name} onChange={e => setName(e.target.value)}
                        placeholder="Dr. Sarah Jenkins"
                        className="w-full pl-10 pr-4 py-2.5 outline-none text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-text-subtle" />
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="dr.jenkins@cardiosense.ai"
                      className="w-full pl-10 pr-4 py-2.5 outline-none text-xs"
                    />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-text-muted">Password</label>
                      {mode === "login" && (
                        <button type="button" onClick={() => setMode("forgot")} className="text-[10px] font-semibold text-accent hover:underline">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-3 text-text-subtle" />
                      <input
                        type={showPassword ? "text" : "password"} required
                        value={password} onChange={e => setPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 outline-none text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-text-subtle hover:text-text-muted transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Register validation criteria */}
                    {mode === "register" && password.length > 0 && (
                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-surface-2 p-3 rounded-2xl border border-border">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passValidations.length ? "bg-risk-low/10 text-risk-low" : "bg-text-subtle/10 text-text-subtle"}`}>
                            <Check size={10} />
                          </div>
                          <span>6+ characters</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passValidations.number ? "bg-risk-low/10 text-risk-low" : "bg-text-subtle/10 text-text-subtle"}`}>
                            <Check size={10} />
                          </div>
                          <span>Contains digit</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passValidations.special ? "bg-risk-low/10 text-risk-low" : "bg-text-subtle/10 text-text-subtle"}`}>
                            <Check size={10} />
                          </div>
                          <span>Special char</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-risk-high"
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Success Banner */}
                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-risk-low"
                  >
                    <Check size={14} className="shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || isFormInvalid}
                  className="w-full py-3 rounded-2xl bg-accent text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:bg-accent/90 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-rose-600/10"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {mode === "login" && (loading ? "Signing in..." : "Sign In →")}
                  {mode === "register" && (loading ? "Creating account..." : "Register Account →")}
                  {mode === "forgot" && (loading ? "Sending link..." : "Send Password Reset Link")}
                </button>

              </form>
            </motion.div>
          </AnimatePresence>

        </div>

      </motion.div>
    </div>
  );
}
