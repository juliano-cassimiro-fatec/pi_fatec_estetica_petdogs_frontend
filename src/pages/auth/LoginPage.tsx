import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/ui/PasswordInput";
import { getApiError, presentRequestError } from "../../services/api/errors";
import { useAuth } from "../../services/auth/useAuth";
import { showToast } from "../../components/ui/toastEvents";
import { LegalLinks } from "../../components/ui/LegalLinks";

type Mode = "login" | "register";

interface LoginPageProps {
  mode?: Mode;
}

export function LoginPage({ mode = "login" }: LoginPageProps) {
  const navigate = useNavigate();
  const auth = useAuth();
  const { status } = auth;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  const title = isRegister ? "Criar sua conta" : "Bem-vindo de volta";
  const description = isRegister
    ? "Cadastre-se para cuidar do seu pet com facilidade."
    : "Entre na sua conta para continuar.";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        if (!acceptedLegal) {
          setError("Aceite os Termos de Uso e a Política de Privacidade para criar sua conta.");
          return;
        }

        if (password !== confirmPassword) {
          const message = "As senhas não coincidem.";
          setError(message);
          showToast(message);
          setLoading(false);
          return;
        }

        const registration = await auth.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          telefone: phone.trim() ? phone.replace(/\D/g, "") : undefined,
        });

        void navigate("/verify-email", {
          replace: true,
          state: { email: registration.email },
        });
        return;
      }

      const user = await auth.signIn({
        email: email.trim(),
        password,
      });

      void navigate(user.mustChangePassword ? "/change-password" : "/app/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      const apiError = getApiError(requestError);
      if (isRegister && apiError.status === 409) {
        void navigate("/verify-email", {
          replace: true,
          state: { email: email.trim().toLowerCase(), alreadyPending: true },
        });
        return;
      }
      if (!isRegister && apiError.code === "EMAIL_VERIFICATION_REQUIRED") {
        void navigate("/verify-email", {
          replace: true,
          state: { email: email.trim().toLowerCase() },
        });
        return;
      }
      setError(presentRequestError(requestError));
    } finally {
      setLoading(false);
    }
  }

  if (status === "authenticated") {
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
        <div className="w-full rounded-3xl bg-white p-7 shadow-sm sm:p-9">
          {/* Logo / Nome */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Estética PetDogs</h1>

            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>

          {/* Título */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>

            <p className="mt-1 text-sm text-slate-500">
              {isRegister
                ? "Preencha seus dados para começar."
                : "Digite seus dados para acessar sua conta."}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Nome</span>

                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  type="text"
                  maxLength={45}
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
            )}

            {isRegister && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Telefone <span className="text-slate-400">(opcional)</span>
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</span>

              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                type="email"
                maxLength={45}
                placeholder="seuemail@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Senha</span>

              <PasswordInput
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {isRegister && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Confirmar senha
                </span>

                <PasswordInput
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </label>
            )}

            {isRegister && (
              <div className="flex items-start gap-3">
                <input
                  id="accept-legal"
                  aria-label="Aceito os Termos de Uso e a Política de Privacidade"
                  className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                  type="checkbox"
                  checked={acceptedLegal}
                  onChange={(event) => setAcceptedLegal(event.target.checked)}
                  required
                />
                <p className="text-sm leading-6 text-slate-600">
                  <label htmlFor="accept-legal">Li e aceito os </label>
                  <Link
                    className="font-semibold text-blue-700 underline-offset-2 hover:underline"
                    to="/termos-de-uso"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link
                    className="font-semibold text-blue-700 underline-offset-2 hover:underline"
                    to="/politica-de-privacidade"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Aguarde..." : isRegister ? "Criar conta" : "Entrar"}
            </button>
          </form>

          {!isRegister && (
            <div className="mt-4 text-right text-sm">
              <Link
                className="font-semibold text-blue-600 hover:text-blue-700"
                to="/forgot-password"
              >
                Esqueci minha senha
              </Link>
            </div>
          )}

          {/* Alternar login/cadastro */}
          <div className="mt-6 text-center text-sm text-slate-500">
            {isRegister ? (
              <>
                Já possui uma conta?{" "}
                <Link className="font-semibold text-blue-600 hover:text-blue-700" to="/login">
                  Entrar
                </Link>
              </>
            ) : (
              <>
                Ainda não possui uma conta?{" "}
                <Link className="font-semibold text-blue-600 hover:text-blue-700" to="/register">
                  Criar conta
                </Link>
              </>
            )}
          </div>

          {/* Voltar */}
          <div className="mt-6 text-center">
            <Link className="text-sm text-slate-400 transition hover:text-slate-600" to="/">
              ← Voltar para o início
            </Link>
          </div>
          {!isRegister && (
            <LegalLinks className="mt-5 justify-center border-t border-slate-100 pt-4" />
          )}
        </div>
      </div>
    </main>
  );
}
