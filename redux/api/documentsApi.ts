import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'

export const documentsApi =
  createApi({
    reducerPath:
      'documentsApi',

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
    tagTypes: ['Documents'],

    endpoints: (
      builder
    ) => ({
      // CREATE
      createDocument:
        builder.mutation({
          query: (
            credentials
          ) => ({
            url:
              '/medical-documents/create',
            method:
              'POST',
            body:
              credentials,
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Documents',
            ],
        }),

      // GET ALL
      getDocuments:
        builder.query({
          query: () =>
            '/medical-documents/all',

          // CACHE TAG
          providesTags: [
            'Documents',
          ],
        }),
      
      // GET ONE
      getDocumentById:
        builder.query({
          query: (
            id
          ) =>
            `/medical-documents/${id}`,
        }),

      // DELETE
      deleteDocument:
        builder.mutation({
          query: (id) => ({
            url: `/medical-documents/delete/${id}`,
            method:
              'DELETE',
          }),

          // AUTO REFRESH
          invalidatesTags:
            [
              'Documents',
            ],
        }),
    }),
  })

export const {
  useCreateDocumentMutation,
  useGetDocumentsQuery,
  useGetDocumentByIdQuery,
  useDeleteDocumentMutation,
} = documentsApi