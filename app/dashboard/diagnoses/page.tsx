'use client'

import { useState } from 'react'
import { mockDiagnoses } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function DiagnosesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDiagnoses = mockDiagnoses.filter(
    (diagnosis) =>
      diagnosis.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diagnosis.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diagnosis.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-700 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
      case 'low':
        return 'bg-green-500/20 text-green-700 dark:text-green-400'
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
      case 'pending':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
      case 'resolved':
        return 'bg-green-500/20 text-green-700 dark:text-green-400'
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Diagnoses</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage patient diagnoses
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          New Diagnosis
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by patient name, diagnosis, or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {/* Diagnoses List */}
      <div className="space-y-4">
        {filteredDiagnoses.map((diagnosis) => (
          <Card
            key={diagnosis.id}
            className="border-border/50 hover:border-border transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{diagnosis.diagnosis}</CardTitle>
                  <CardDescription className="mt-2">
                    Patient: {diagnosis.patientName} • Doctor: {diagnosis.doctorName}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getSeverityColor(diagnosis.severity)}>
                    {diagnosis.severity}
                  </Badge>
                  <Badge className={getStatusColor(diagnosis.status)}>
                    {diagnosis.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {new Date(diagnosis.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Patient ID</p>
                  <p className="font-medium text-foreground font-mono">{diagnosis.patientId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Assigned Doctor</p>
                  <p className="font-medium text-foreground">{diagnosis.doctorName}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">
                  {diagnosis.notes}
                </p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border/30">
                <Button variant="outline" size="sm" className="flex-1">
                  View Patient
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit Diagnosis
                </Button>
                {diagnosis.status === 'pending' && (
                  <Button variant="default" size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                    Confirm
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDiagnoses.length === 0 && (
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
          <h3 className="text-lg font-semibold text-foreground mb-1">No diagnoses found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-3xl font-bold text-foreground">{mockDiagnoses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">High Severity</p>
              <p className="text-3xl font-bold text-red-500">
                {mockDiagnoses.filter((d) => d.severity === 'high').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-orange-500">
                {mockDiagnoses.filter((d) => d.status === 'pending').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-3xl font-bold text-green-500">
                {mockDiagnoses.filter((d) => d.status === 'resolved').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
