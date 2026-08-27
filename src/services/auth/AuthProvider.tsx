import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { AuthUser, LoginCredentials, RegisterCustomerData } from "../../features/shared/types";
import { authService } from "./authService";
import { AuthContext, type AuthStatus } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const hasToken = authService.hasStoredToken();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(hasToken ? "checking" : "unauthenticated");

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
    if (!hasToken) return;
    void authService
      .getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch(signOut);
  }, [hasToken, signOut]);

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
  return (
    <AuthContext.Provider value={{ user, status, signIn, register, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
