import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import PasswordInput from "../../components/ui/PasswordInput";
import { presentRequestError } from "../../services/api/errors";
import { useAuth } from "../../services/auth/useAuth";
import { LegalLinks } from "../../components/ui/LegalLinks";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minimumPasswordLength = 6;

export function ForgotPasswordPage() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "code" | "password" | "complete">("email");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (step === "email") {
      if (!emailPattern.test(normalizedEmail)) {
        setError("Informe um e-mail válido.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        await auth.forgotPassword({ email: normalizedEmail });
        setEmail(normalizedEmail);
        setStep("code");
      } catch (requestError) {
        setError(presentRequestError(requestError));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === "code") {
      if (!/^\d{6}$/.test(code)) {
        setError("Informe o código de 6 dígitos recebido por e-mail.");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const token = await auth.verifyResetCode({ email: normalizedEmail, code });
        setResetToken(token);
        setStep("password");
      } catch (requestError) {
        setError(presentRequestError(requestError));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step !== "password") return;
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
      if (!resetToken) {
        setStep("email");
        setError("Sua validação expirou. Solicite um novo código.");
        return;
      }

      await auth.resetPassword({ resetToken, password });
      auth.signOut();
      setResetToken("");
      setStep("complete");
    } catch (requestError) {
      const message = presentRequestError(requestError);
      if (/(token|expirad)/i.test(message)) {
        setResetToken("");
        setCode("");
        setPassword("");
        setConfirmation("");
        setStep("email");
      }
      setError(message);
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
            <p className="mt-2 text-sm text-slate-500">
              {step === "email"
                ? "Recupere o acesso à sua conta."
                : step === "code"
                  ? "Digite o código enviado ao seu e-mail."
                  : step === "password"
                    ? "Crie uma nova senha para sua conta."
                    : "Sua senha foi atualizada."}
            </p>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {step === "email"
              ? "Esqueci minha senha"
              : step === "code"
                ? "Validar código"
                : step === "password"
                  ? "Nova senha"
                  : "Senha redefinida"}
          </h2>

          {step === "complete" ? (
            <div className="mt-6 space-y-5">
              <div
                className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                role="status"
              >
                Senha redefinida com sucesso. Entre novamente para continuar.
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
              {step === "email" ? (
                <>
                  <p className="text-sm text-slate-500">
                    Informe seu e-mail para receber o código de redefinição.
                  </p>
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
                </>
              ) : step === "code" ? (
                <>
                  <div
                    className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700"
                    role="status"
                  >
                    Se o e-mail estiver cadastrado, enviaremos o código. Ele expira em 10 minutos.
                  </div>
                  <label className="block" htmlFor="reset-password-code">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Código de 6 dígitos
                    </span>
                    <input
                      id="reset-password-code"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(event) =>
                        setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? "forgot-password-error" : undefined}
                      required
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="block" htmlFor="new-password">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Nova senha
                    </span>
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
                </>
              )}
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
                {loading
                  ? "Aguarde..."
                  : step === "email"
                    ? "Enviar código"
                    : step === "code"
                      ? "Continuar"
                      : "Redefinir senha"}
              </button>
              {step === "password" && (
                <button
                  className="w-full py-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                  onClick={() => {
                    setStep("code");
                    setError("");
                  }}
                  type="button"
                >
                  Voltar para o código
                </button>
              )}
              {(step === "code" || step === "password") && (
                <button
                  className="w-full py-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                  onClick={() => {
                    setStep("email");
                    setEmail("");
                    setCode("");
                    setResetToken("");
                    setPassword("");
                    setConfirmation("");
                    setError("");
                  }}
                  type="button"
                >
                  Usar outro e-mail
                </button>
              )}
            </form>
          )}
          {step !== "complete" && (
            <div className="mt-6 text-center">
              <Link className="text-sm font-semibold text-blue-600 hover:text-blue-700" to="/login">
                Voltar para o login
              </Link>
            </div>
          )}
          <LegalLinks className="mt-5 justify-center border-t border-slate-100 pt-4" />
        </div>
      </div>
    </main>
  );
}
