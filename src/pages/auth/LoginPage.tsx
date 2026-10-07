import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getApiError, presentRequestError } from "../../services/api/errors";
import { useAuth } from "../../services/auth/useAuth";
import { showToast } from "../../components/ui/toastEvents";
import { LoginForm } from "../../components/auth/LoginForm";

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
    ? "Cadastre-se para cuidar do seu cão com facilidade."
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
    <LoginForm
      isRegister={isRegister}
      title={title}
      description={description}
      name={name}
      phone={phone}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      acceptedLegal={acceptedLegal}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      onNameChange={setName}
      onPhoneChange={setPhone}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onAcceptedLegalChange={setAcceptedLegal}
    />
  );
}
