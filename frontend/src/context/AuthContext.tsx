import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'
import { setAuthToken } from '../api/client'
import { loginWithIdentifier } from '../api/auth'
import type { UserDto, LoginResponseDto } from '../../../shared/dto/auth.dto'

type AuthContextValue = {
  user: UserDto | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (identifier: string) => Promise<LoginResponseDto>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_STORAGE_KEY = 'app_token'
const USER_STORAGE_KEY = 'app_user'

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserDto | null>(null)
  const [isHydrating, setIsHydrating] = useState(true)

  const queryClient = useQueryClient()
  const toast = useToast()

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)

    if (storedToken) {
      setToken(storedToken)
      setAuthToken(storedToken)
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as UserDto)
      } catch {
        console.log('Stored user is invalid JSON')
      }
    }

    setIsHydrating(false)
  }, [])

  const loginMutation = useMutation({
    mutationFn: loginWithIdentifier,
    onSuccess: ({ accessToken, user }) => {
      setToken(accessToken)
      setUser(user)

      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))

      setAuthToken(accessToken)
      queryClient.clear()

      toast({
        title: `Hello, ${user.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error) => {
      const anyErr = error as any
      const message = anyErr?.response?.data?.message ?? anyErr?.message ?? 'Login failed'

      toast({
        title: 'Login failed',
        description: message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    },
  })

  const login = (identifier: string) => loginMutation.mutateAsync(identifier)

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    setAuthToken(null)
    queryClient.clear()

    toast({
      title: 'Logged out',
      status: 'info',
      duration: 2500,
      isClosable: true,
    })
  }

  const isLoading = isHydrating || loginMutation.isPending

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
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
