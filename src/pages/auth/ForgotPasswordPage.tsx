import { useState, type FormEvent } from "react";
import { presentRequestError } from "../../services/api/errors";
import { useAuth } from "../../services/auth/useAuth";
import {
  ForgotPasswordForm,
  type ForgotPasswordStep,
} from "../../components/auth/ForgotPasswordForm";

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
  const [step, setStep] = useState<ForgotPasswordStep>("email");

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
    <ForgotPasswordForm
      step={step}
      email={email}
      code={code}
      password={password}
      confirmation={confirmation}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      onEmailChange={setEmail}
      onCodeChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
      onPasswordChange={setPassword}
      onConfirmationChange={setConfirmation}
      onBackToCode={() => {
        setStep("code");
        setError("");
      }}
      onUseAnotherEmail={() => {
        setStep("email");
        setEmail("");
        setCode("");
        setResetToken("");
        setPassword("");
        setConfirmation("");
        setError("");
      }}
    />
  );
}
