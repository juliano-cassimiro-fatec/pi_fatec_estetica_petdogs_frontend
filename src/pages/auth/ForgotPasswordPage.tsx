import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { presentRequestError } from "../../services/api/errors";
import { useAuth } from "../../services/auth/useAuth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(normalizedEmail)) {
      setError("Informe um e-mail válido.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await auth.forgotPassword({ email: normalizedEmail });
      setSent(true);
    } catch (requestError) {
      setError(presentRequestError(requestError, "Não foi possível enviar a solicitação agora."));
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
            <p className="mt-2 text-sm text-slate-500">Recupere o acesso à sua conta.</p>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Esqueci minha senha</h2>
          <p className="mt-1 text-sm text-slate-500">
            Informe seu e-mail para receber as instruções de redefinição.
          </p>

          {sent ? (
            <div className="mt-6 space-y-5">
              <div
                className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                role="status"
              >
                Se o e-mail estiver cadastrado, enviaremos as instruções para redefinição de senha.
              </div>
              <Link
                className="block text-center text-sm font-semibold text-blue-600 hover:text-blue-700"
                to="/login"
              >
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              <label className="block" htmlFor="forgot-password-email">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</span>
                <input
                  id="forgot-password-email"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  placeholder="seuemail@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "forgot-password-error" : undefined}
                  required
                />
              </label>
              {error && (
                <div
                  id="forgot-password-error"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <button
                className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? "Enviando..." : "Enviar instruções"}
              </button>
            </form>
          )}
          {!sent && (
            <div className="mt-6 text-center">
              <Link className="text-sm font-semibold text-blue-600 hover:text-blue-700" to="/login">
                Voltar para o login
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
