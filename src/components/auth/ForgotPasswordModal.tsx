"use client";
import { useState } from "react";
import { Mail, KeyRound, ArrowRight, CheckCircle2, X, AlertCircle, Loader2, Sparkles } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export default function ForgotPasswordModal({ isOpen, onClose, defaultEmail = "" }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"request" | "verify" | "success">("request");
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setStep("verify");
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);

    // auto focus next
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some((d) => !d)) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep("success");
  };

  const handleClose = () => {
    setStep("request");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl glass-strong border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/80">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        {step === "request" && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 mb-4 shadow-inner">
              <KeyRound size={24} />
            </div>
            <h3 className="text-xl font-bold text-white font-heading mb-1">Reset your password</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Enter your registered email and we'll send a 6-digit verification code to reset your SikhoSikhao account password.
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-4 text-xs text-rose-300">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. arjun@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={handleClose} className="btn-secondary flex-1 justify-center py-2.5 text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2.5 text-xs">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : "Send Code"}
                  {!loading && <ArrowRight size={14} />}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === "verify" && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-4 shadow-inner">
              <Mail size={24} />
            </div>
            <h3 className="text-xl font-bold text-white font-heading mb-1">Enter Verification Code</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              We've sent a 6-digit security code to <strong className="text-slate-200">{email}</strong>. (For demo testing, enter any digits e.g. 1 2 3 4 5 6)
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-4 text-xs text-rose-300">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">6-Digit OTP</label>
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-11 h-12 text-center text-lg font-bold rounded-xl bg-white/[0.05] border border-white/10 focus:border-violet-500 focus:bg-white/[0.08] outline-none text-white transition-all"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Set New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setStep("request")} className="btn-secondary flex-1 justify-center py-2.5 text-xs">
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2.5 text-xs">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : "Reset & Save"}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-white font-heading mb-2">Password Reset Successfully!</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Your password has been securely updated. You can now log into your SikhoSikhao account with your new credentials.
            </p>
            <button onClick={handleClose} className="btn-primary w-full justify-center py-2.5 text-xs">
              Proceed to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
