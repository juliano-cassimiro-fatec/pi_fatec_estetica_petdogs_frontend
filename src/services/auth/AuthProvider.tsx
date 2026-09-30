import { useCallback, useEffect, useState, type ReactNode } from "react";
import type {
  AuthUser,
  LoginCredentials,
  RegisterCustomerData,
  ForgotPasswordData,
  VerifyResetCodeData,
  ResetPasswordData,
  ChangePasswordData,
} from "../../features/shared/types";
import { authService } from "./authService";
import { AuthContext, type AuthStatus } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hasInitialToken] = useState(() => authService.hasStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    hasInitialToken ? "checking" : "unauthenticated",
  );

  const signOut = useCallback(() => {
    authService.signOut();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const requirePasswordChange = useCallback(() => {
    setUser((currentUser) =>
      currentUser ? { ...currentUser, mustChangePassword: true } : currentUser,
    );
  }, []);

  const refreshUser = useCallback(async () => {
    if (!authService.hasStoredToken()) return signOut();
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setStatus("authenticated");
    } catch {
      signOut();
    }
  }, [signOut]);

  useEffect(() => {
    if (!hasInitialToken) return;

    let active = true;
    void authService
      .getCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch(() => {
        if (active) signOut();
      });

    return () => {
      active = false;
    };
  }, [hasInitialToken, signOut]);

  useEffect(() => {
    window.addEventListener("petdogs:session-expired", signOut);
    return () => window.removeEventListener("petdogs:session-expired", signOut);
  }, [signOut]);

  useEffect(() => {
    window.addEventListener("petdogs:password-change-required", requirePasswordChange);
    return () =>
      window.removeEventListener("petdogs:password-change-required", requirePasswordChange);
  }, [requirePasswordChange]);

  async function signIn(credentials: LoginCredentials): Promise<AuthUser> {
    const session = await authService.signIn(credentials);
    setUser(session.user);
    setStatus("authenticated");
    return session.user;
  }

  async function register(data: RegisterCustomerData) {
    const session = await authService.registerCustomer(data);
    setUser(session.user);
    setStatus("authenticated");
  }

  function forgotPassword(data: ForgotPasswordData) {
    return authService.forgotPassword(data);
  }

  function verifyResetCode(data: VerifyResetCodeData) {
    return authService.verifyResetCode(data);
  }

  function resetPassword(data: ResetPasswordData) {
    return authService.resetPassword(data);
  }

  async function changePassword(data: ChangePasswordData) {
    const session = await authService.changePassword(data);
    setUser(session.user);
    setStatus("authenticated");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        signIn,
        register,
        signOut,
        refreshUser,
        forgotPassword,
        verifyResetCode,
        resetPassword,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
