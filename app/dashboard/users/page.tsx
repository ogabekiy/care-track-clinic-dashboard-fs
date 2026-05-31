'use client'

import { useAuth } from '@/lib/auth-context'
import { mockUsers } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function UsersPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  // Admin only
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-destructive/40 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4v2m0 4v2M6.343 17.657l1.414-1.414m2.828 0l1.414 1.414m4.243-4.243l1.414 1.414m0-2.828l1.414-1.414m-8.486-2.828l1.414-1.414m2.828 0l1.414 1.414"
          />
        </svg>
        <h3 className="text-lg font-semibold text-foreground mb-1">Access Denied</h3>
        <p className="text-muted-foreground">
          Only administrators can access this page.
        </p>
      </div>
    )
  }

  const filteredUsers = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-400'
      case 'doctor':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
      case 'staff':
        return 'bg-green-500/20 text-green-700 dark:text-green-400'
      case 'manager':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage system users and permissions
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, department, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Last Login
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors last:border-0"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {u.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <p className="font-medium text-foreground">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">{u.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getRoleColor(u.role)}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">{u.department}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        u.status === 'active'
                          ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                          : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                      }
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{u.lastLogin}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm" className="text-primary">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 border border-border/50 rounded-lg">
          <svg
            className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20H9v-2a6 6 0 0112 0v2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">No users found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold text-foreground">{mockUsers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Doctors</p>
              <p className="text-3xl font-bold text-blue-500">
                {mockUsers.filter((u) => u.role === 'doctor').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Staff Members</p>
              <p className="text-3xl font-bold text-green-500">
                {mockUsers.filter((u) => u.role === 'staff').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-3xl font-bold text-foreground">
                {mockUsers.filter((u) => u.status === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
