import { useState } from "react"
import type { FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { SiteHeader, SiteShell } from "../../components/layout/UnifiedPageFrame"
import { useAuth } from "../../services/auth/useAuth"
import { presentRequestError } from "../../services/api/errors"

type Mode = "login" | "register"
type RegisterStep = "email" | "code" | "account"

interface LoginPageProps {
  mode?: Mode
}

export function LoginPage({ mode = "login" }: LoginPageProps) {
  const navigate = useNavigate()

  const {
    status,
    signIn,
    register,
    sendOtp,
    verifyOtp,
  } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [codigo, setCodigo] = useState("")
  const [verificationToken, setVerificationToken] = useState("")
  const [registerStep, setRegisterStep] = useState<RegisterStep>("email")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const titleByMode = {
    login: "Entrar na conta",
    register: "Criar conta",
  }

  const descriptionByMode = {
    login: "Entre para acessar sua agenda e seus dados.",
    register: "Cadastre-se para agendar os cuidados do seu pet.",
  }

  const submitLabelByMode = {
    login: "Entrar",
    register: "Criar cadastro",
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError("")
    setMessage("")

    try {
      if (mode === "register") {
        const normalizedEmail = email.trim().toLowerCase()

        if (registerStep === "email") {
          const response = await sendOtp({
            email: normalizedEmail,
          })

          setEmail(normalizedEmail)
          setMessage(response.message)
          setRegisterStep("code")

          return
        }

        if (registerStep === "code") {
          const response = await verifyOtp({
            email: normalizedEmail,
            codigo: codigo.trim(),
          })

          setVerificationToken(response.verificationToken)
          setMessage(response.message)
          setRegisterStep("account")

          return
        }

        if (password !== confirmPassword) {
          setError("As senhas não coincidem.")
          return
        }

        await register({
          name: name.trim(),
          email: normalizedEmail,
          password,
          verificationToken,
        })

        navigate("/app/dashboard")
        return
      }

      await signIn({
        email: email.trim(),
        password,
      })

      navigate("/app/dashboard")
    } catch (requestError) {
      setError(presentRequestError(requestError))
    } finally {
      setLoading(false)
    }
  }

  async function handleResendOtp() {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await sendOtp({
        email: email.trim().toLowerCase(),
      })

      setMessage(response.message)
      setCodigo("")
    } catch (requestError) {
      setError(presentRequestError(requestError))
    } finally {
      setLoading(false)
    }
  }

  if (status === "authenticated") {
    return <Navigate to="/app/dashboard" replace />
  }

  return (
    <SiteShell>
      <SiteHeader
        rightAction={
          <Link
            className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
            to="/"
          >
            Voltar
          </Link>
        }
      />

      <main className="px-6 py-10">
        <div className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_30px_80px_-50px_rgba(37,99,235,0.45)] lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="flex flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-8 text-white sm:p-10">
            <div>
              <div className="mt-10 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em]">
                Estética PetDogs
              </div>

              <h1 className="mt-6 max-w-md text-3xl font-black tracking-tight sm:text-4xl">
                {titleByMode[mode]}
              </h1>

              <p className="mt-3 max-w-md text-white/80">
                {descriptionByMode[mode]}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                {
                  title: "Rápido",
                  text: "Acesso em poucos passos.",
                },
                {
                  title: "Seguro",
                  text: "Dados protegidos e privados.",
                },
                {
                  title: "Simples",
                  text: "Tela direta e objetiva.",
                },
              ].map((item) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3"
                  key={item.title}
                >
                  <p className="text-sm font-black">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/80">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </aside>

          <form
            className="flex flex-col justify-center p-8 sm:p-10"
            onSubmit={handleSubmit}
          >
            <div className="mx-auto w-full max-w-md">
              <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">
                {titleByMode[mode]}
              </h2>

              <p className="mt-2 text-slate-600">
                {descriptionByMode[mode]}
              </p>

              {mode === "register" && (
                <ol
                  className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-bold"
                  aria-label="Etapas do cadastro"
                >
                  {[
                    {
                      step: "email",
                      label: "E-mail",
                    },
                    {
                      step: "code",
                      label: "Código",
                    },
                    {
                      step: "account",
                      label: "Cadastro",
                    },
                  ].map((item, index) => {
                    const steps: RegisterStep[] = [
                      "email",
                      "code",
                      "account",
                    ]

                    const active =
                      steps.indexOf(registerStep) >= index

                    return (
                      <li
                        className={
                          active
                            ? "rounded-xl bg-blue-600 px-2 py-2 text-white"
                            : "rounded-xl bg-slate-100 px-2 py-2 text-slate-500"
                        }
                        key={item.step}
                      >
                        {index + 1}. {item.label}
                      </li>
                    )
                  })}
                </ol>
              )}

              <div className="mt-6 grid gap-4">
                {mode === "register" &&
                  registerStep === "account" && (
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Nome

                      <input
                        className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        value={name}
                        onChange={(event) =>
                          setName(event.target.value)
                        }
                        required
                      />
                    </label>
                  )}

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  E-mail

                  <input
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    disabled={
                      mode === "register" &&
                      registerStep !== "email"
                    }
                    required
                  />
                </label>

                {mode === "register" &&
                  registerStep === "code" && (
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Código de verificação

                      <input
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-center font-mono text-xl tracking-[0.35em] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        inputMode="numeric"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        autoComplete="one-time-code"
                        value={codigo}
                        onChange={(event) =>
                          setCodigo(
                            event.target.value.replace(
                              /\D/g,
                              "",
                            ),
                          )
                        }
                        required
                      />

                      <span className="font-normal text-slate-500">
                        Digite o código de 6 dígitos enviado
                        para seu e-mail.
                      </span>
                    </label>
                  )}

                {(mode === "login" ||
                  registerStep === "account") && (
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Senha

                    <input
                      className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      minLength={6}
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      required
                    />
                  </label>
                )}

                {mode === "register" &&
                  registerStep === "account" && (
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Confirmar Senha

                      <input
                        className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        minLength={6}
                        type="password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value,
                          )
                        }
                        required
                      />
                    </label>
                  )}
              </div>

              {error && (
                <p
                  className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {message && (
                <p
                  className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"
                  role="status"
                >
                  {message}
                </p>
              )}

              <button
                className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading
                  ? "Aguarde..."
                  : mode === "register" &&
                      registerStep === "email"
                    ? "Enviar código"
                    : mode === "register" &&
                        registerStep === "code"
                      ? "Validar código"
                      : submitLabelByMode[mode]}
              </button>

              {mode === "register" &&
                registerStep === "code" && (
                  <button
                    className="mt-3 w-full text-sm font-bold text-blue-700 disabled:opacity-60"
                    disabled={loading}
                    onClick={handleResendOtp}
                    type="button"
                  >
                    Reenviar código
                  </button>
                )}

              <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-blue-700">
                <Link
                  to={
                    mode === "login"
                      ? "/register"
                      : "/login"
                  }
                >
                  {mode === "login"
                    ? "Cadastrar"
                    : "Entrar"}
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    </SiteShell>
  )
}