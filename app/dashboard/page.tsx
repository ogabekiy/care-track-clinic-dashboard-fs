'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useGetDoctorsQuery } from '@/redux/api/doctorsApi'
import { useGetPatientsQuery } from '@/redux/api/patientsApi'
import { useGetDepartmentsQuery } from '@/redux/api/departmentsApi'
import { useGetAuditLogsQuery } from '@/redux/api/audit-logsApi'
import { useGetDiagnosesQuery } from '@/redux/api/diagnosisApi'

export default function DashboardPage() {
  const { user } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  // Hydration mismatch xatosini oldini olish
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // API so'rovlari va Loading holatlarini ushlash
  const { data: doctorsData, isLoading: isDoctorsLoading } = useGetDoctorsQuery({})
  const { data: patientsData, isLoading: isPatientsLoading } = useGetPatientsQuery({})
  const { data: diagnosesData, isLoading: isDiagnosesLoading } = useGetDiagnosesQuery({})
  const { data: departmentsData, isLoading: isDepsLoading } = useGetDepartmentsQuery({})
  const { data: auditLogsData, isLoading: isLogsLoading } = useGetAuditLogsQuery({})

  const isLoading = isDoctorsLoading || isPatientsLoading || isDiagnosesLoading || isDepsLoading || isLogsLoading
  // API javobini qat'iy Array qilib olish (.map va .filter xato bermasligi uchun)
  const getSafeArray = (data: unknown): any[] => {
    // Handle responses like { data: [...] } or raw arrays, otherwise return empty array
    if (Array.isArray((data as any)?.data)) return (data as any).data as any[]
    if (Array.isArray(data)) return data as any[]
    return []
  }

  const doctors = getSafeArray(doctorsData)
  const patients = getSafeArray(patientsData)
  const diagnoses = getSafeArray(diagnosesData)
  const departments = getSafeArray(departmentsData)
  const auditLogs = getSafeArray(auditLogsData)

  const totalDoctors = doctors.length
  const totalPatients = patients.length
  const availableDoctors = doctors.filter((d) => d?.availability === 'available').length
  const activeDiagnoses = diagnoses.filter((d) => d?.status !== 'resolved').length

  // Client-side render bo'lguncha hech narsa ko'rsatmaslik
  if (!isMounted) return null

  // Ma'lumotlar yuklanayotganda kutilish ekrani
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground animate-pulse">Ma'lumotlar yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === 'admin' && 'Hospital management overview'}
          {user?.role === 'doctor' && 'Your patient and diagnosis overview'}
          {user?.role === 'staff' && 'Support and patient assistance'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Total Doctors"
          value={totalDoctors}
          change={`${availableDoctors} available`}
          changeType="positive"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
        />
        <StatsCard
          label="Total Patients"
          value={totalPatients}
          change={`${patients.length} registered`}
          changeType="negative"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0H9m6 0H9m6 0H9m6 0H9" />
            </svg>
          }
        />
        <StatsCard
          label="Diagnoses"
          value={activeDiagnoses}
          change="Pending review"
          changeType="neutral"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          label="Departments"
          value={departments.length}
          change="Active departments"
          changeType="positive"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>Latest patient registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patients.slice(0, 5).map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-start justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {patient.first_name} {patient.last_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {patient.blood_type || 'N/A'}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {patient.gender || 'N/A'}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {patient.phone || 'No phone'}
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400">
                    {patient.address ? patient.address.split(',')[0] : 'No address'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Doctors */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Doctors</CardTitle>
            <CardDescription>Availability status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {doctors.slice(0, 5).map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {doctor.first_name} {doctor.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doctor.department_name ?? 'No department'} · {doctor.specialization}
                    </p>
                  </div>
                  <Badge
                    className={
                      doctor.availability === 'available'
                        ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                        : doctor.availability === 'busy'
                        ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                        : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                    }
                  >
                    {doctor.availability || 'Unknown'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diagnoses */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Recent Diagnoses</CardTitle>
            <CardDescription>Latest diagnosis records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diagnoses.slice(0, 5).map((diagnosis) => (
                <div
                  key={diagnosis.id}
                  className="flex items-start justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {diagnosis.description}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {diagnosis.patient_name}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        ICD: {diagnosis.icd_code}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        Dr. {diagnosis.doctor_name}
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={
                      diagnosis.severity === 'critical'
                        ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                        : diagnosis.severity === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                        : 'bg-green-500/20 text-green-700 dark:text-green-400'
                    }
                  >
                    {diagnosis.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Departments */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>All active departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{dept.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {dept.description ?? 'No description'}
                    </p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400">
                    id: {dept.id}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs — Admin only */}
      {user?.role === 'admin' && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>Recent system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {auditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex gap-4 py-3 border-b border-border/30 last:border-0"
                >
                  <span
                    className={`text-xs font-semibold whitespace-nowrap pt-1 w-14 ${
                      log.action === 'DELETE'
                        ? 'text-red-500'
                        : log.action === 'POST'
                        ? 'text-green-500'
                        : 'text-yellow-500'
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                  </span>
                  <span className="text-sm text-foreground">
                    {log.entity_type} #{log.entity_id}
                    {log.new_values?.response?.email
                      ? ` — ${log.new_values.response.email}`
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}