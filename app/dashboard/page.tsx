'use client'

import { useAuth } from '@/lib/auth-context'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockDoctors, mockPatients, mockDiagnoses, mockDepartments } from '@/lib/mock-data'

export default function DashboardPage() {
  const { user } = useAuth()

  const totalDoctors = mockDoctors.length
  const totalPatients = mockPatients.length
  const admittedPatients = mockPatients.filter((p) => p.status === 'admitted').length
  const activeDiagnoses = mockDiagnoses.filter((d) => d.status !== 'resolved').length

  const availableDoctors = mockDoctors.filter((d) => d.availability === 'available').length
  const availableBeds = mockDepartments.reduce(
    (acc, dept) => acc + (dept.beds - dept.bedsOccupied),
    0
  )

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
          change={`${admittedPatients} admitted`}
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
          label="Available Beds"
          value={availableBeds}
          change="Total beds: 180"
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
            <CardDescription>Latest patient admissions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPatients.slice(0, 5).map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-start justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {patient.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        ID: {patient.medicalId}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {patient.age} years
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={
                      patient.status === 'admitted'
                        ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                        : patient.status === 'active'
                        ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                        : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                    }
                  >
                    {patient.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Department Status</CardTitle>
            <CardDescription>Bed occupancy overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDepartments.slice(0, 4).map((dept) => {
                const occupancyRate = Math.round((dept.bedsOccupied / dept.beds) * 100)
                return (
                  <div key={dept.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {dept.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {occupancyRate}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyRate > 80
                            ? 'bg-destructive'
                            : occupancyRate > 60
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {[
              { time: '10:45 AM', event: 'New patient John Smith admitted to Cardiology' },
              { time: '10:30 AM', event: 'Dr. Michael Chen updated diagnosis for John Thompson' },
              { time: '10:15 AM', event: 'Emma Wilson viewed patient medical history' },
              { time: '10:00 AM', event: 'Dr. Sarah Williams cancelled appointment' },
              { time: '9:45 AM', event: 'System backup completed successfully' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 py-3 border-b border-border/30 last:border-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                  {item.time}
                </span>
                <span className="text-sm text-foreground">{item.event}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
