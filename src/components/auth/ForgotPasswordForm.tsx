import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import PasswordInput from "../ui/PasswordInput";
import { LegalLinks } from "../ui/LegalLinks";
import { authInputClass, authPasswordInputClass } from "./authFormStyles";

export type ForgotPasswordStep = "email" | "code" | "password" | "complete";

interface ForgotPasswordFormProps {
  step: ForgotPasswordStep;
  email: string;
  code: string;
  password: string;
  confirmation: string;
  loading: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEmailChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmationChange: (value: string) => void;
  onBackToCode: () => void;
  onUseAnotherEmail: () => void;
}

export function ForgotPasswordForm({
  step,
  email,
  code,
  password,
  confirmation,
  loading,
  error,
  onSubmit,
  onEmailChange,
  onCodeChange,
  onPasswordChange,
  onConfirmationChange,
  onBackToCode,
  onUseAnotherEmail,
}: ForgotPasswordFormProps) {
  const description =
    step === "email"
      ? "Recupere o acesso à sua conta."
      : step === "code"
        ? "Digite o código enviado ao seu e-mail."
        : step === "password"
          ? "Crie uma nova senha para sua conta."
          : "Sua senha foi atualizada.";
  const title =
    step === "email"
      ? "Esqueci minha senha"
      : step === "code"
        ? "Validar código"
        : step === "password"
          ? "Nova senha"
          : "Senha redefinida";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-7 shadow-sm sm:p-9">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Estética PetDogs</h1>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>

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
            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              {step === "email" ? (
                <>
                  <p className="text-sm text-slate-500">
                    Informe seu e-mail para receber o código de redefinição.
                  </p>
                  <label className="block" htmlFor="forgot-password-email">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</span>
                    <input
                      id="forgot-password-email"
                      className={authInputClass}
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      placeholder="seuemail@email.com"
                      value={email}
                      onChange={(event) => onEmailChange(event.target.value)}
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
                      className={authInputClass}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(event) => onCodeChange(event.target.value)}
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
                      className={authPasswordInputClass}
                      autoComplete="new-password"
                      minLength={6}
                      value={password}
                      onChange={(event) => onPasswordChange(event.target.value)}
                      required
                    />
                  </label>
                  <label className="block" htmlFor="confirm-new-password">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Confirmar nova senha
                    </span>
                    <PasswordInput
                      id="confirm-new-password"
                      className={authPasswordInputClass}
                      autoComplete="new-password"
                      minLength={6}
                      value={confirmation}
                      onChange={(event) => onConfirmationChange(event.target.value)}
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
                  onClick={onBackToCode}
                  type="button"
                >
                  Voltar para o código
                </button>
              )}
              {(step === "code" || step === "password") && (
                <button
                  className="w-full py-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                  onClick={onUseAnotherEmail}
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
