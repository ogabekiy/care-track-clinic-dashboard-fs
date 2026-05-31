'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCreatePatientMutation,
  useGetPatientsQuery,
  useDeletePatientMutation,
  useUpdatePatientMutation,
} from '@/redux/api/patientsApi'
import { useGetDoctorsQuery } from '@/redux/api/doctorsApi'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Patient {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  gender: 'male' | 'female' | 'other' | null
  phone: string | null
  email: string | null
  address: string | null
  blood_type: string | null
  assigned_doctor_id: string | null
  assigned_doctor_name?: string | null
  status?: string
  created_at?: string
}

interface Doctor {
  id: string
  first_name: string
  last_name: string
}

type PatientForm = {
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  phone: string
  email: string
  address: string
  blood_type: string
  assigned_doctor_id: string
}

const defaultForm: PatientForm = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  blood_type: '',
  assigned_doctor_id: '',
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GENDERS = ['male', 'female', 'other']

// ─── Component ────────────────────────────────────────────────────────────────
export default function PatientsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [form, setForm] = useState<PatientForm>(defaultForm)
  const [formError, setFormError] = useState<string | null>(null)

  // ── API hooks ──
  const { data: patientsData, isLoading, isError, refetch } = useGetPatientsQuery({})
  const { data: doctorsData } = useGetDoctorsQuery({})
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation()
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation()
  const [deletePatient, { isLoading: isDeleting }] = useDeletePatientMutation()

  const patients: Patient[] = patientsData?.data ?? patientsData ?? []
  const doctors: Doctor[] = doctorsData?.data ?? doctorsData ?? []

  // ── Derived stats ──
  const totalPatients = patients.length
  const admittedCount = patients.filter((p) => p.status === 'admitted').length
  const dischargedCount = patients.filter((p) => p.status === 'discharged').length

  // ── Search filter ──
  const filteredPatients = patients.filter((p) => {
    const name = `${p.first_name} ${p.last_name}`.toLowerCase()
    const doctorName = (p.assigned_doctor_name ?? '').toLowerCase()
    const q = searchQuery.toLowerCase()
    return (
      name.includes(q) ||
      doctorName.includes(q) ||
      (p.email ?? '').toLowerCase().includes(q) ||
      (p.phone ?? '').includes(q)
    )
  })

  // ── Helpers ──
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'admitted':   return 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
      case 'active':     return 'bg-green-500/20 text-green-700 dark:text-green-400'
      case 'discharged': return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
      default:           return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
    }
  }

  const calcAge = (dob: string | null) => {
    if (!dob) return '—'
    const diff = Date.now() - new Date(dob).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  }

  const doctorFullName = (id: string | null) => {
    if (!id) return '—'
    const doc = doctors.find((d) => String(d.id) === String(id))
    return doc ? `${doc.first_name} ${doc.last_name}` : '—'
  }

  // ── Build payload (strip empty optional fields) ──
  const buildPayload = (f: PatientForm) => ({
    first_name: f.first_name,
    last_name: f.last_name,
    date_of_birth: f.date_of_birth,
    gender: f.gender,
    ...(f.phone           && { phone: f.phone }),
    ...(f.email           && { email: f.email }),
    ...(f.address         && { address: f.address }),
    ...(f.blood_type      && { blood_type: f.blood_type }),
    ...(f.assigned_doctor_id && { assigned_doctor_id: f.assigned_doctor_id }),
  })

  // ── Add ──
  const handleAddOpen = () => {
    setForm(defaultForm)
    setFormError(null)
    setAddOpen(true)
  }

  const handleAddSubmit = async () => {
    setFormError(null)
    try {
      await createPatient(buildPayload(form)).unwrap()
      setAddOpen(false)
      refetch()
    } catch (err: any) {
      const msgs = err?.data?.errors ?? []
      setFormError(msgs.length ? msgs.join(', ') : (err?.data?.message ?? 'Xatolik yuz berdi'))
    }
  }

  // ── Edit ──
  const handleEditOpen = (patient: Patient) => {
    setSelectedPatient(patient)
    setForm({
      first_name: patient.first_name,
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth ?? '',
      gender: patient.gender ?? '',
      phone: patient.phone ?? '',
      email: patient.email ?? '',
      address: patient.address ?? '',
      blood_type: patient.blood_type ?? '',
      assigned_doctor_id: patient.assigned_doctor_id ?? '',
    })
    setFormError(null)
    setEditOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!selectedPatient) return
    setFormError(null)
    try {
      await updatePatient({ id: selectedPatient.id, ...buildPayload(form) }).unwrap()
      setEditOpen(false)
      refetch()
    } catch (err: any) {
      const msgs = err?.data?.errors ?? []
      setFormError(msgs.length ? msgs.join(', ') : (err?.data?.message ?? 'Xatolik yuz berdi'))
    }
  }

  // ── Delete ──
  const handleDeleteOpen = (patient: Patient) => {
    setSelectedPatient(patient)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPatient) return
    try {
      await deletePatient(selectedPatient.id).unwrap()
      setDeleteOpen(false)
      refetch()
    } catch {
      // silent
    }
  }

  // ── Shared form fields ──
  const renderFormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First name <span className="text-destructive">*</span></Label>
          <Input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} placeholder="John" />
        </div>
        <div className="space-y-2">
          <Label>Last name <span className="text-destructive">*</span></Label>
          <Input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} placeholder="Doe" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date of birth <span className="text-destructive">*</span></Label>
          <Input type="date" value={form.date_of_birth} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Gender <span className="text-destructive">*</span></Label>
          <Select value={form.gender} onValueChange={(val) => setForm((f) => ({ ...f, gender: val }))}>
            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998901234567" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="patient@mail.ru" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Tashkent, Chilonzor..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Blood type</Label>
          <Select value={form.blood_type} onValueChange={(val) => setForm((f) => ({ ...f, blood_type: val }))}>
            <SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger>
            <SelectContent>
              {BLOOD_TYPES.map((bt) => (
                <SelectItem key={bt} value={bt}>{bt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Assigned doctor</Label>
          <Select value={form.assigned_doctor_id} onValueChange={(val) => setForm((f) => ({ ...f, assigned_doctor_id: val }))}>
            <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
            <SelectContent>
              {doctors.map((doc) => (
                <SelectItem key={doc.id} value={String(doc.id)}>
                  {doc.first_name} {doc.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}
    </div>
  )

  // ── Render ──
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-1">View and manage all patient records</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleAddOpen}>
          New Patient
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, phone, or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">Loading patients...</div>
      )}
      {isError && (
        <div className="text-center py-12 text-destructive">
          Failed to load patients.{' '}
          <Button variant="link" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 border-b border-border/50">
                  {['Name', 'Age', 'Gender', 'Blood type', 'Assigned doctor', 'Phone', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-foreground whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-border/30 hover:bg-muted/20 transition-colors last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {patient.first_name} {patient.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{patient.email ?? '—'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {calcAge(patient.date_of_birth)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground capitalize">
                      {patient.gender ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {patient.blood_type ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {patient.assigned_doctor_name ?? doctorFullName(patient.assigned_doctor_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {patient.phone ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      {patient.status ? (
                        <Badge className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                          onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOpen(patient)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteOpen(patient)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && !isError && filteredPatients.length === 0 && (
        <div className="text-center py-12 border border-border/50 rounded-lg">
          <svg className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">No patients found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-3xl font-bold text-foreground">{totalPatients}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Currently Admitted</p>
              <p className="text-3xl font-bold text-foreground">{admittedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Discharged</p>
              <p className="text-3xl font-bold text-foreground">{dischargedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Add Modal ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Patient</DialogTitle>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit} disabled={isCreating}>
              {isCreating ? 'Saving...' : 'Create Patient'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Modal ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">
              {selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : ''}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}