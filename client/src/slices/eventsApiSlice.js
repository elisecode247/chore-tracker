import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';

export const eventsApi = createApi({
    reducerPath: 'events',
    baseQuery: fetchBaseQuery(baseQuery),
    tagTypes: ['events'],
    endpoints: (builder) => ({
        getDoneEvents: builder.query({
            query: () => 'events/incomplete',
            transformResponse: (response) => response.data,
            providesTags: ['events']
        }),
        getTodayEvents: builder.query({
            query: () => 'events/today',
            transformResponse: (response) => response.data,
            providesTags: ['events']
        }),
        addEvent: builder.mutation({
            query: ({
                choreUuid,
                status = '',
                startedAt = null,
                completedAt = null
            }) => ({
                url: 'events',
                method: 'POST',
                body: {
                    choreUuid,
                    status,
                    ...(startedAt ? { started_at: startedAt } : {}),
                    ...(completedAt ? { completed_at: completedAt } : {}),
                },
            }),
            invalidatesTags: ['events']

        }),
        deleteEvent: builder.mutation({
            query: ({ uuid }) => ({
                url: 'events',
                method: 'DELETE',
                body: { uuid },
                validateStatus: (response, result) => {
                    if(!result.success) {
                        console.error(result);
                        return false;
                    }
                    return response.status === 200 && result.success;
                }
            }),
            invalidatesTags: ['events']

        }),
        updateEvent: builder.mutation({
            query: ({
                uuid,
                status = '',
                location = '',
                notes= '',
                startedAt = null,
                completedAt = null
            }) => ({
                url: 'events',
                method: 'PUT',
                body: {
                    uuid,
                    status,
                    location,
                    notes,
                    ...(startedAt ? { started_at: startedAt } : {}),
                    ...(completedAt ? { completed_at: completedAt } : {})
                },
            }),
            invalidatesTags: ['events']

        }),
    })
});

export const {
    useAddEventMutation,
    useDeleteEventMutation,
    useUpdateEventMutation,
    useGetDoneEventsQuery,
    useGetTodayEventsQuery,
    useGetUndoneEventsQuery
} = eventsApi;
