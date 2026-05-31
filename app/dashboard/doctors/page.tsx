'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Label } from '@/components/ui/label'
import { useCreateUserMutation, useUpdateUserMutation } from '@/redux/api/usersApi'
import {
  useDeleteDoctorMutation,
  useGetDoctorsQuery,
  
  useUpdateDoctorMutation,
} from '@/redux/api/doctorsApi'
import { useGetDepartmentsQuery,useGetDepartmentByIdQuery} from '@/redux/api/departmentsApi'

// ─── Types ────────────────────────────────────────────────────────────────────
// Flat structure returned by GET /doctors
interface Doctor {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  specialization: string
  department_id: string | null
  department_name: string | null
  room_number: string | null
  availability: 'available' | 'busy' | 'offline'
  rating?: number
  patients?: number
}

interface AddDoctorForm {
  first_name: string
  last_name: string
  email: string
  password: string
  phone: string
  specialization: string
  department_id: string
  room_number: string
  availability: string
}

interface EditDoctorForm {
  first_name: string
  last_name: string
  email: string
  phone: string
  specialization: string
  department_id: string
  room_number: string
  availability: string
}

const defaultAddForm: AddDoctorForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phone: '',
  specialization: '',
  department_id: '',
  room_number: '',
  availability: 'available',
}

