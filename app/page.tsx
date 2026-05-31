
'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth, type UserRole } from '@/lib/auth-context'

import { useLoginMutation } from '@/redux/api/authApi'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const roles: Array<{
  value: UserRole
  label: string
  description: string
}> = [
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Full access to all features',
  },
  {
    value: 'doctor',
    label: 'Doctor',
    description: 'Access to patient and diagnostic data',
  },
  {
    value: 'staff',
    label: 'Staff',
    description: 'Limited access to patient records',
  },
]

export default function LoginPage() {
  const router = useRouter()

  const { setAuthUser } = useAuth()

  const [selectedRole, setSelectedRole] =
    useState<UserRole>('doctor')

  const [email, setEmail] =
    useState('demo@hospital.com')

  const [password, setPassword] =
    useState('password')

  const [
    loginMutation,
    {
      isLoading,
      isError,
      error,
    },
  ] = useLoginMutation()

  async function handleLogin(
    e: FormEvent
  ) {
    e.preventDefault()

    try {
      const response = await loginMutation({
        email,
        password,
        role: selectedRole,
      }).unwrap()
      console.log('Login successful:', response)
      localStorage.setItem(
        'accessToken',
        response.data.accessToken
      )
      localStorage.setItem(
        'refreshToken',
        response.data.refreshToken
      )

      setAuthUser(response.data.user)

      router.push('/dashboard')
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="relative w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>
              Hospital Dashboard
            </CardTitle>

            <CardDescription>
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >
              {/* Roles */}
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() =>
                      setSelectedRole(role.value)
                    }
                    className={`w-full border rounded-lg p-3 text-left transition ${
                      selectedRole === role.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    <div className="font-semibold">
                      {role.label}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {role.description}
                    </div>
                  </button>
                ))}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label>Email</label>

                <Input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label>Password</label>

                <Input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />
              </div>

              {/* Error */}
              {isError && (
                <p className="text-sm text-red-500">
                  Login failed
                </p>
              )}

              {/* Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading
                  ? 'Signing in...'
                  : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
