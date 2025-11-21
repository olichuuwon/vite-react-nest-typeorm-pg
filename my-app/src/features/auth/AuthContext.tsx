import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from 'react'

type User = {
  id: string
  name: string
  role: 'admin' | 'member'
}

type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (identifier: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Minimal skeleton: no saved token check yet
    setIsLoading(false)
  }, [])

  const login = useCallback(async () => {
    // TODO: Replace with real authentication logic
    setUser({ id: '1', name: 'Demo User', role: 'admin' })
    setToken('fake-token')
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
