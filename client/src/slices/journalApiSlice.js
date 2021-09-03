import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';

export const journalApi = createApi({
    reducerPath: 'journal',
    baseQuery: fetchBaseQuery(baseQuery),
    tagTypes: ['journal'],
    endpoints: (builder) => ({
        getTodayJournalEntry: builder.query({
            query: () => 'journal/today',
            transformResponse: (response) => response.data,
            providesTags: ['journal'],

        }),
        addJournalEntry: builder.mutation({
            query: ({ entry, entryDate }) => ({
                url: 'journal',
                method: 'POST',
                body: { entry, entryDate },
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: ['journal']
        }),
        updateJournalEntry: builder.mutation({
            query: ({ entry, uuid }) => ({
                url: 'journal',
                method: 'PUT',
                body: { entry, uuid },
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: ['journal']
        }),
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useAddJournalEntryMutation, useGetTodayJournalEntryQuery, useUpdateJournalEntryMutation } = journalApi;
