"use client";
import * as React from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";
type Toast = { id: number; message: string; variant: ToastVariant };

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const icons = {
  success: <CheckCircle2 className="size-4 text-emerald-500" />,
  error: <XCircle className="size-4 text-red-500" />,
  info: <Info className="size-4 text-blue-500" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "bg-card text-card-foreground flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3 text-sm shadow-lg",
              "animate-in slide-in-from-bottom-2 fade-in",
            )}
          >
            {icons[t.variant]}
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
