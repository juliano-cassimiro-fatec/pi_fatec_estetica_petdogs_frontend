import { useCallback, useEffect, useState, type ReactNode } from "react";
import type {
  AuthUser,
  LoginCredentials,
  RegisterCustomerData,
  ForgotPasswordData,
  ResetPasswordData,
} from "../../features/shared/types";
import { authService } from "./authService";
import { AuthContext, type AuthStatus } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");

  const signOut = useCallback(() => {
    authService.signOut();
    setUser(null);
    setStatus("unauthenticated");
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
    let active = true;

    async function restoreSession() {
      if (!authService.hasStoredToken()) {
        if (active) setStatus("unauthenticated");
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (!active) return;
        setUser(currentUser);
        setStatus("authenticated");
      } catch {
        if (active) signOut();
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, [signOut]);

  useEffect(() => {
    window.addEventListener("petdogs:session-expired", signOut);
    return () => window.removeEventListener("petdogs:session-expired", signOut);
  }, [signOut]);

  async function signIn(credentials: LoginCredentials) {
    const session = await authService.signIn(credentials);
    setUser(session.user);
    setStatus("authenticated");
  }

  async function register(data: RegisterCustomerData) {
    const session = await authService.registerCustomer(data);
    setUser(session.user);
    setStatus("authenticated");
  }

  function forgotPassword(data: ForgotPasswordData) {
    return authService.forgotPassword(data);
  }

  function resetPassword(data: ResetPasswordData) {
    return authService.resetPassword(data);
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
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
