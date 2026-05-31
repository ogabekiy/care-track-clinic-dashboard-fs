export interface Doctor {
  id: string
  name: string
  specialization: string
  specialty: string
  email: string
  phone: string
  department: string
  availability: 'available' | 'busy' | 'offline'
  patients: number
  rating: number
  experience: number
  image?: string
}

export interface Patient {
  id: string
  name: string
  age: number
  email: string
  phone: string
  medicalId: string
  status: 'active' | 'discharged' | 'admitted'
  lastVisit: string
  primaryDoctor: string
  conditions: string[]
  dateOfBirth: string
  gender: string
  bloodType: string
  address: string
  department: string
  admissionDate: string
  allergies: string[]
  insurance: string
}

export interface Diagnosis {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  diagnosis: string
  condition: string
  icdCode: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  date: string
  notes: string
  status: 'pending' | 'confirmed' | 'resolved'
  diagnosisDate: string
}

export interface Department {
  id: string
  name: string
  head: string
  doctors: number
  beds: number
  bedsOccupied: number
  specializations: string[]
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'doctor' | 'staff' | 'manager'
  department: string
  lastLogin: string
  status: 'active' | 'inactive'
}

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  changes: string
  ipAddress: string
  status: 'success' | 'failure'
}

export interface Document {
  id: string
  name: string
  type: string
  patientId: string
  patientName: string
  uploadedBy: string
  uploadedAt: string
  size: string
  tags: string[]
  fileName: string
  documentType: string
  uploadDate: string
}