// ─── Department badge — fetches by id only when department_id exists ──────────
function DepartmentName({ departmentId }: { departmentId: string | null }) {
  const { data } = useGetDepartmentByIdQuery(
    { id: departmentId ?? '' },
    { skip: !departmentId }
  )
  if (!departmentId) return <span className="font-medium text-foreground">—</span>
  const name = data?.data?.name ?? data?.name ?? '...'
  return <span className="font-medium text-foreground">{name}</span>
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [addForm, setAddForm] = useState<AddDoctorForm>(defaultAddForm)
  const [editForm, setEditForm] = useState<EditDoctorForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: '',
    department_id: '',
    room_number: '',
    availability: 'available',
  })
  const [addError, setAddError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  // ── API hooks ──
  const { data: doctorsData, isLoading, isError, refetch } = useGetDoctorsQuery({})
  const { data: departmentsData } = useGetDepartmentsQuery(undefined)
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation()
  const [updateDoctor, { isLoading: isUpdatingDoctor }] = useUpdateDoctorMutation()
  const [deleteDoctor, { isLoading: isDeleting }] = useDeleteDoctorMutation()

  const doctors: Doctor[] = doctorsData?.data ?? doctorsData ?? []
  const departments = departmentsData?.data ?? departmentsData ?? []

  // ── Filtering ──
  const filteredDoctors = doctors.filter((d) => {
    const name = `${d.first_name} ${d.last_name}`.toLowerCase()
    const spec = (d.specialization ?? '').toLowerCase()
    const dept = (d.department_name ?? '').toLowerCase()
    const q = searchQuery.toLowerCase()
    return name.includes(q) || spec.includes(q) || dept.includes(q)
  })

  // ── Add Doctor ──
  const handleAddOpen = () => {
    setAddForm(defaultAddForm)
    setAddError(null)
    setAddOpen(true)
  }

  const handleAddSubmit = async () => {
    setAddError(null)
    try {
      await createUser({
        first_name: addForm.first_name,
        last_name: addForm.last_name,
        role: 'doctor',
        email: addForm.email,
        password: addForm.password,
        phone: addForm.phone,
        doctor_profile: {
          specialization: addForm.specialization,
          ...(addForm.department_id && { department_id: addForm.department_id }),
          ...(addForm.room_number && { room_number: addForm.room_number }),
          availability: addForm.availability,
        },
      }).unwrap()
      setAddOpen(false)
      refetch()
    } catch (err: any) {
      setAddError(err?.data?.message ?? 'Xatolik yuz berdi')
    }
  }

  // ── Edit Doctor ──
  const handleEditOpen = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setEditForm({
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      department_id: doctor.department_id ?? '',
      room_number: doctor.room_number ?? '',
      availability: doctor.availability,
    })
    setEditError(null)
    setEditOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!selectedDoctor) return
    setEditError(null)
    try {
      // 1. updateUser — foydalanuvchi ma'lumotlari (user_id ishlatiladi)
      await updateUser({
        id: selectedDoctor.user_id,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        phone: editForm.phone,
      }).unwrap()

      // 2. updateDoctor — doctor_profile (tekis, nested emas)
      await updateDoctor({
        id: selectedDoctor.id,
        specialization: editForm.specialization,
        ...(editForm.department_id && { department_id: editForm.department_id }),
        ...(editForm.room_number && { room_number: editForm.room_number }),
        availability: editForm.availability,
      }).unwrap()

      setEditOpen(false)
      refetch()
    } catch (err: any) {
      setEditError(err?.data?.message ?? 'Xatolik yuz berdi')
    }
  }

  // ── Delete Doctor ──
  const handleDeleteOpen = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedDoctor) return
    try {
      await deleteDoctor({ id: selectedDoctor.id }).unwrap()
      setDeleteOpen(false)
      refetch()
    } catch {
      // silent
    }
  }

  // ── Helpers ──
  const getAvailabilityColor = (availability?: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500/20 text-green-700 dark:text-green-400'
      case 'busy':      return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
      case 'offline':   return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
      default:          return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
    }
  }

  // ── Render ──
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctors</h1>
          <p className="text-muted-foreground mt-1">Manage and view all healthcare professionals</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleAddOpen}>
          Add Doctor
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, specialization, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">Loading doctors...</div>
      )}
      {isError && (
        <div className="text-center py-12 text-destructive">
          Failed to load doctors.{' '}
          <Button variant="link" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {/* Doctors Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="border-border/50 hover:border-border transition-colors hover:shadow-lg"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {doctor.first_name} {doctor.last_name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {doctor.specialization || '—'}
                    </CardDescription>
                  </div>
                  <Badge className={getAvailabilityColor(doctor.availability)}>
                    {doctor.availability}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Rating */}
                {doctor.rating !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(doctor.rating!)
                              ? 'text-yellow-500'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{doctor.rating}</span>
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Department</p>
                    {/* department_name bo'lsa ishlatamiz, bo'lmasa id orqali fetch */}
                    {doctor.department_name ? (
                      <p className="font-medium text-foreground">{doctor.department_name}</p>
                    ) : (
                      <DepartmentName departmentId={doctor.department_id} />
                    )}
                  </div>
                  {doctor.patients !== undefined && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Patients</p>
                      <p className="font-medium text-foreground">{doctor.patients}</p>
                    </div>
                  )}
                  {doctor.room_number && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Room</p>
                      <p className="font-medium text-foreground">{doctor.room_number}</p>
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div className="space-y-2 pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-muted-foreground truncate">{doctor.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-muted-foreground">{doctor.phone || '—'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                    onClick={() => handleEditOpen(doctor)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="text-sm text-destructive hover:text-destructive hover:border-destructive"
                    onClick={() => handleDeleteOpen(doctor)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !isError && filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">No doctors found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {/* ── Add Doctor Modal ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Doctor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input value={addForm.first_name} onChange={(e) => setAddForm((f) => ({ ...f, first_name: e.target.value }))} placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={addForm.last_name} onChange={(e) => setAddForm((f) => ({ ...f, last_name: e.target.value }))} placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} placeholder="doctor@mail.ru" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={addForm.password} onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={addForm.phone} onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998901234567" />
            </div>
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input value={addForm.specialization} onChange={(e) => setAddForm((f) => ({ ...f, specialization: e.target.value }))} placeholder="Cardiologist" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={addForm.department_id} onValueChange={(val) => setAddForm((f) => ({ ...f, department_id: val }))}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Room number</Label>
              <Input value={addForm.room_number} onChange={(e) => setAddForm((f) => ({ ...f, room_number: e.target.value }))} placeholder="101" />
            </div>
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select value={addForm.availability} onValueChange={(val) => setAddForm((f) => ({ ...f, availability: val }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {addError && <p className="text-sm text-destructive">{addError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit} disabled={isCreating}>
              {isCreating ? 'Saving...' : 'Add Doctor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Doctor Modal ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">User info</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input value={editForm.first_name} onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={editForm.last_name} onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>

            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide pt-2">Doctor profile</p>
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input value={editForm.specialization} onChange={(e) => setEditForm((f) => ({ ...f, specialization: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={editForm.department_id} onValueChange={(val) => setEditForm((f) => ({ ...f, department_id: val }))}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Room number</Label>
              <Input value={editForm.room_number} onChange={(e) => setEditForm((f) => ({ ...f, room_number: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select value={editForm.availability} onValueChange={(val) => setEditForm((f) => ({ ...f, availability: val }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editError && <p className="text-sm text-destructive">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={isUpdatingUser || isUpdatingDoctor}>
              {isUpdatingUser || isUpdatingDoctor ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Modal ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Doctor</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">
              {selectedDoctor ? `${selectedDoctor.first_name} ${selectedDoctor.last_name}` : ''}
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