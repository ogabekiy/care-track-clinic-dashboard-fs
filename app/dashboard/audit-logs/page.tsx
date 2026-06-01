'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useMemo } from 'react'
import { useGetAuditLogsQuery } from '@/redux/api/audit-logsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditLog {
  id: string
  user_id: string
  action: 'POST' | 'PATCH' | 'DELETE' | string
  entity_type: string
  entity_id: string
  old_values: Record<string, unknown> | null
  new_values: {
    body?: Record<string, unknown>
    response?: Record<string, unknown>
  } | null
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  POST:   { label: 'Created',  color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30', icon: '＋' },
  PATCH:  { label: 'Updated',  color: 'bg-blue-500/15    text-blue-600    dark:text-blue-400    border border-blue-500/30',    icon: '✎' },
  DELETE: { label: 'Deleted',  color: 'bg-red-500/15     text-red-600     dark:text-red-400     border border-red-500/30',     icon: '✕' },
}

const ENTITY_ICON: Record<string, string> = {
  users:             '👤',
  patients:          '🏥',
  doctors:           '🩺',
  diagnoses:         '📋',
  departments:       '🏢',
  'medical-documents': '📄',
}

function getActionConfig(action: string) {
  return ACTION_CONFIG[action] ?? { label: action, color: 'bg-muted text-muted-foreground border border-border', icon: '•' }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    relative: getRelativeTime(d),
  }
}

function getRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'hozirgina'
  if (mins < 60)  return `${mins} daqiqa oldin`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs} soat oldin`
  const days = Math.floor(hrs / 24)
  if (days < 7)   return `${days} kun oldin`
  return date.toLocaleDateString('uz-UZ')
}

function buildDescription(log: AuditLog): string {
  const entity = log.entity_type.replace(/-/g, ' ')
  switch (log.action) {
    case 'POST':   return `Yangi ${entity} yaratildi (ID: ${log.entity_id})`
    case 'PATCH':  return `${entity} tahrirlandi (ID: ${log.entity_id})`
    case 'DELETE': return `${entity} o'chirildi (ID: ${log.entity_id})`
    default:       return `${entity} ustida ${log.action} amal bajarildi`
  }
}

function ChangesPreview({ log }: { log: AuditLog }) {
  const body = log.new_values?.body
  if (!body || Object.keys(body).length === 0) return null

  const entries = Object.entries(body).filter(([, v]) => v !== null && typeof v !== 'object')
  if (entries.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {entries.slice(0, 4).map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 text-xs bg-muted/60 rounded-md px-2 py-1 font-mono"
        >
          <span className="text-muted-foreground">{key}:</span>
          <span className="text-foreground font-medium truncate max-w-[120px]">
            {String(value)}
          </span>
        </span>
      ))}
      {entries.length > 4 && (
        <span className="text-xs text-muted-foreground px-2 py-1">
          +{entries.length - 4} ta maydon
        </span>
      )}
    </div>
  )
}

// ─── Details Modal ─────────────────────────────────────────────────────────────

function DetailsModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{ENTITY_ICON[log.entity_type] ?? '📁'}</span>
            <div>
              <h3 className="font-semibold text-foreground">
                Log #{log.id} — {log.entity_type}
              </h3>
              <p className="text-xs text-muted-foreground">{formatDate(log.created_at).date} {formatDate(log.created_at).time}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">✕</Button>
        </div>
        <div className="p-6 space-y-6">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Amal', getActionConfig(log.action).label],
              ['Entity turi', log.entity_type],
              ['Entity ID', log.entity_id],
              ['Foydalanuvchi ID', log.user_id],
            ].map(([label, value]) => (
              <div key={label} className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Body (what was sent) */}
          {log.new_values?.body && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Yuborilgan ma'lumotlar
              </h4>
              <pre className="bg-muted/50 rounded-lg p-4 text-xs text-foreground overflow-x-auto">
                {JSON.stringify(log.new_values.body, null, 2)}
              </pre>
            </div>
          )}

          {/* Response */}
          {log.new_values?.response && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Server javobi
              </h4>
              <pre className="bg-muted/50 rounded-lg p-4 text-xs text-foreground overflow-x-auto">
                {JSON.stringify(log.new_values.response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('ALL')
  const [entityFilter, setEntityFilter] = useState<string>('ALL')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  const { data, isLoading, isError, refetch } = useGetAuditLogsQuery({})
  console.log('Fetched audit logs:', data)
  // Admin only
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Kirish taqiqlangan</h3>
        <p className="text-muted-foreground">Faqat adminlar audit loglarni ko'ra oladi.</p>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-16 border border-destructive/30 rounded-xl bg-destructive/5">
        <p className="text-destructive font-medium mb-3">Ma'lumotlarni yuklashda xatolik yuz berdi</p>
        <Button variant="outline" onClick={() => refetch()}>Qayta urinish</Button>
      </div>
    )
  }

  const logs: AuditLog[] = data?.data ?? []

  // Sort by date descending (newest first)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Unique entity types for filter
  const entityTypes = ['ALL', ...Array.from(new Set(sortedLogs.map((l) => l.entity_type)))]

  // Filter
  const filteredLogs = sortedLogs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_id.includes(searchQuery) ||
      log.entity_id.includes(searchQuery) ||
      JSON.stringify(log.new_values).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter
    const matchesEntity = entityFilter === 'ALL' || log.entity_type === entityFilter

    return matchesSearch && matchesAction && matchesEntity
  })

  // Stats
  const stats = {
    total: logs.length,
    post: logs.filter((l) => l.action === 'POST').length,
    patch: logs.filter((l) => l.action === 'PATCH').length,
    delete: logs.filter((l) => l.action === 'DELETE').length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Loglari</h1>
          <p className="text-muted-foreground mt-1">
            Tizimda bajarilgan barcha amallarni kuzating
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Yangilash
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Jami", value: stats.total, color: "text-foreground" },
          { label: "Yaratildi", value: stats.post, color: "text-emerald-500" },
          { label: "Tahrirlandi", value: stats.patch, color: "text-blue-500" },
          { label: "O'chirildi", value: stats.delete, color: "text-red-500" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Qidirish: entity, amal, foydalanuvchi ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-muted/50 border-border/50 flex-1"
        />
        {/* Action filter */}
        <div className="flex gap-2">
          {['ALL', 'POST', 'PATCH', 'DELETE'].map((a) => (
            <button
              key={a}
              onClick={() => setActionFilter(a)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                actionFilter === a
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted'
              }`}
            >
              {a === 'ALL' ? 'Barchasi' : getActionConfig(a).label}
            </button>
          ))}
        </div>
        {/* Entity filter */}
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {entityTypes.map((e) => (
            <option key={e} value={e}>
              {e === 'ALL' ? 'Barcha entitylar' : `${ENTITY_ICON[e] ?? ''} ${e}`}
            </option>
          ))}
        </select>
      </div>

      {/* Result count */}
      <p className="text-sm text-muted-foreground -mt-4">
        {filteredLogs.length} ta log topildi
      </p>

      {/* Timeline */}
      <div className="relative space-y-0">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 border border-border/50 rounded-xl">
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="text-lg font-semibold text-foreground mb-1">Log topilmadi</h3>
            <p className="text-muted-foreground">Qidiruv mezonlarini o'zgartiring</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const actionCfg = getActionConfig(log.action)
            const { date, time, relative } = formatDate(log.created_at)
            const entityIcon = ENTITY_ICON[log.entity_type] ?? '📁'
            const isLast = index === filteredLogs.length - 1

            return (
              <div key={log.id} className="flex gap-4 group">
                {/* Timeline column */}
                <div className="flex flex-col items-center w-8 shrink-0 pt-5">
                  <div
                    className={`w-3 h-3 rounded-full border-2 shrink-0 z-10 ${
                      log.action === 'DELETE'
                        ? 'bg-red-500 border-red-500'
                        : log.action === 'POST'
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-blue-500 border-blue-500'
                    }`}
                  />
                  {!isLast && <div className="w-px flex-1 bg-border/40 mt-1" />}
                </div>

                {/* Card */}
                <div className="flex-1 pb-4">
                  <Card className="border-border/40 hover:border-border hover:shadow-sm transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Top row */}
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-base">{entityIcon}</span>
                            <span className="text-sm font-semibold text-foreground capitalize">
                              {log.entity_type.replace(/-/g, ' ')}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${actionCfg.color}`}
                            >
                              <span>{actionCfg.icon}</span>
                              {actionCfg.label}
                            </span>
                            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                              ID: {log.entity_id}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-foreground/80">{buildDescription(log)}</p>

                          {/* Changed fields preview */}
                          <ChangesPreview log={log} />

                          {/* Bottom meta */}
                          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Foydalanuvchi #{log.user_id}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span title={`${date} ${time}`}>{relative}</span>
                            </span>
                            <span className="text-muted-foreground/60">{date} · {time}</span>
                          </div>
                        </div>

                        {/* Details button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setSelectedLog(log)}
                        >
                          Batafsil
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <DetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  )
}