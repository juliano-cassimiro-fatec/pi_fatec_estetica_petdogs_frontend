import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LegalLinks } from "../../components/ui/LegalLinks";
import { presentRequestError } from "../../services/api/errors";
import { useAuth } from "../../services/auth/useAuth";

interface VerifyEmailLocationState {
  email?: string;
  alreadyPending?: boolean;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function VerifyEmailPage() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as VerifyEmailLocationState | null;
  const [email, setEmail] = useState(locationState?.email ?? "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    locationState?.alreadyPending
      ? "Este e-mail já possui um cadastro. Se ele ainda estiver pendente, você pode solicitar um novo código."
      : "",
  );

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("Informe o código de 6 dígitos recebido por e-mail.");
      return;
    }

    setLoading(true);
    try {
      const user = await auth.verifyEmail({ email: normalizedEmail, code });
      void navigate(user.mustChangePassword ? "/change-password" : "/app/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      setError(presentRequestError(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setError("Informe um e-mail válido para reenviar o código.");
      return;
    }

    setResending(true);
    setError("");
    setNotice("");
    try {
      await auth.resendEmailVerification({ email: normalizedEmail });
      setNotice(
        "Se houver um cadastro pendente para este e-mail, enviaremos um novo código. Confira também a caixa de spam.",
      );
    } catch (requestError) {
      setError(presentRequestError(requestError));
    } finally {
      setResending(false);
    }
  }

  if (auth.status === "checking") return null;
  if (auth.status === "authenticated") {
    return (
      <Navigate
        to={auth.user?.mustChangePassword ? "/change-password" : "/app/dashboard"}
        replace
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-3xl bg-white p-7 shadow-sm sm:p-9">
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Estética PetDogs</h1>
            <p className="mt-2 text-sm text-slate-500">
              Confirme seu e-mail para ativar sua conta.
            </p>
          </header>

          <h2 className="text-xl font-bold text-slate-900">Verificar e-mail</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Enviamos um código de 6 dígitos para seu endereço. O código expira em 10 minutos.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleVerify} noValidate>
            <label className="block" htmlFor="verification-email">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</span>
              <input
                id="verification-email"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="seuemail@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="block" htmlFor="verification-code">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Código</span>
              <input
                id="verification-code"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm tracking-[0.2em] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            </label>

            {notice && (
              <p
                className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                role="status"
              >
                {notice}
              </p>
            )}
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Confirmando..." : "Confirmar e-mail"}
            </button>
          </form>

          <button
            className="mt-3 w-full py-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={resending}
            onClick={() => void handleResend()}
            type="button"
          >
            {resending ? "Enviando..." : "Reenviar código"}
          </button>

          <div className="mt-4 text-center text-sm text-slate-500">
            <Link className="font-semibold text-blue-700 hover:text-blue-800" to="/login">
              Voltar ao login
            </Link>
          </div>
          <LegalLinks className="mt-5 justify-center border-t border-slate-100 pt-4" />
        </section>
      </div>
    </main>
  );
}
