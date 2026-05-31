'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getAllDoctors, getAllDiagnoses, getAllDocuments } from '@/lib/mock-data'
import { Heart, FileText, Stethoscope, Calendar, Phone, Mail, MapPin } from 'lucide-react'

interface Patient {
  id: string
  name: string
  medicalId: string
  dateOfBirth: string
  gender: string
  bloodType: string
  phone: string
  email: string
  address: string
  department: string
  admissionDate: string
  status: 'active' | 'admitted' | 'discharged' | 'stable' | 'critical' | 'recovering'
  primaryDoctor: string
  allergies: string[]
  insurance: string
}

interface PatientDetailsDialogProps {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientDetailsDialog({ patient, open, onOpenChange }: PatientDetailsDialogProps) {
  if (!patient) return null

  const doctors = getAllDoctors()
  const diagnoses = getAllDiagnoses()
  const documents = getAllDocuments()

  const primaryDoctor = doctors.find(doc => doc.id === patient.primaryDoctor)
  const patientDiagnoses = diagnoses.filter(diag => diag.patientId === patient.id)
  const patientDocuments = documents.filter(doc => doc.patientId === patient.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
      case 'active':
        return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
      case 'critical':
        return 'bg-red-500/20 text-red-700 dark:text-red-400'
      case 'recovering':
      case 'admitted':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
      case 'discharged':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-700 dark:text-red-400'
      case 'high':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
      case 'low':
        return 'bg-green-500/20 text-green-700 dark:text-green-400'
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Patient Details</DialogTitle>
          <DialogDescription>
            Complete information for {patient.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Patient Overview */}
            <Card className="border-0 bg-muted/40">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{patient.name}</CardTitle>
                    <CardDescription className="text-sm">{patient.medicalId}</CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(patient.status)} border-0 capitalize`}>
                    {patient.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{patient.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Type</p>
                    <p className="font-medium">{patient.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{patient.department}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admission & Insurance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="size-4" /> Admission Date
                    </p>
                    <p className="font-medium mt-1">{patient.admissionDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Insurance</p>
                    <p className="font-medium">{patient.insurance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Allergies */}
            {patient.allergies && patient.allergies.length > 0 && (
              <Card className="border-red-500/20 bg-red-500/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="size-4 text-red-500" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="outline" className="border-red-500/30 text-red-700 dark:text-red-400">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Primary Doctor */}
            {primaryDoctor && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Stethoscope className="size-4" />
                    Primary Doctor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-lg font-semibold">{primaryDoctor.name}</p>
                    <p className="text-sm text-muted-foreground">{primaryDoctor.specialty}</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Experience</span>
                        <span className="font-medium">{primaryDoctor.experience} years</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{primaryDoctor.phone}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rating</span>
                        <Badge variant="outline">{primaryDoctor.rating} ⭐</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Diagnoses */}
            {patientDiagnoses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medical Diagnoses</CardTitle>
                  <CardDescription>
                    {patientDiagnoses.length} diagnosis record{patientDiagnoses.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patientDiagnoses.map((diagnosis, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 border-muted-foreground/20 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{diagnosis.condition}</p>
                          <p className="text-sm text-muted-foreground">{diagnosis.icdCode}</p>
                        </div>
                        <Badge className={`${getSeverityColor(diagnosis.severity)} border-0`}>
                          {diagnosis.severity}
                        </Badge>
                      </div>
                      <p className="text-sm">{diagnosis.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                        <span>Diagnosed: {diagnosis.diagnosisDate}</span>
                        <Badge variant="outline" className="capitalize">
                          {diagnosis.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Medical Documents */}
            {patientDocuments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="size-4" />
                    Medical Documents
                  </CardTitle>
                  <CardDescription>
                    {patientDocuments.length} document{patientDocuments.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patientDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 border-muted-foreground/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="size-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{doc.fileName}</p>
                          <p className="text-sm text-muted-foreground">{doc.documentType}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground flex-shrink-0">
                        <p>{doc.uploadDate}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Empty States */}
            {patientDiagnoses.length === 0 && (
              <Card className="bg-muted/30">
                <CardContent className="text-center py-6">
                  <p className="text-muted-foreground">No diagnoses recorded yet</p>
                </CardContent>
              </Card>
            )}

            {patientDocuments.length === 0 && (
              <Card className="bg-muted/30">
                <CardContent className="text-center py-6">
                  <p className="text-muted-foreground">No medical documents uploaded yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
