'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import {
  useCreateDiagnosisMutation,
  useDeleteDiagnosisMutation,
  useGetDiagnosesQuery,
  useUpdateDiagnosisMutation,
} from '@/redux/api/diagnosisApi'
import { useGetPatientsQuery } from '@/redux/api/patientsApi'
import { useGetDoctorsQuery } from '@/redux/api/doctorsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Diagnosis {
  id: string
  patient_id: number
  patient_name: string
  icd_code: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  notes: string
  doctor_id: number
  doctor_name: string
  status?: 'pending' | 'confirmed' | 'resolved'
  date?: string
}

interface DiagnosisFormData {
  patient_id: number
  icd_code: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  notes: string
  doctor_id: number
}

const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical'] as const

// ─── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            Bekor qilish
          </Button>
          <Button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'O\'chirilmoqda...' : 'O\'chirish'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Diagnosis Modal (Create / Edit) ──────────────────────────────────────────

function DiagnosisModal({
  open,
  mode,
  initial,
  patients,
  doctors,
  onSubmit,
  onClose,
  loading,
}: {
  open: boolean
  mode: 'create' | 'edit'
  initial?: Partial<DiagnosisFormData>
  patients: { id: string; name: string }[]
  doctors: { id: string; name: string }[]
  onSubmit: (data: DiagnosisFormData) => void
  onClose: () => void
  loading?: boolean
}) {
  const [form, setForm] = useState<DiagnosisFormData>({
    patient_id: 0,
    icd_code: '',
    description: '',
    severity: 'low',
    notes: '',
    doctor_id: 0,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof DiagnosisFormData, string>>>({})

  useEffect(() => {
    if (open) {
      setForm({
        patient_id: initial?.patient_id ?? 0,
        icd_code: initial?.icd_code ?? '',
        description: initial?.description ?? '',
        severity: initial?.severity ?? 'low',
        notes: initial?.notes ?? '',
        doctor_id: initial?.doctor_id ?? 0,
      })
      setErrors({})
    }
  }, [open, initial])

  const validate = (): boolean => {
    const errs: Partial<Record<keyof DiagnosisFormData, string>> = {}
    if (!form.patient_id) errs.patient_id = 'Majburiy'
    if (!SEVERITY_OPTIONS.includes(form.severity)) errs.severity = 'Noto\'g\'ri'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (validate()) onSubmit(form)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-xl font-bold text-foreground">
            {mode === 'create' ? 'Yangi Diagnoz' : 'Diagnozni Tahrirlash'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Patient */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Bemor <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.patient_id}
              onChange={(e) => setForm({ ...form, patient_id: Number(e.target.value) })}
            >
              <option value={0}>Bemorni tanlang</option>
              {patients.map((p) => (
                <option key={p.id} value={Number(p.id)}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p className="text-xs text-red-500 mt-1">{errors.patient_id}</p>
            )}
          </div>

          {/* Doctor */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Shifokor</label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.doctor_id}
              onChange={(e) => setForm({ ...form, doctor_id: Number(e.target.value) })}
            >
              <option value={0}>Shifokorni tanlang</option>
              {doctors.map((d) => (
                <option key={d.id} value={Number(d.id)}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* ICD Code */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">ICD Kodi</label>
            <Input
              placeholder="Masalan: I10, J00..."
              value={form.icd_code}
              onChange={(e) => setForm({ ...form, icd_code: e.target.value })}
              className="bg-muted/30 border-border/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tavsif</label>
            <Input
              placeholder="Diagnoz tavsifi..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-muted/30 border-border/50"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Og'irlik darajasi <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {SEVERITY_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, severity: s })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.severity === s
                      ? getSeverityActive(s)
                      : 'border-border/50 text-muted-foreground hover:border-border bg-muted/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Izohlar</label>
            <textarea
              rows={3}
              placeholder="Qo'shimcha izohlar..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saqlanmoqda...' : mode === 'create' ? 'Yaratish' : 'Saqlash'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Color Helpers ─────────────────────────────────────────────────────────────

function getSeverityActive(severity: string) {
  switch (severity) {
    case 'critical': return 'border-red-500 bg-red-500/20 text-red-600 dark:text-red-400'
    case 'high': return 'border-orange-500 bg-orange-500/20 text-orange-600 dark:text-orange-400'
    case 'medium': return 'border-yellow-500 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
    case 'low': return 'border-green-500 bg-green-500/20 text-green-600 dark:text-green-400'
    default: return 'border-border bg-muted text-muted-foreground'
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return 'bg-red-500/20 text-red-700 dark:text-red-400'
    case 'high': return 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
    case 'medium': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
    case 'low': return 'bg-green-500/20 text-green-700 dark:text-green-400'
    default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'confirmed': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
    case 'pending': return 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
    case 'resolved': return 'bg-green-500/20 text-green-700 dark:text-green-400'
    default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
  }
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DiagnosesPage() {
  const { user } = useAuth()
  const role = user?.role // 'admin' | 'doctor' | 'staff'
  const canEdit = role === 'doctor'

  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Diagnosis | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Diagnosis | null>(null)

  // API hooks
  const { data: diagnosesData, isLoading, refetch } = useGetDiagnosesQuery(undefined)
  const { data: patientsData } = useGetPatientsQuery(undefined)
  const { data: doctorsData } = useGetDoctorsQuery(undefined)
  const [createDiagnosis, { isLoading: creating }] = useCreateDiagnosisMutation()
  const [updateDiagnosis, { isLoading: updating }] = useUpdateDiagnosisMutation()
  const [deleteDiagnosis, { isLoading: deleting }] = useDeleteDiagnosisMutation()

  // API data — patients va doctors .data ichida keladi
  const diagnoses: Diagnosis[] = diagnosesData?.data ?? diagnosesData ?? []
  const patients: { id: string; name: string }[] = (patientsData?.data ?? []).map(
    (p: any) => ({ id: String(p.id), name: p.first_name ?? p.full_name ?? p.patient_name })
  )
  const doctors: { id: string; name: string }[] = (doctorsData?.data ?? []).map(
    (d: any) => ({ id: String(d.id), name: d.first_name ?? d.full_name ?? d.doctor_name })
  )

  // Filter
  const filteredDiagnoses = diagnoses.filter((d) => {
    const q = searchQuery.toLowerCase()
    return (
      d.patient_name?.toLowerCase().includes(q) ||
      d.doctor_name?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.icd_code?.toLowerCase().includes(q)
    )
  })

  // Handlers
  const handleCreate = async (data: DiagnosisFormData) => {
    try {
      console.log('Creating diagnosis:', data)
      await createDiagnosis(data).unwrap()
      setCreateOpen(false)
      refetch()
    } catch (err) {
      console.error('Create error:', err)
    }
  }

  const handleEdit = async (data: DiagnosisFormData) => {
    if (!editTarget) return
    try {
      await updateDiagnosis({ id: editTarget.id, ...data }).unwrap()
      setEditOpen(false)
      setEditTarget(null)
      refetch()
    } catch (err) {
      console.error('Update error:', err)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteDiagnosis(deleteTarget.id).unwrap()
      setDeleteOpen(false)
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const openEdit = (diagnosis: Diagnosis) => {
    setEditTarget(diagnosis)
    setEditOpen(true)
  }

  const openDelete = (diagnosis: Diagnosis) => {
    setDeleteTarget(diagnosis)
    setDeleteOpen(true)
  }

  // Stats
  const totalCount = diagnoses.length
  const highCount = diagnoses.filter((d) => d.severity === 'high' || d.severity === 'critical').length
  const pendingCount = diagnoses.filter((d) => d.status === 'pending').length
  const resolvedCount = diagnoses.filter((d) => d.status === 'resolved').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Diagnozlar</h1>
          <p className="text-muted-foreground mt-1">Bemorlar diagnozlarini boshqarish</p>
        </div>
        {canEdit && (
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
            + Yangi Diagnoz
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Bemor ismi, shifokor ismi, ICD kodi yoki tavsif bo'yicha qidiring..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Yuklanmoqda...
        </div>
      )}

      {/* Diagnoses List */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredDiagnoses.map((diagnosis) => (
            <Card
              key={diagnosis.id}
              className="border-border/50 hover:border-border transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      {diagnosis.description || 'Tavsif yo\'q'}
                      {diagnosis.icd_code && (
                        <span className="ml-2 text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                          {diagnosis.icd_code}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                      Bemor: <span className="font-medium text-foreground">{diagnosis.patient_name}</span>
                      {' • '}
                      Shifokor: <span className="font-medium text-foreground">{diagnosis.doctor_name}</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <Badge className={getSeverityColor(diagnosis.severity)}>
                      {diagnosis.severity}
                    </Badge>
                    {diagnosis.status && (
                      <Badge className={getStatusColor(diagnosis.status)}>
                        {diagnosis.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {diagnosis.date && (
                    <div>
                      <p className="text-muted-foreground">Sana</p>
                      <p className="font-medium text-foreground">
                        {new Date(diagnosis.date).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Bemor ID</p>
                    <p className="font-medium text-foreground font-mono">{diagnosis.patient_id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shifokor</p>
                    <p className="font-medium text-foreground">{diagnosis.doctor_name}</p>
                  </div>
                </div>

                {diagnosis.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Izohlar</p>
                    <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">
                      {diagnosis.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {canEdit && (
                  <div className="flex gap-2 pt-2 border-t border-border/30">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(diagnosis)}
                    >
                      Tahrirlash
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-500 hover:text-red-600 hover:border-red-400 hover:bg-red-500/5"
                      onClick={() => openDelete(diagnosis)}
                    >
                      O'chirish
                    </Button>
                    {diagnosis.status === 'pending' && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() =>
                          updateDiagnosis({ id: diagnosis.id, status: 'confirmed' })
                            .unwrap()
                            .then(() => refetch())
                        }
                      >
                        Tasdiqlash
                      </Button>
                    )}
                  </div>
                )}

                {/* Staff: only view */}
                {!canEdit && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground italic">
                      Siz faqat ko'rish huquqiga egasiz
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredDiagnoses.length === 0 && (
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">Diagnoz topilmadi</h3>
          <p className="text-muted-foreground">Qidiruv so'rovini o'zgartiring</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Jami', value: totalCount, color: 'text-foreground' },
          { label: 'Yuqori darajali', value: highCount, color: 'text-red-500' },
          { label: 'Kutilmoqda', value: pendingCount, color: 'text-orange-500' },
          { label: 'Hal qilingan', value: resolvedCount, color: 'text-green-500' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <DiagnosisModal
        open={createOpen}
        mode="create"
        patients={patients}
        doctors={doctors}
        onSubmit={handleCreate}
        onClose={() => setCreateOpen(false)}
        loading={creating}
      />

      {/* Edit Modal */}
      <DiagnosisModal
        open={editOpen}
        mode="edit"
        initial={
          editTarget
            ? {
                patient_id: editTarget.patient_id,
                icd_code: editTarget.icd_code,
                description: editTarget.description,
                severity: editTarget.severity,
                notes: editTarget.notes,
                doctor_id: editTarget.doctor_id,
              }
            : undefined
        }
        patients={patients}
        doctors={doctors}
        onSubmit={handleEdit}
        onClose={() => {
          setEditOpen(false)
          setEditTarget(null)
        }}
        loading={updating}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={deleteOpen}
        title="Diagnozni o'chirish"
        description={`"${deleteTarget?.description || 'Bu diagnoz'}" ni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteOpen(false)
          setDeleteTarget(null)
        }}
        loading={deleting}
      />
    </div>
  )
}