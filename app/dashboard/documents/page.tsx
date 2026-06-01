'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useRef, useEffect } from 'react'
import { useGetPatientsQuery } from '@/redux/api/patientsApi'
import {
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentsQuery,
} from '@/redux/api/documentsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocFile {
  path: string
  size: number
  file_name: string
  mime_type: string
  original_name: string
}

interface Document {
  id: string
  patient_id: string
  patient_name: string
  upload_by: string
  uploaded_by_name: string
  files: DocFile[]
  description: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ''
console.log('API Base URL:', BASE_URL)
function isImage(mime: string) {
  return mime.startsWith('image/')
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mime: string) {
  if (mime.startsWith('image/')) return '🖼️'
  if (mime === 'application/pdf') return '📄'
  if (mime.includes('word') || mime.includes('document')) return '📝'
  if (mime.includes('sheet') || mime.includes('excel')) return '📊'
  return '📁'
}

// ─── Image Preview Modal ───────────────────────────────────────────────────────

function ImagePreviewModal({
  src,
  name,
  onClose,
}: {
  src: string
  name: string
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Yopish
        </button>
        <img
          src={src}
          alt={name}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />
        <p className="text-center text-white/60 text-xs mt-2 truncate">{name}</p>
      </div>
    </div>
  )
}

// ─── Confirm Delete Modal ──────────────────────────────────────────────────────

function ConfirmModal({
  open,
  description,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean
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
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-foreground">Hujjatni o'chirish</h2>
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
            {loading ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Upload Modal ──────────────────────────────────────────────────────────────

function UploadModal({
  open,
  patients,
  onSubmit,
  onClose,
  loading,
}: {
  open: boolean
  patients: { id: string; name: string }[]
  onSubmit: (formData: FormData) => void
  onClose: () => void
  loading?: boolean
}) {
  const [patientId, setPatientId] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<{ patient_id?: string; files?: string }>({})
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setPatientId('')
      setDescription('')
      setFiles([])
      setErrors({})
    }
  }, [open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files))
  }

