"use client";
import { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { verifyOtpForUser, generateOtpForUser } from "@/lib/auth";

interface OtpVerificationModalProps {
  isOpen: boolean;
  email: string;
  userName: string;
  initialOtp: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function OtpVerificationModal({
  isOpen,
  email,
  userName,
  initialOtp,
  onSuccess,
  onClose,
}: OtpVerificationModalProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpCode, setOtpCode] = useState(initialOtp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(30);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update otpCode if initialOtp changes
  useEffect(() => {
    if (initialOtp) setOtpCode(initialOtp);
  }, [initialOtp]);

  // Focus first input on open
  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", "", "", ""]);
      setError("");
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    }
  }, [isOpen]);

  // Countdown timer for resend
  useEffect(() => {
    if (!isOpen || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, resendCooldown]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    setError("");
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // Single digit input
    const char = cleaned.slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    // Auto advance
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    const nextFocus = Math.min(pasted.length, 5);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleAutoFill = () => {
    const chars = otpCode.split("").slice(0, 6);
    setDigits(chars);
    setError("");
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    const newCode = generateOtpForUser(email);
    setOtpCode(newCode);
    setResendCooldown(45);
    setError("");
    setDigits(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleVerify = async () => {
    const entered = digits.join("");
    if (entered.length < 6) {
      setError("Please enter all 6 digits of the OTP.");
      return;
    }

    setLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 800));

    const isValid = verifyOtpForUser(email, entered);
    if (isValid) {
      setLoading(false);
      onSuccess();
    } else {
      setLoading(false);
      setError("Invalid OTP code. Please enter the correct code or click auto-fill.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0d1020] border border-violet-500/25 text-slate-100 shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Glow ambient */}
        <div className="orb w-48 h-48 bg-violet-600/20 -top-12 -right-12 pointer-events-none" />
        <div className="orb w-40 h-40 bg-cyan-600/15 -bottom-10 -left-10 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-[1px] shadow-lg shadow-violet-600/30 mb-3">
            <div className="w-full h-full bg-[#0a0c16] rounded-[15px] flex items-center justify-center">
              <ShieldCheck size={26} className="text-violet-300" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Security Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            We sent a 6-digit confirmation code to verify{" "}
            <span className="text-violet-300 font-semibold">{email}</span>
          </p>
        </div>

        {/* Instant Demo OTP Banner */}
        <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-violet-600/15 via-indigo-600/10 to-cyan-500/15 border border-violet-500/30 flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <KeyRound size={16} className="text-cyan-400 flex-shrink-0" />
            <div className="truncate">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Verification Code
              </div>
              <div className="text-sm font-bold tracking-widest text-cyan-300 font-mono">
                {otpCode}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoFill}
            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <Sparkles size={12} />
            <span>{copiedNotification ? "Filled! ✓" : "Autofill"}</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 mb-4 animate-in fade-in">
            <AlertCircle size={15} className="flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* 6 Digit Input Boxes */}
        <div className="flex items-center justify-between gap-2 sm:gap-2.5 mb-6 relative z-10">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-2xl border transition-all outline-none bg-white/[0.04] text-white ${
                digit
                  ? "border-violet-500 bg-violet-500/10 shadow-sm shadow-violet-500/20"
                  : "border-white/10 focus:border-cyan-400/60 focus:bg-white/[0.07]"
              }`}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || digits.join("").length < 6}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer mb-4"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Verifying & Preparing Dashboard...</span>
            </>
          ) : (
            <>
              <span>Verify & Launch Dashboard</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Resend OTP */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 text-center">
          <span>Didn't receive code?</span>
          <button
            type="button"
            disabled={resendCooldown > 0}
            onClick={handleResend}
            className="text-violet-400 hover:text-violet-300 font-semibold disabled:text-slate-600 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
