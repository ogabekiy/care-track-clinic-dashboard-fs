'use client'

import { useAuth } from '@/lib/auth-context'
import { mockDocuments } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function DocumentsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  // Check authorization
  const isAuthorized = user?.role === 'admin' || user?.role === 'doctor'

  if (!isAuthorized) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-destructive/40 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4v2m0 4v2M6.343 17.657l1.414-1.414m2.828 0l1.414 1.414m4.243-4.243l1.414 1.414m0-2.828l1.414-1.414m-8.486-2.828l1.414-1.414m2.828 0l1.414 1.414"
          />
        </svg>
        <h3 className="text-lg font-semibold text-foreground mb-1">Access Denied</h3>
        <p className="text-muted-foreground">
          You don&apos;t have permission to access this page. Contact an administrator.
        </p>
      </div>
    )
  }

  const filteredDocuments = mockDocuments.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Manage medical documents and records
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          Upload Document
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by document name, patient, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Document Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Uploaded By
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Size
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors last:border-0"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-4 h-4 text-muted-foreground"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                      </svg>
                      <p className="font-medium text-foreground">{doc.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary">{doc.type}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">{doc.patientName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">{doc.uploadedBy}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{doc.size}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm" className="text-primary">
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDocuments.length === 0 && (
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
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">No documents found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Documents</p>
              <p className="text-3xl font-bold text-foreground">{mockDocuments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Document Types</p>
              <p className="text-3xl font-bold text-foreground">
                {new Set(mockDocuments.map((d) => d.type)).size}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Imaging Documents</p>
              <p className="text-3xl font-bold text-foreground">
                {mockDocuments.filter((d) => d.type === 'Medical Imaging').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
