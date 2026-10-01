import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/ui/PasswordInput";
import { presentRequestError } from "../../services/api/errors";
import { useAuth } from "../../services/auth/useAuth";
import { LegalLinks } from "../../components/ui/LegalLinks";

const minimumPasswordLength = 8;

export function ChangePasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < minimumPasswordLength) {
      setError(`A nova senha precisa ter pelo menos ${minimumPasswordLength} caracteres.`);
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await auth.changePassword({ password });
      void navigate("/app/dashboard", { replace: true });
    } catch (requestError) {
      setError(presentRequestError(requestError));
    } finally {
      setLoading(false);
    }
  }

  if (auth.status === "checking") return null;
  if (auth.status !== "authenticated") return <Navigate to="/login" replace />;
  if (!auth.user?.mustChangePassword) return <Navigate to="/app/dashboard" replace />;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-3xl bg-white p-7 shadow-sm sm:p-9">
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Estética PetDogs</h1>
            <p className="mt-2 text-sm text-slate-500">Crie uma nova senha para continuar.</p>
          </header>

          <h2 className="text-xl font-bold text-slate-900">Primeiro acesso</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sua senha provisória já foi validada. Defina uma senha pessoal com pelo menos 8
            caracteres.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block" htmlFor="new-password">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Nova senha</span>
              <PasswordInput
                id="new-password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                autoComplete="new-password"
                minLength={minimumPasswordLength}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <label className="block" htmlFor="confirm-new-password">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Confirmar nova senha
              </span>
              <PasswordInput
                id="confirm-new-password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                autoComplete="new-password"
                minLength={minimumPasswordLength}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                required
              />
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            <button
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Salvando..." : "Criar nova senha"}
            </button>
          </form>
          <LegalLinks className="mt-5 justify-center border-t border-slate-100 pt-4" />
        </section>
      </div>
    </main>
  );
}
