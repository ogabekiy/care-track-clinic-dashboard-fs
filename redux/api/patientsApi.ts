import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'

export const patientsApi =
  createApi({
    reducerPath:
      'patientsApi',

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
    tagTypes: ['Patients'],

    endpoints: (
      builder
    ) => ({
      // CREATE
      createPatient:
        builder.mutation({
          query: (
            credentials
          ) => ({
            url:
              '/patients/create',
            method:
              'POST',
            body:
              credentials,
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Patients',
            ],
        }),

      // GET ALL
      getPatients:
        builder.query({
          query: () =>
            '/patients/all',

          // CACHE TAG
          providesTags: [
            'Patients',
          ],
        }),
      
      // GET ONE
      getPatientById:
        builder.query({
          query: (
            id
          ) =>
            `/patients/${id}`,
        }),

      // UPDATE
      updatePatient:
        builder.mutation({
          query: ({
            id,
            ...credentials
          }) => ({
            url: `/patients/update/${id}`,
            method:
              'PATCH',
            body:
              credentials,
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Patients',
            ],
        }),

      // DELETE
      deletePatient:
        builder.mutation({
          query: (id) => ({
            url: `/patients/delete/${id}`,
            method:
              'DELETE',
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Patients',
            ],
        }),
    }),
  })

export const {
  useCreatePatientMutation,
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = patientsApi