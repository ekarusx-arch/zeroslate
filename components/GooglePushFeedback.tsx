import React from "react";
import { Check, AlertCircle, X, ExternalLink } from "lucide-react";

interface PushFeedback {
  type: "success" | "warning" | "error";
  message: string;
  syncedAt?: string;
}

interface GooglePushFeedbackProps {
  feedback: PushFeedback | null;
  onClose: () => void;
}

export default function GooglePushFeedback({ feedback, onClose }: GooglePushFeedbackProps) {
  if (!feedback) return null;

  const bgColor = {
    success: "bg-emerald-50 border-emerald-100 text-emerald-800",
    warning: "bg-amber-50 border-amber-100 text-amber-800",
    error: "bg-red-50 border-red-100 text-red-800",
  }[feedback.type];

  const Icon = feedback.type === "success" ? Check : AlertCircle;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className={`flex flex-col gap-3 p-5 rounded-2xl border shadow-xl backdrop-blur-sm min-w-[320px] max-w-[400px] ${bgColor}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-1.5 rounded-lg ${
              feedback.type === "success" ? "bg-emerald-100" : 
              feedback.type === "warning" ? "bg-amber-100" : "bg-red-100"
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-black tracking-tight">Google Calendar</h3>
              <p className="text-xs font-semibold leading-relaxed opacity-90">
                {feedback.message}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors shrink-0"
          >
            <X className="w-4 h-4 opacity-60" />
          </button>
        </div>

        {feedback.syncedAt && (
          <div className="flex items-center justify-between mt-1 pt-3 border-t border-black/5">
            <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
              Last Synced: {new Date(feedback.syncedAt).toLocaleTimeString()}
            </span>
            <a 
              href="https://calendar.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-black hover:underline underline-offset-2"
            >
              Calendar 열기
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
