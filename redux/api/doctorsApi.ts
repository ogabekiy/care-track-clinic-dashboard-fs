import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'

export const doctorsApi =
  createApi({
    reducerPath:
      'doctorsApi',

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
    tagTypes: ['Doctors'],

    endpoints: (
      builder
    ) => ({
      // CREATE
      createDoctor:
        builder.mutation({
          query: (
            credentials
          ) => ({
            url:
              '/users/create',
            method:
              'POST',
            body:
              credentials,
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Doctors',
            ],
        }),

      // GET ALL
      getDoctors:
        builder.query({
          query: () =>
            '/doctors/all',

          // CACHE TAG
          providesTags: [
            'Doctors',
          ],
        }),

      getDoctorsByRole:
        builder.query({
          query: (role) =>
            `/doctors/role/${role}`,

          // CACHE TAG
          providesTags: [
            'Doctors',
          ],
        }),
      
      // GET ONE
      getDoctorById:
        builder.query({
          query: (
            id
          ) =>
            `/doctors/${id}`,
        }),

      // UPDATE
      updateDoctor:
        builder.mutation({
          query: ({
            id,
            ...credentials
          }) => ({
            url: `/doctors/update/${id}`,
            method:
              'PATCH',
            body:
              credentials,
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Doctors',
            ],
        }),

      // DELETE
      deleteDoctor:
        builder.mutation({
          query: (id) => ({
            url: `/doctors/delete/${id}`,
            method:
              'DELETE',
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Doctors',
            ],
        }),
    }),
  })

export const {
  useCreateDoctorMutation,
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
  useGetDoctorsByRoleQuery,
} = doctorsApi