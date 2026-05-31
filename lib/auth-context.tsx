
'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

export type UserRole = 'admin' | 'doctor' | 'staff'

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: UserRole
  is_active: boolean
  avatar: string
}


interface AuthContextType {
  user: User | null
  setAuthUser: (user: User) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)

  // Restore auth state
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const savedUser = localStorage.getItem('auth-user')

      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error('Failed to restore auth:', error)
    }
  }, [])

  const setAuthUser = (userData: User) => {
    setUser(userData)

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'auth-user',
        JSON.stringify(userData)
      )
    }
  }

  const logout = () => {
    setUser(null)

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-user')
      localStorage.removeItem('token')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setAuthUser,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    )
  }

  return context
}