// Mock Doctors
export const mockDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Michael Chen',
    specialization: 'Cardiology',
    specialty: 'Cardiology',
    email: 'michael.chen@hospital.com',
    phone: '+1-555-0101',
    department: 'Cardiology',
    availability: 'available',
    patients: 28,
    rating: 4.8,
    experience: 15,
  },
  {
    id: 'doc-2',
    name: 'Dr. Sarah Williams',
    specialization: 'Neurology',
    specialty: 'Neurology',
    email: 'sarah.williams@hospital.com',
    phone: '+1-555-0102',
    department: 'Neurology',
    availability: 'busy',
    patients: 32,
    rating: 4.6,
    experience: 12,
  },
  {
    id: 'doc-3',
    name: 'Dr. James Rodriguez',
    specialization: 'Orthopedics',
    specialty: 'Orthopedics',
    email: 'james.rodriguez@hospital.com',
    phone: '+1-555-0103',
    department: 'Orthopedics',
    availability: 'available',
    patients: 24,
    rating: 4.9,
    experience: 18,
  },
  {
    id: 'doc-4',
    name: 'Dr. Lisa Anderson',
    specialization: 'Pediatrics',
    specialty: 'Pediatrics',
    email: 'lisa.anderson@hospital.com',
    phone: '+1-555-0104',
    department: 'Pediatrics',
    availability: 'available',
    patients: 35,
    rating: 4.7,
    experience: 10,
  },
  {
    id: 'doc-5',
    name: 'Dr. Robert Martinez',
    specialization: 'Oncology',
    specialty: 'Oncology',
    email: 'robert.martinez@hospital.com',
    phone: '+1-555-0105',
    department: 'Oncology',
    availability: 'offline',
    patients: 18,
    rating: 4.5,
    experience: 20,
  },
]

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: 'pat-1',
    name: 'John Thompson',
    age: 45,
    email: 'john.thompson@email.com',
    phone: '+1-555-0201',
    medicalId: 'MH001245',
    status: 'admitted',
    lastVisit: '2024-05-15',
    primaryDoctor: 'doc-1',
    conditions: ['Hypertension', 'Diabetes Type 2'],
    dateOfBirth: '1979-03-15',
    gender: 'Male',
    bloodType: 'A+',
    address: '123 Main Street, Springfield, IL 62701',
    department: 'Cardiology',
    admissionDate: '2024-05-10',
    allergies: ['Penicillin', 'Sulfa drugs'],
    insurance: 'Blue Cross Blue Shield',
  },
  {
    id: 'pat-2',
    name: 'Emma Davis',
    age: 32,
    email: 'emma.davis@email.com',
    phone: '+1-555-0202',
    medicalId: 'MH001246',
    status: 'active',
    lastVisit: '2024-05-18',
    primaryDoctor: 'doc-2',
    conditions: ['Migraine'],
    dateOfBirth: '1992-07-22',
    gender: 'Female',
    bloodType: 'B-',
    address: '456 Oak Avenue, Chicago, IL 60601',
    department: 'Neurology',
    admissionDate: '2024-05-16',
    allergies: ['Aspirin'],
    insurance: 'Aetna',
  },
  {
    id: 'pat-3',
    name: 'Michael Johnson',
    age: 67,
    email: 'michael.johnson@email.com',
    phone: '+1-555-0203',
    medicalId: 'MH001247',
    status: 'admitted',
    lastVisit: '2024-05-19',
    primaryDoctor: 'doc-3',
    conditions: ['Arthritis', 'High Cholesterol'],
    dateOfBirth: '1957-01-10',
    gender: 'Male',
    bloodType: 'O+',
    address: '789 Pine Road, Denver, CO 80202',
    department: 'Orthopedics',
    admissionDate: '2024-05-12',
    allergies: ['NSAIDs'],
    insurance: 'Medicare',
  },
  {
    id: 'pat-4',
    name: 'Jessica Lee',
    age: 28,
    email: 'jessica.lee@email.com',
    phone: '+1-555-0204',
    medicalId: 'MH001248',
    status: 'discharged',
    lastVisit: '2024-04-20',
    primaryDoctor: 'doc-4',
    conditions: ['Cold (Resolved)'],
    dateOfBirth: '1996-11-05',
    gender: 'Female',
    bloodType: 'AB+',
    address: '321 Elm Street, Austin, TX 78701',
    department: 'Pediatrics',
    admissionDate: '2024-04-15',
    allergies: [],
    insurance: 'United Healthcare',
  },
  {
    id: 'pat-5',
    name: 'David Brown',
    age: 55,
    email: 'david.brown@email.com',
    phone: '+1-555-0205',
    medicalId: 'MH001249',
    status: 'active',
    lastVisit: '2024-05-17',
    primaryDoctor: 'doc-5',
    conditions: ['Follow-up Care'],
    dateOfBirth: '1969-09-28',
    gender: 'Male',
    bloodType: 'A-',
    address: '654 Maple Drive, Boston, MA 02101',
    department: 'Oncology',
    admissionDate: '2024-05-08',
    allergies: ['Latex'],
    insurance: 'Cigna',
  },
]

