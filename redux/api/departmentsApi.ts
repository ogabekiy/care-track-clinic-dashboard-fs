import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'

export const departmentsApi =
  createApi({
    reducerPath:
      'departmentsApi',

    baseQuery:
      fetchBaseQuery({
        baseUrl:
          process.env
            .NEXT_PUBLIC_BASE_URL,

        prepareHeaders: (
          headers
        ) => {
          if (
            typeof window !==
            'undefined'
          ) {
            const token =
              localStorage.getItem(
                'accessToken'
              )

            if (token) {
              headers.set(
                'Authorization',
                `Bearer ${token}`
              )
            }
          }

          return headers
        },
      }),

    // MUHIM
    tagTypes: ['Departments'],

    endpoints: (
      builder
    ) => ({
      // CREATE
      createDepartment:
        builder.mutation({
          query: (
            credentials
          ) => ({
            url:
              '/departments/create',
            method:
              'POST',
            body:
              credentials,
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Departments',
            ],
        }),

      // GET ALL
      getDepartments:
        builder.query({
          query: () =>
            '/departments/all',

          // CACHE TAG
          providesTags: [
            'Departments',
          ],
        }),

      // GET ONE
      getDepartmentById:
        builder.query({
          query: (
            id
          ) =>
            `/departments/${id}`,
        }),

      // UPDATE
      updateDepartment:
        builder.mutation({
          query: ({
            id,
            ...credentials
          }) => ({
            url: `/departments/update/${id}`,
            method:
              'PATCH',
            body:
              credentials,
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Departments',
            ],
        }),

      // DELETE
      deleteDepartment:
        builder.mutation({
          query: (id) => ({
            url: `/departments/delete/${id}`,
            method:
              'DELETE',
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Departments',
            ],
        }),
    }),
  })

export const {
  useCreateDepartmentMutation,
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentsApi