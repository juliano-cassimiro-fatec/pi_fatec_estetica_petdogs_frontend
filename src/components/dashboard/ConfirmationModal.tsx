import { Modal } from "../ui/Modal";
import { dangerButtonClass, secondaryButtonClass, type ConfirmModalState } from "./dashboardConfig";

interface ConfirmationModalProps {
  state: ConfirmModalState | null;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmationModal({ state, saving, onClose, onConfirm }: ConfirmationModalProps) {
  return (
    <Modal
      open={Boolean(state)}
      title={state?.title ?? "Confirmar ação"}
      description={state?.description ?? ""}
      onClose={onClose}
    >
      <div className="grid gap-5">
        <div
          className={`rounded-2xl border p-4 ${
            state?.tone === "warning"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <p className="text-sm font-semibold">
            Essa ação não pode ser desfeita. Deseja realmente continuar?
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            className={secondaryButtonClass}
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Voltar
          </button>
          <button
            className={
              state?.tone === "warning"
                ? "inline-flex items-center justify-center rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
                : dangerButtonClass
            }
            type="button"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? "Aguarde..." : (state?.confirmLabel ?? "Confirmar")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
