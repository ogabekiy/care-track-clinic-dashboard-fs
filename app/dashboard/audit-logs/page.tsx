'use client'

import { useAuth } from '@/lib/auth-context'
import { mockAuditLogs } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function AuditLogsPage() {
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
          Only administrators can access audit logs.
        </p>
      </div>
    )
  }

  const filteredLogs = mockAuditLogs.filter(
    (log) =>
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">
          Track all system activities and user actions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search by user, action, or resource..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-muted/50 border-border/50"
        />
      </div>

      {/* Logs Timeline */}
      <div className="space-y-4">
        {filteredLogs.map((log, index) => (
          <Card
            key={log.id}
            className="border-border/50 hover:border-border transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Timeline Marker */}
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    log.status === 'success'
                      ? 'bg-green-500 border-green-500'
                      : 'bg-red-500 border-red-500'
                  }`} />
                  {index < filteredLogs.length - 1 && (
                    <div className="w-1 h-12 bg-border/50 mt-2" />
                  )}
                </div>

                {/* Log Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-foreground">{log.user}</span>
                        <Badge variant="secondary" className="text-xs">
                          {log.action}
                        </Badge>
                        <Badge className={log.status === 'success' 
                          ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                          : 'bg-red-500/20 text-red-700 dark:text-red-400'
                        }>
                          {log.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-2">
                        {log.action} {log.resource}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {log.changes}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-mono">{log.ipAddress}</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary">
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">No logs found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-3xl font-bold text-foreground">{mockAuditLogs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="text-3xl font-bold text-green-500">
                {mockAuditLogs.filter((l) => l.status === 'success').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-3xl font-bold text-destructive">
                {mockAuditLogs.filter((l) => l.status === 'failure').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
