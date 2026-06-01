import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'

export const auditlogsApi =
  createApi({
    reducerPath:
      'auditlogsApi',

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
    tagTypes: ['AuditLogs'],

    endpoints: (
      builder
    ) => ({
   

      // GET ALL
      getAuditLogs:
        builder.query({
          query: () =>
            '/audit-logs/all',

          providesTags: [
            'AuditLogs',
          ],
        }),

 
    }),
  })

export const {
    useGetAuditLogsQuery,
} = auditlogsApi