  const handleSubmit = () => {
    const errs: typeof errors = {}
    if (!patientId) errs.patient_id = 'Bemor tanlanmagan'
    if (files.length === 0) errs.files = 'Kamida bitta fayl kerak'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const fd = new FormData()
    fd.append('patient_id', patientId)
    if (description.trim()) fd.append('description', description.trim())
    files.forEach((f) => fd.append('files', f))
    onSubmit(fd)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-lg font-bold text-foreground">Hujjat yuklash</h2>
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
        <div className="p-6 space-y-4">
          {/* Patient */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Bemor <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            >
              <option value="">Bemorni tanlang</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.patient_id && <p className="text-xs text-red-500 mt-1">{errors.patient_id}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tavsif</label>
            <Input
              placeholder="Ixtiyoriy tavsif..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-muted/30 border-border/50"
            />
          </div>

          {/* Files */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Fayllar <span className="text-red-500">*</span>
            </label>
            <div
              className="border-2 border-dashed border-border/60 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-all"
              onClick={() => fileRef.current?.click()}
            >
              <svg className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {files.length > 0 ? (
                <p className="text-sm text-foreground font-medium">{files.length} ta fayl tanlandi</p>
              ) : (
                <p className="text-sm text-muted-foreground">Fayl tanlash uchun bosing</p>
              )}
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg">
                    <span>{getFileIcon(f.type)}</span>
                    <span className="flex-1 truncate">{f.name}</span>
                    <span>{formatSize(f.size)}</span>
                  </li>
                ))}
              </ul>
            )}
            {errors.files && <p className="text-xs text-red-500 mt-1">{errors.files}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Yuklanmoqda...' : 'Yuklash'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── File Row ──────────────────────────────────────────────────────────────────

function FileRow({
  file,
  onPreview,
}: {
  file: DocFile
  onPreview: (src: string, name: string) => void
}) {
  const src = `${BASE_URL}/${file.path}`
  const img = isImage(file.mime_type)

  const handleDownload = async () => {
    const res = await fetch(src)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.original_name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-3 bg-muted/20 rounded-lg px-3 py-2 group">
      {img ? (
        <img
          src={src}
          alt={file.original_name}
          className="w-10 h-10 object-cover rounded-md border border-border/50 shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-md border border-border/50 bg-muted/50 flex items-center justify-center text-lg shrink-0">
          {getFileIcon(file.mime_type)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{file.original_name}</p>
        <p className="text-xs text-muted-foreground">{formatSize(file.size)} • {file.mime_type}</p>
      </div>
      {img ? (
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
          onClick={() => onPreview(src, file.original_name)}
        >
          Ko'rish
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
          onClick={handleDownload}
        >
          Yuklash
        </Button>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'doctor'

  const [searchQuery, setSearchQuery] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null)
  const [preview, setPreview] = useState<{ src: string; name: string } | null>(null)

  // API
  const { data: documentsData, isLoading, refetch } = useGetDocumentsQuery(undefined)
  const { data: patientsData } = useGetPatientsQuery(undefined)
  const [createDocument, { isLoading: creating }] = useCreateDocumentMutation()
  const [deleteDocument, { isLoading: deleting }] = useDeleteDocumentMutation()

  const documents: Document[] = documentsData?.data ?? []
  const patients: { id: string; name: string }[] = (patientsData?.data ?? []).map(
    (p: any) => ({ id: String(p.id), name: p.first_name ?? p.full_name ?? p.patient_name })
  )

  const filtered = documents.filter((doc) => {
    const q = searchQuery.toLowerCase()
    return (
      doc.patient_name?.toLowerCase().includes(q) ||
      doc.uploaded_by_name?.toLowerCase().includes(q) ||
      doc.description?.toLowerCase().includes(q) ||
      doc.files?.some(
        (f) =>
          f.original_name.toLowerCase().includes(q) ||
          f.mime_type.toLowerCase().includes(q)
      )
    )
  })

  const handleUpload = async (fd: FormData) => {
    // upload_by server tomonida token orqali olinadi, lekin agar kerak bo'lsa:
    // fd.append('upload_by', String(user?.id))
    try {
      await createDocument(fd).unwrap()
      setUploadOpen(false)
      refetch()
    } catch (err) {
      console.error('Upload error:', err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteDocument(deleteTarget.id).unwrap()
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  // Stats
  const totalFiles = documents.reduce((acc, d) => acc + (d.files?.length ?? 0), 0)
  const imageFiles = documents.reduce(
    (acc, d) => acc + (d.files?.filter((f) => isImage(f.mime_type)).length ?? 0),
    0
  )
  const uniquePatients = new Set(documents.map((d) => d.patient_id)).size

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hujjatlar</h1>
          <p className="text-muted-foreground mt-1">Tibbiy hujjatlar va fayllarni boshqarish</p>
        </div>
        {canEdit && (
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setUploadOpen(true)}>
            + Hujjat yuklash
          </Button>
        )}
      </div>

      {/* Search */}
      <Input
        placeholder="Bemor, shifokor, fayl nomi yoki tavsif bo'yicha qidiring..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-muted/50 border-border/50 max-w-xl"
      />

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Yuklanmoqda...
        </div>
      )}

      {/* Documents list */}
      {!isLoading && (
        <div className="space-y-4">
          {filtered.map((doc) => (
            <Card key={doc.id} className="border-border/50 hover:border-border transition-colors">
              <CardContent className="p-5 space-y-4">
                {/* Doc header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{doc.patient_name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {doc.files?.length ?? 0} fayl
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Yuklagan: <span className="text-foreground">{doc.uploaded_by_name}</span>
                    </p>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground mt-1 bg-muted/30 px-3 py-1.5 rounded-lg">
                        {doc.description}
                      </p>
                    )}
                  </div>

                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                      onClick={() => setDeleteTarget(doc)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  )}
                </div>

                {/* Files */}
                {doc.files && doc.files.length > 0 && (
                  <div className="space-y-2">
                    {doc.files.map((file, idx) => (
                      <FileRow
                        key={idx}
                        file={file}
                        onPreview={(src, name) => setPreview({ src, name })}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-14 border border-dashed border-border/50 rounded-xl">
          <svg className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-base font-semibold text-foreground mb-1">Hujjat topilmadi</h3>
          <p className="text-sm text-muted-foreground">Qidiruv so'rovini o'zgartiring</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Jami hujjatlar', value: documents.length, color: 'text-foreground' },
          { label: 'Jami fayllar', value: totalFiles, color: 'text-blue-500' },
          { label: 'Rasmlar', value: imageFiles, color: 'text-purple-500' },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      <UploadModal
        open={uploadOpen}
        patients={patients}
        onSubmit={handleUpload}
        onClose={() => setUploadOpen(false)}
        loading={creating}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        description={`"${deleteTarget?.patient_name}" bemorining hujjatini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Image Preview */}
      {preview && (
        <ImagePreviewModal
          src={preview.src}
          name={preview.name}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}