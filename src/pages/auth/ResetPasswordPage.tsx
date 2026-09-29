import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PasswordInput from "../../components/ui/PasswordInput";
import { getApiError, presentRequestError } from "../../services/api/errors";
import { useAuth } from "../../services/auth/useAuth";

const minimumPasswordLength = 6;

export function ResetPasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    if (password.length < minimumPasswordLength) {
      setError(`A senha deve ter pelo menos ${minimumPasswordLength} caracteres.`);
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await auth.resetPassword({ token, password });
      setSuccess(true);
      window.setTimeout(() => void navigate("/login", { replace: true }), 1800);
    } catch (requestError) {
      const apiError = getApiError(requestError);
      setError(
        apiError.status === 400 || apiError.status === 401 || apiError.status === 404
          ? "Este link de recuperação é inválido ou expirou. Solicite uma nova recuperação de senha."
          : presentRequestError(requestError),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-7 shadow-sm sm:p-9">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Estética PetDogs</h1>
            <p className="mt-2 text-sm text-slate-500">Escolha uma nova senha para sua conta.</p>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Redefinir senha</h2>
          {!token ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                Este link de recuperação é inválido ou expirou. Solicite uma nova recuperação de
                senha.
              </div>
              <Link
                className="block text-center text-sm font-semibold text-blue-600 hover:text-blue-700"
                to="/forgot-password"
              >
                Solicitar nova recuperação
              </Link>
            </div>
          ) : success ? (
            <div
              className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              role="status"
            >
              Senha alterada com sucesso. Você será redirecionado para o login.
            </div>
          ) : (
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
                {loading ? "Redefinindo..." : "Redefinir senha"}
              </button>
            </form>
          )}
          <div className="mt-6 text-center">
            <Link className="text-sm font-semibold text-blue-600 hover:text-blue-700" to="/login">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
