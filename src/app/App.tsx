import { AppRoutes } from "../routes/AppRoutes"
import { AuthProvider } from "./AuthContext"

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
