import { AppRoutes } from "../routes/AppRoutes";
import { AuthProvider } from "../services/auth/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
