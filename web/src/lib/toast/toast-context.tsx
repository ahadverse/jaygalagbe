"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Toast, type ToastVariant } from "@/components/ui/toast";

export type ToastInput = {
  title: string;
  description?: string;
  href?: string;
  variant?: ToastVariant;
};

type ToastEntry = ToastInput & { id: string };

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...input, id }]);
      setTimeout(() => dismiss(id), 6000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex flex-col items-end gap-2 px-4 sm:top-24 sm:px-6">
        {toasts.map((entry) => {
          const content = (
            <Toast variant={entry.variant} className="animate-slide-down">
              <p className="text-sm font-semibold text-white">{entry.title}</p>
              {entry.description && (
                <p className="line-clamp-2 text-xs leading-relaxed text-neutral-400">
                  {entry.description}
                </p>
              )}
            </Toast>
          );
          return entry.href ? (
            <Link
              key={entry.id}
              href={entry.href}
              onClick={() => dismiss(entry.id)}
              className="pointer-events-auto block w-full max-w-sm"
            >
              {content}
            </Link>
          ) : (
            <button
              key={entry.id}
              type="button"
              onClick={() => dismiss(entry.id)}
              className="pointer-events-auto w-full max-w-sm text-left"
            >
              {content}
            </button>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