// Mock Diagnoses
export const mockDiagnoses: Diagnosis[] = [
  {
    id: 'diag-1',
    patientId: 'pat-1',
    patientName: 'John Thompson',
    doctorName: 'Dr. Michael Chen',
    diagnosis: 'Acute Hypertensive Crisis',
    condition: 'Acute Hypertensive Crisis',
    icdCode: 'I16.0',
    description: 'Blood pressure elevated to 180/110. Started medication adjustment. Patient requires close monitoring.',
    severity: 'high',
    date: '2024-05-19',
    notes: 'Blood pressure elevated to 180/110. Started medication adjustment.',
    status: 'confirmed',
    diagnosisDate: '2024-05-19',
  },
  {
    id: 'diag-2',
    patientId: 'pat-2',
    patientName: 'Emma Davis',
    doctorName: 'Dr. Sarah Williams',
    diagnosis: 'Tension Headache Disorder',
    condition: 'Tension Headache Disorder',
    icdCode: 'G44.2',
    description: 'Recurring migraines. Prescribed preventive therapy. May benefit from lifestyle modifications.',
    severity: 'medium',
    date: '2024-05-18',
    notes: 'Recurring migraines. Prescribed preventive therapy.',
    status: 'confirmed',
    diagnosisDate: '2024-05-18',
  },
  {
    id: 'diag-3',
    patientId: 'pat-3',
    patientName: 'Michael Johnson',
    doctorName: 'Dr. James Rodriguez',
    diagnosis: 'Osteoarthritis (Knee)',
    condition: 'Osteoarthritis (Knee)',
    icdCode: 'M17.11',
    description: 'Degenerative joint disease. Physical therapy recommended. Consider joint replacement if symptoms worsen.',
    severity: 'medium',
    date: '2024-05-17',
    notes: 'Degenerative joint disease. Physical therapy recommended.',
    status: 'confirmed',
    diagnosisDate: '2024-05-17',
  },
  {
    id: 'diag-4',
    patientId: 'pat-5',
    patientName: 'David Brown',
    doctorName: 'Dr. Robert Martinez',
    diagnosis: 'Pending Oncology Review',
    condition: 'Pending Oncology Review',
    icdCode: 'R97.9',
    description: 'Awaiting specialist consultation. Additional imaging studies recommended.',
    severity: 'high',
    date: '2024-05-16',
    notes: 'Awaiting specialist consultation.',
    status: 'pending',
    diagnosisDate: '2024-05-16',
  },
]

// Mock Departments
export const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Cardiology',
    head: 'Dr. Michael Chen',
    doctors: 12,
    beds: 30,
    bedsOccupied: 22,
    specializations: ['Heart Disease', 'Arrhythmia', 'Heart Surgery'],
  },
  {
    id: 'dept-2',
    name: 'Neurology',
    head: 'Dr. Sarah Williams',
    doctors: 8,
    beds: 25,
    bedsOccupied: 18,
    specializations: ['Brain Disorders', 'Stroke', 'Epilepsy'],
  },
  {
    id: 'dept-3',
    name: 'Orthopedics',
    head: 'Dr. James Rodriguez',
    doctors: 10,
    beds: 40,
    bedsOccupied: 28,
    specializations: ['Bone Surgery', 'Joint Replacement', 'Sports Medicine'],
  },
  {
    id: 'dept-4',
    name: 'Pediatrics',
    head: 'Dr. Lisa Anderson',
    doctors: 15,
    beds: 50,
    bedsOccupied: 35,
    specializations: ['Child Health', 'Immunization', 'Developmental Care'],
  },
  {
    id: 'dept-5',
    name: 'Oncology',
    head: 'Dr. Robert Martinez',
    doctors: 9,
    beds: 35,
    bedsOccupied: 30,
    specializations: ['Cancer Treatment', 'Chemotherapy', 'Radiation Therapy'],
  },
]

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@hospital.com',
    role: 'admin',
    department: 'Administration',
    lastLogin: '2024-05-19 10:30',
    status: 'active',
  },
  {
    id: 'user-2',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@hospital.com',
    role: 'doctor',
    department: 'Cardiology',
    lastLogin: '2024-05-19 08:15',
    status: 'active',
  },
  {
    id: 'user-3',
    name: 'Emma Wilson',
    email: 'emma.wilson@hospital.com',
    role: 'staff',
    department: 'Nursing',
    lastLogin: '2024-05-19 09:00',
    status: 'active',
  },
  {
    id: 'user-4',
    name: 'Dr. Sarah Williams',
    email: 'sarah.williams@hospital.com',
    role: 'doctor',
    department: 'Neurology',
    lastLogin: '2024-05-18 14:20',
    status: 'active',
  },
  {
    id: 'user-5',
    name: 'James Mitchell',
    email: 'james.mitchell@hospital.com',
    role: 'staff',
    department: 'Reception',
    lastLogin: '2024-05-19 07:45',
    status: 'active',
  },
]

