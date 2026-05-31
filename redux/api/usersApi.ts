import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'

export const usersApi =
  createApi({
    reducerPath:
      'usersApi',

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
    tagTypes: ['Users'],

    endpoints: (
      builder
    ) => ({
      // CREATE
      createUser:
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
              'Users',
            ],
        }),

      // GET ALL
      getUsers:
        builder.query({
          query: () =>
            '/users/all',

          // CACHE TAG
          providesTags: [
            'Users',
          ],
        }),

      getUsersByRole:
        builder.query({
          query: (role) =>
            `/users/role/${role}`,

          // CACHE TAG
          providesTags: [
            'Users',
          ],
        }),
      
      // GET ONE
      getUserById:
        builder.query({
          query: (
            id
          ) =>
            `/users/${id}`,
        }),

      // UPDATE
      updateUser:
        builder.mutation({
          query: ({
            id,
            ...credentials
          }) => ({
            url: `/users/update/${id}`,
            method:
              'PATCH',
            body:
              credentials,
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Users',
            ],
        }),

      // DELETE
      deleteUser:
        builder.mutation({
          query: (id) => ({
            url: `/users/delete/${id}`,
            method:
              'DELETE',
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Users',
            ],
        }),
    }),
  })

export const {
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUsersByRoleQuery,
} = usersApi