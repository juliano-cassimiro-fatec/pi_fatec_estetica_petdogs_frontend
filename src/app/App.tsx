import { AppRoutes } from "../routes/AppRoutes";
import { AuthProvider } from "../services/auth/AuthProvider";
import { ToastProvider } from "../components/ui/ToastProvider.tsx";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
