'use client'

import { ReactNode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'

import { store } from '@/redux/store'
import { AuthProvider } from '@/lib/auth-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ReduxProvider>
  )
}