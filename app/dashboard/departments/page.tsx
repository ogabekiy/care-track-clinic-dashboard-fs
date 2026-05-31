'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from '@/redux/api/departmentsApi'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type Department = {
  id: string
  name: string
  description: string
}

export default function DepartmentsPage() {
  const { user } = useAuth()

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] =
    useState('')

  // GET
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetDepartmentsQuery(undefined)

  const departments =
    data?.data || []

  // CREATE
  const [createDepartment, { isLoading: creating }] =
    useCreateDepartmentMutation()

  // UPDATE
  const [updateDepartment, { isLoading: updating }] =
    useUpdateDepartmentMutation()

  // DELETE
  const [deleteDepartment, { isLoading: deleting }] =
    useDeleteDepartmentMutation()

  // OPEN CREATE MODAL
  const handleOpenCreate = () => {
    setSelectedDepartment(null)
    setName('')
    setDescription('')
    setModalOpen(true)
  }

  // OPEN EDIT MODAL
  const handleOpenEdit = (
    department: Department
  ) => {
    setSelectedDepartment(department)

    setName(department.name)
    setDescription(
      department.description || ''
    )

    setModalOpen(true)
  }

  // SUBMIT
  const handleSubmit = async () => {
    if (!name.trim()) return

    try {
      const payload = {
        name,
        description,
      }

      if (selectedDepartment) {
        await updateDepartment({
          id: selectedDepartment.id,
          ...payload,
        }).unwrap()
      } else {
        await createDepartment(
          payload
        ).unwrap()
      }

      setModalOpen(false)
      setSelectedDepartment(null)

      setName('')
      setDescription('')
    } catch (error) {
      console.error(error)
    }
  }

  // DELETE
  const handleDelete = async () => {
    if (!selectedDepartment)
      return

    try {
      await deleteDepartment(
        selectedDepartment.id
      ).unwrap()

      setDeleteModalOpen(false)
      setSelectedDepartment(null)
    } catch (error) {
      console.error(error)
    }
  }

  // AUTH
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">
          Access Denied
        </h3>

        <p className="text-muted-foreground">
          Only administrators can access
          this page.
        </p>
      </div>
    )
  }

  // LOADING
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        Loading departments...
      </div>
    )
  }

  // ERROR
  if (isError) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">
          Failed to load departments
        </p>

        <Button
          className="mt-4"
          onClick={refetch}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Departments
          </h1>

          <p className="text-muted-foreground mt-1">
            Manage hospital departments
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
        >
          Add Department
        </Button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map(
          (dept: Department) => (
            <Card key={dept.id}>
              <CardHeader>
                <CardTitle>
                  {dept.name}
                </CardTitle>

                <CardDescription>
                  {dept.description ||
                    'No description'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      handleOpenEdit(
                        dept
                      )
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setSelectedDepartment(
                        dept
                      )

                      setDeleteModalOpen(
                        true
                      )
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* SUMMARY */}
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Total Departments
          </p>

          <p className="text-3xl font-bold">
            {departments.length}
          </p>
        </CardContent>
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Dialog
        open={modalOpen}
        onOpenChange={setModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDepartment
                ? 'Edit Department'
                : 'Create Department'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Department name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />

            <Button
              className="w-full"
              disabled={
                creating || updating
              }
              onClick={handleSubmit}
            >
              {creating ||
              updating
                ? 'Saving...'
                : selectedDepartment
                ? 'Update Department'
                : 'Create Department'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE MODAL */}
      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={
          setDeleteModalOpen
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Department?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be
              undone. Department will
              be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={deleting}
              onClick={
                handleDelete
              }
            >
              {deleting
                ? 'Deleting...'
                : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}