// Mock Audit Logs
export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2024-05-19 10:45',
    user: 'Dr. Sarah Johnson',
    action: 'Created',
    resource: 'Patient Record',
    changes: 'New patient John Smith added',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: 'log-2',
    timestamp: '2024-05-19 10:30',
    user: 'Dr. Michael Chen',
    action: 'Updated',
    resource: 'Diagnosis',
    changes: 'Diagnosis for patient John Thompson updated',
    ipAddress: '192.168.1.101',
    status: 'success',
  },
  {
    id: 'log-3',
    timestamp: '2024-05-19 10:15',
    user: 'Emma Wilson',
    action: 'Viewed',
    resource: 'Patient Record',
    changes: 'Accessed patient medical history',
    ipAddress: '192.168.1.102',
    status: 'success',
  },
  {
    id: 'log-4',
    timestamp: '2024-05-19 10:00',
    user: 'Dr. Sarah Williams',
    action: 'Deleted',
    resource: 'Appointment',
    changes: 'Cancelled appointment scheduled for 2024-05-20',
    ipAddress: '192.168.1.103',
    status: 'success',
  },
  {
    id: 'log-5',
    timestamp: '2024-05-19 09:45',
    user: 'James Mitchell',
    action: 'Failed Login',
    resource: 'Authentication',
    changes: 'Failed login attempt',
    ipAddress: '192.168.1.104',
    status: 'failure',
  },
]

// Mock Documents
export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Chest X-Ray Report',
    type: 'Medical Imaging',
    patientId: 'pat-1',
    patientName: 'John Thompson',
    uploadedBy: 'Dr. Michael Chen',
    uploadedAt: '2024-05-19 09:30',
    size: '2.4 MB',
    tags: ['Imaging', 'Cardiology'],
    fileName: 'chest_xray_JT_05192024.pdf',
    documentType: 'Medical Imaging',
    uploadDate: '2024-05-19',
  },
  {
    id: 'doc-2',
    name: 'Blood Test Results',
    type: 'Lab Report',
    patientId: 'pat-1',
    patientName: 'John Thompson',
    uploadedBy: 'Lab Technician',
    uploadedAt: '2024-05-18 14:20',
    size: '0.8 MB',
    tags: ['Lab', 'Results'],
    fileName: 'blood_test_results_JT_05182024.pdf',
    documentType: 'Lab Report',
    uploadDate: '2024-05-18',
  },
  {
    id: 'doc-3',
    name: 'MRI Brain Scan',
    type: 'Medical Imaging',
    patientId: 'pat-2',
    patientName: 'Emma Davis',
    uploadedBy: 'Dr. Sarah Williams',
    uploadedAt: '2024-05-17 11:00',
    size: '15.2 MB',
    tags: ['Imaging', 'Neurology'],
    fileName: 'mri_brain_ED_05172024.dcm',
    documentType: 'Medical Imaging',
    uploadDate: '2024-05-17',
  },
  {
    id: 'doc-4',
    name: 'Discharge Summary',
    type: 'Medical Record',
    patientId: 'pat-4',
    patientName: 'Jessica Lee',
    uploadedBy: 'Dr. Lisa Anderson',
    uploadedAt: '2024-04-21 16:45',
    size: '0.5 MB',
    tags: ['Summary', 'Discharge'],
    fileName: 'discharge_summary_JL_04212024.pdf',
    documentType: 'Medical Record',
    uploadDate: '2024-04-21',
  },
]

// Helper functions to get all data
export function getAllDoctors(): Doctor[] {
  return mockDoctors
}

export function getAllPatients(): Patient[] {
  return mockPatients
}

export function getAllDiagnoses(): Diagnosis[] {
  return mockDiagnoses
}

export function getAllDocuments(): Document[] {
  return mockDocuments
}

export function getAllDepartments(): Department[] {
  return mockDepartments
}

export function getAllUsers(): User[] {
  return mockUsers
}

export function getAllAuditLogs(): AuditLog[] {
  return mockAuditLogs
}
