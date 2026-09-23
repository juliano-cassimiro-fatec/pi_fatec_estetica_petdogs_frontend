import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { presentRequestError } from "../../services/api/errors";

const toastEventName = "petdogs:toast";

interface ToastDetail {
  message: string;
}

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent<ToastDetail>(toastEventName, { detail: { message } }));
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");

  const dismiss = useCallback(() => setMessage(""), []);

  useEffect(() => {
    function handleToast(event: Event) {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      if (detail?.message) setMessage(detail.message);
    }

    window.addEventListener(toastEventName, handleToast);
    return () => window.removeEventListener(toastEventName, handleToast);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(dismiss, 5000);
    return () => window.clearTimeout(timeout);
  }, [dismiss, message]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end">
          <div
            className="pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 shadow-xl"
            role="alert"
          >
            <span className="mt-0.5 text-base" aria-hidden="true">
              !
            </span>
            <p className="flex-1">{message}</p>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-md px-1 text-lg leading-none text-red-400 transition hover:bg-red-50 hover:text-red-700"
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return context;
}

export function presentToastError(error: unknown) {
  showToast(presentRequestError(error));
}
