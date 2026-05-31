'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { mockPatients, mockDoctors, mockDiagnoses, mockDocuments } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, User, Stethoscope, FileText, Heart, Calendar, Phone, Mail, MapPin, Shield } from 'lucide-react'

export default function PatientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  const [activeTab, setActiveTab] = useState('overview')

  // Find patient
  const patient = mockPatients.find(p => p.id === patientId)

  if (!patient) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">Patient not found</p>
        </div>
      </div>
    )
  }

  // Find related data
  const doctor = mockDoctors.find(d => d.id === patient.primaryDoctor)
  const diagnoses = mockDiagnoses.filter(d => d.patientId === patientId)
  const documents = mockDocuments.filter(d => d.patientId === patientId)

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
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Patients
      </Button>

      {/* Patient Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-primary/20">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{patient.name}</h1>
            <p className="text-muted-foreground mt-1">Medical ID: {patient.medicalId}</p>
          </div>
          <Badge className={getStatusColor(patient.status)}>
            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
          </Badge>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Age</p>
            <p className="text-lg font-semibold">{patient.age} years</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="text-lg font-semibold">{patient.gender}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Blood Type</p>
            <p className="text-lg font-semibold">{patient.bloodType}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="text-lg font-semibold">{patient.department}</p>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="doctor">Doctor</TabsTrigger>
          <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{patient.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Type</p>
                  <p className="font-medium">{patient.bloodType}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{patient.address}</p>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{patient.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admission Date</p>
                  <p className="font-medium">{patient.admissionDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Insurance</p>
                  <p className="font-medium">{patient.insurance}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Allergies */}
          {patient.allergies.length > 0 && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy) => (
                    <Badge key={allergy} variant="secondary">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Doctor Tab */}
        <TabsContent value="doctor">
          {doctor ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Stethoscope className="w-6 h-6" />
                  {doctor.name}
                </CardTitle>
                <CardDescription>{doctor.specialty}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{doctor.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{doctor.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{doctor.department}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium">{doctor.experience} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-lg">{doctor.rating}</p>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Availability</p>
                      <Badge variant={doctor.availability === 'available' ? 'default' : 'secondary'}>
                        {doctor.availability.charAt(0).toUpperCase() + doctor.availability.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">No doctor information available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Diagnoses Tab */}
        <TabsContent value="diagnoses" className="space-y-4">
          {diagnoses.length > 0 ? (
            diagnoses.map((diagnosis) => (
              <Card key={diagnosis.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {diagnosis.condition}
                      </CardTitle>
                      <CardDescription>
                        By {diagnosis.doctorName} on {diagnosis.diagnosisDate}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(diagnosis.severity)}>
                        {diagnosis.severity.charAt(0).toUpperCase() + diagnosis.severity.slice(1)}
                      </Badge>
                      <Badge variant="outline">
                        {diagnosis.status.charAt(0).toUpperCase() + diagnosis.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">ICD Code</p>
                    <p className="font-medium">{diagnosis.icdCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{diagnosis.description}</p>
                  </div>
                  {diagnosis.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm">{diagnosis.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">No diagnoses recorded</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{doc.fileName}</CardTitle>
                        <CardDescription>{doc.documentType}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Upload Date</p>
                      <p className="font-medium">{doc.uploadDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Uploaded By</p>
                      <p className="font-medium">{doc.uploadedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">File Size</p>
                      <p className="font-medium">{doc.size}</p>
                    </div>
                  </div>
                  {doc.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {doc.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">No documents uploaded</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
