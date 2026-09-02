import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/ui/PasswordInput";
import { presentRequestError } from "../../services/api/errors";
import { useAuth } from "../../services/auth/useAuth";

type Mode = "login" | "register";

interface LoginPageProps {
  mode?: Mode;
}

export function LoginPage({ mode = "login" }: LoginPageProps) {
  const navigate = useNavigate();
  const auth = useAuth();
  const { status } = auth;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
        if (password !== confirmPassword) {
          setError("As senhas não coincidem.");
          setLoading(false);
          return;
        }

        await auth.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });

        navigate("/app/dashboard");
        return;
      }

      await auth.signIn({
        email: email.trim(),
        password,
      });

      navigate("/app/dashboard");
    } catch (requestError) {
      setError(presentRequestError(requestError));
    } finally {
      setLoading(false);
    }
  }

  if (status === "authenticated") {
    return <Navigate to="/app/dashboard" replace />;
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
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</span>

              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                type="email"
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
        </div>
      </div>
    </main>
  );
}
