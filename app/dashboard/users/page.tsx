'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '@/redux/api/usersApi'

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = 'admin' | 'doctor' | 'staff'
type Availability = 'available' | 'busy' | 'offline'

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  role: UserRole
  is_active: boolean
  doctor_id?: string | null
  specialization?: string | null
  department_id?: string | null
  room_number?: string | null
  availability?: Availability | null
}

interface UserFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  role: UserRole
  password: string
  specialization: string
  room_number: string
  availability: Availability
}

const ROLES: UserRole[] = ['admin', 'doctor', 'staff']
const AVAILABILITY: Availability[] = ['available', 'busy', 'offline']

const EMPTY_FORM: UserFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'staff',
  password: '',
  specialization: '',
  room_number: '',
  availability: 'available',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fullName(u: User) {
  return [u.first_name, u.last_name].filter(Boolean).join(' ')
}

function initials(u: User) {
  return `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase() || '?'
}

function getRoleColor(role: string) {
  switch (role) {
    case 'admin': return 'bg-purple-500/20 text-purple-700 dark:text-purple-400'
    case 'doctor': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
    case 'staff': return 'bg-green-500/20 text-green-700 dark:text-green-400'
    default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
  }
}

function getAvailabilityColor(a: string) {
  switch (a) {
    case 'available': return 'bg-green-500/20 text-green-700 dark:text-green-400'
    case 'busy': return 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
    case 'offline': return 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
    default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
  }
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ─── Confirm Delete Modal ──────────────────────────────────────────────────────

function ConfirmModal({
  open,
  userName,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean
  userName: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-foreground">Foydalanuvchini o'chirish</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          <span className="font-medium text-foreground">"{userName}"</span> ni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            Bekor qilish
          </Button>
          <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={onConfirm} disabled={loading}>
            {loading ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── User Modal (Create / Edit) ───────────────────────────────────────────────
// Edit rejimida doctor_profile ko'rsatilmaydi — faqat asosiy ma'lumotlar

function UserModal({
  open,
  mode,
  initial,
  onSubmit,
  onClose,
  loading,
}: {
  open: boolean
  mode: 'create' | 'edit'
  initial?: User
  onSubmit: (data: UserFormData) => void
  onClose: () => void
  loading?: boolean
}) {
  const [form, setForm] = useState<UserFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initial) {
      setForm({
        first_name: initial.first_name ?? '',
        last_name: initial.last_name ?? '',
        email: initial.email ?? '',
        phone: initial.phone ?? '',
        role: initial.role,
        password: '',
        // edit rejimida doctor fields ko'rsatilmaydi — form uchun kerak emas
        specialization: '',
        room_number: '',
        availability: 'available',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
    setShowPassword(false)
  }, [open, mode, initial])

  const set = (key: keyof UserFormData, val: any) =>
    setForm((f) => ({ ...f, [key]: val }))

  const validate = () => {
    const e: typeof errors = {}
    if (!form.first_name.trim()) e.first_name = 'Majburiy'
    if (!form.last_name.trim()) e.last_name = 'Majburiy'
    if (!form.email.trim()) e.email = 'Majburiy'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email noto'g'ri"
    if (mode === 'create') {
      if (!form.password) e.password = 'Majburiy'
      else if (form.password.length < 6) e.password = 'Kamida 6 belgi'
      if (form.role === 'doctor' && !form.specialization.trim()) {
        e.specialization = 'Mutaxassislik majburiy'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (validate()) onSubmit(form)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 shrink-0">
          <h2 className="text-lg font-bold text-foreground">
            {mode === 'create' ? 'Yangi foydalanuvchi' : 'Foydalanuvchini tahrirlash'}
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

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ism" required error={errors.first_name}>
              <Input
                placeholder="Ism"
                value={form.first_name}
                onChange={(e) => set('first_name', e.target.value)}
                className="bg-muted/30 border-border/50"
              />
            </Field>
            <Field label="Familiya" required error={errors.last_name}>
              <Input
                placeholder="Familiya"
                value={form.last_name}
                onChange={(e) => set('last_name', e.target.value)}
                className="bg-muted/30 border-border/50"
              />
            </Field>
          </div>

          {/* Email */}
          <Field label="Email" required error={errors.email}>
            <Input
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="bg-muted/30 border-border/50"
            />
          </Field>

          {/* Phone */}
          <Field label="Telefon">
            <Input
              placeholder="+998901234567"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className="bg-muted/30 border-border/50"
            />
          </Field>

          {/* Role — edit rejimida o'zgartirib bo'lmaydi */}
          <Field label="Rol" required>
            {mode === 'create' ? (
              <div className="flex gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set('role', r)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                      form.role === r
                        ? r === 'admin'
                          ? 'border-purple-500 bg-purple-500/20 text-purple-700 dark:text-purple-400'
                          : r === 'doctor'
                          ? 'border-blue-500 bg-blue-500/20 text-blue-700 dark:text-blue-400'
                          : 'border-green-500 bg-green-500/20 text-green-700 dark:text-green-400'
                        : 'border-border/50 text-muted-foreground hover:border-border bg-muted/20'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            ) : (
              <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${getRoleColor(form.role)} border-current/20`}>
                {form.role}
                <span className="ml-2 text-xs opacity-60">(o'zgartirib bo'lmaydi)</span>
              </div>
            )}
          </Field>

          {/* Password */}
          <Field
            label={mode === 'edit' ? 'Yangi parol (ixtiyoriy)' : 'Parol'}
            required={mode === 'create'}
            error={errors.password}
          >
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Kamida 6 belgi"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                className="bg-muted/30 border-border/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </Field>

          {/* Doctor fields — faqat CREATE rejimida ko'rsatiladi */}
          {mode === 'create' && form.role === 'doctor' && (
            <div className="space-y-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Shifokor profili</p>

              <Field label="Mutaxassislik" required error={errors.specialization}>
                <Input
                  placeholder="Masalan: Kardiolog, Nevrolog..."
                  value={form.specialization}
                  onChange={(e) => set('specialization', e.target.value)}
                  className="bg-muted/30 border-border/50"
                />
              </Field>

              <Field label="Xona raqami">
                <Input
                  placeholder="Masalan: 204"
                  value={form.room_number}
                  onChange={(e) => set('room_number', e.target.value)}
                  className="bg-muted/30 border-border/50"
                />
              </Field>

              <Field label="Mavjudlik holati">
                <div className="flex gap-2">
                  {AVAILABILITY.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => set('availability', a)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                        form.availability === a
                          ? a === 'available'
                            ? 'border-green-500 bg-green-500/20 text-green-700 dark:text-green-400'
                            : a === 'busy'
                            ? 'border-orange-500 bg-orange-500/20 text-orange-700 dark:text-orange-400'
                            : 'border-gray-400 bg-gray-500/20 text-gray-600 dark:text-gray-400'
                          : 'border-border/50 text-muted-foreground hover:border-border bg-muted/20'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* Edit rejimida doctor ekanligini ko'rsatish (read-only) */}
          {mode === 'edit' && initial?.role === 'doctor' && (
            <div className="p-3 bg-muted/30 border border-border/40 rounded-lg">
              <p className="text-xs text-muted-foreground">
                ℹ️ Shifokor profili (mutaxassislik, xona, mavjudlik) bu yerda tahrirlanmaydi
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border/50 shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saqlanmoqda...' : mode === 'create' ? 'Yaratish' : 'Saqlash'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Toggle Active Confirm Modal ──────────────────────────────────────────────

function ToggleActiveModal({
  open,
  user,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean
  user: User | null
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  if (!open || !user) return null
  const willActivate = !user.is_active
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${willActivate ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
            <svg className={`w-5 h-5 ${willActivate ? 'text-green-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {willActivate ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>
          <h2 className="text-base font-bold text-foreground">
            {willActivate ? 'Faollashtirish' : 'Nofaollashtirish'}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          <span className="font-medium text-foreground">"{fullName(user)}"</span> ni{' '}
          {willActivate ? 'faollashtirmoqchimisiz?' : 'nofaollashtirmoqchimisiz?'}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            Bekor qilish
          </Button>
          <Button
            className={`flex-1 text-white ${willActivate ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Saqlanmoqda...' : willActivate ? 'Faollashtirish' : 'Nofaollashtirish'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [toggleTarget, setToggleTarget] = useState<User | null>(null)
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')

  // API
  const { data, isLoading, refetch } = useGetUsersQuery({})
  const [createUser, { isLoading: creating }] = useCreateUserMutation()
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation()
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation()

  const users: User[] = data?.data ?? []

  // Admin only guard
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V9m0 0V7m0 2h2m-2 0H10m9.293 9.293a8 8 0 11-11.314-11.314 8 8 0 0111.314 11.314z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Kirish taqiqlangan</h3>
        <p className="text-muted-foreground text-sm">Bu sahifa faqat administratorlar uchun</p>
      </div>
    )
  }

  // Filter
  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase()
    const name = `${u.first_name} ${u.last_name}`.toLowerCase()
    const matchSearch =
      name.includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.specialization ?? '').toLowerCase().includes(q)
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  // Create
  const handleCreate = async (data: UserFormData) => {
    const payload: any = {
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim() || null,
      role: data.role,
      password: data.password,
      doctor_profile:
        data.role === 'doctor'
          ? {
              specialization: data.specialization.trim(),
              room_number: data.room_number.trim() || null,
              availability: data.availability,
              department_id: null,
            }
          : null,
    }
    try {
      await createUser(payload).unwrap()
      setCreateOpen(false)
      refetch()
    } catch (err) {
      console.error('Create error:', err)
    }
  }

  // Edit — doctor_profile yuborilmaydi
  const handleEdit = async (data: UserFormData) => {
    if (!editTarget) return
    const payload: any = {
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim() || null,
    }
    if (data.password) payload.password = data.password
    try {
      await updateUser({ id: editTarget.id, ...payload }).unwrap()
      setEditTarget(null)
      refetch()
    } catch (err) {
      console.error('Update error:', err)
    }
  }

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteUser(deleteTarget.id).unwrap()
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  // Toggle is_active — confirm bilan
  const handleToggleActive = async () => {
    if (!toggleTarget) return
    try {
      await updateUser({ id: toggleTarget.id, is_active: !toggleTarget.is_active }).unwrap()
      setToggleTarget(null)
      refetch()
    } catch (err) {
      console.error('Toggle error:', err)
    }
  }

  // Stats
  const totalCount = users.length
  const doctorCount = users.filter((u) => u.role === 'doctor').length
  const staffCount = users.filter((u) => u.role === 'staff').length
  const activeCount = users.filter((u) => u.is_active).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Foydalanuvchilar</h1>
          <p className="text-muted-foreground mt-1">Tizim foydalanuvchilari va ruxsatlarini boshqarish</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
          + Foydalanuvchi qo'shish
        </Button>
      </div>

      {/* Search + Role filter */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Ism, email, rol yoki mutaxassislik bo'yicha..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-muted/50 border-border/50 flex-1 min-w-52"
        />
        <div className="flex gap-2 flex-wrap">
          {(['all', ...ROLES] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                roleFilter === r
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/50 text-muted-foreground hover:border-border bg-muted/20'
              }`}
            >
              {r === 'all' ? 'Barchasi' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Yuklanmoqda...
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 border-b border-border/50">
                  {["Foydalanuvchi", "Email", "Rol", "Holat", "Shifokor ma'lumoti", "Amallar"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-sm font-semibold text-foreground whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border/30 hover:bg-muted/15 transition-colors last:border-0"
                  >
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          u.role === 'admin' ? 'bg-purple-500/20' : u.role === 'doctor' ? 'bg-blue-500/20' : 'bg-green-500/20'
                        }`}>
                          <span className={`text-xs font-bold ${
                            u.role === 'admin' ? 'text-purple-600 dark:text-purple-400' : u.role === 'doctor' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                          }`}>
                            {initials(u)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{fullName(u)}</p>
                          {u.phone && <p className="text-xs text-muted-foreground">{u.phone}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-foreground">{u.email}</span>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <Badge className={getRoleColor(u.role)}>{u.role}</Badge>
                    </td>

                    {/* Active — confirm modal orqali */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setToggleTarget(u)}
                        title="Holatni o'zgartirish"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:opacity-70 ${
                          u.is_active
                            ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
                            : 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-400/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {u.is_active ? 'Faol' : 'Nofaol'}
                      </button>
                    </td>

                    {/* Doctor info */}
                    <td className="px-5 py-4">
                      {u.role === 'doctor' && u.specialization ? (
                        <div className="space-y-1">
                          <p className="text-sm text-foreground">{u.specialization}</p>
                          <div className="flex items-center gap-2">
                            {u.availability && (
                              <Badge className={`text-xs ${getAvailabilityColor(u.availability)}`}>
                                {u.availability}
                              </Badge>
                            )}
                            {u.room_number && (
                              <span className="text-xs text-muted-foreground">#{u.room_number}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/40">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/80 text-xs h-8"
                          onClick={() => setEditTarget(u)}
                        >
                          Tahrirlash
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 text-xs h-8"
                          onClick={() => setDeleteTarget(u)}
                        >
                          O'chirish
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

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-14 border border-dashed border-border/50 rounded-xl">
          <svg className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
          <h3 className="text-base font-semibold text-foreground mb-1">Foydalanuvchi topilmadi</h3>
          <p className="text-sm text-muted-foreground">Qidiruv yoki filterni o'zgartiring</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Jami', value: totalCount, color: 'text-foreground' },
          { label: 'Shifokorlar', value: doctorCount, color: 'text-blue-500' },
          { label: 'Xodimlar', value: staffCount, color: 'text-green-500' },
          { label: 'Faollar', value: activeCount, color: 'text-primary' },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <UserModal
        open={createOpen}
        mode="create"
        onSubmit={handleCreate}
        onClose={() => setCreateOpen(false)}
        loading={creating}
      />

      {/* Edit Modal */}
      <UserModal
        open={!!editTarget}
        mode="edit"
        initial={editTarget ?? undefined}
        onSubmit={handleEdit}
        onClose={() => setEditTarget(null)}
        loading={updating}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        userName={deleteTarget ? fullName(deleteTarget) : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Toggle Active Confirm */}
      <ToggleActiveModal
        open={!!toggleTarget}
        user={toggleTarget}
        onConfirm={handleToggleActive}
        onCancel={() => setToggleTarget(null)}
        loading={updating}
      />
    </div>
  )
}