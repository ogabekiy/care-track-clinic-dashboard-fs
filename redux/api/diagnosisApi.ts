import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'

export const diagnosisApi =
  createApi({
    reducerPath:
      'diagnosisApi',

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
    tagTypes: ['Diagnoses'],

    endpoints: (
      builder
    ) => ({
      // CREATE
      createDiagnosis:
        builder.mutation({
          query: (
            credentials
          ) => ({
            url:
              '/diagnoses/create',
            method:
              'POST',
            body:
              credentials,
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Diagnoses',
            ],
        }),

      // GET ALL
      getDiagnoses:
        builder.query({
          query: () =>
            '/diagnoses/all',

          // CACHE TAG
          providesTags: [
            'Diagnoses',
          ],
        }),
      
      // GET ONE
      getDiagnosisById:
        builder.query({
          query: (
            id
          ) =>
            `/diagnoses/${id}`,
        }),

      // UPDATE
      updateDiagnosis:
        builder.mutation({
          query: ({
            id,
            ...credentials
          }) => ({
            url: `/diagnoses/update/${id}`,
            method:
              'PATCH',
            body:
              credentials,
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Diagnoses',
            ],
        }),

      // DELETE
      deleteDiagnosis:
        builder.mutation({
          query: (id) => ({
            url: `/diagnoses/delete/${id}`,
            method:
              'DELETE',
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Diagnoses',
            ],
        }),
    }),
  })

export const {
  useCreateDiagnosisMutation,
  useGetDiagnosesQuery,
  useGetDiagnosisByIdQuery,
  useUpdateDiagnosisMutation,
  useDeleteDiagnosisMutation,
} = diagnosisApi    