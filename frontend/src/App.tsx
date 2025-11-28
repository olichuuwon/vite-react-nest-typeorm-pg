import { Router } from './Router'
import { AuthProvider } from './features/auth/AuthContext'

const App = () => {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}

export default App
