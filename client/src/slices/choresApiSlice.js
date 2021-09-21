import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';

export const choresApi = createApi({
    reducerPath: 'chores',
    baseQuery: fetchBaseQuery(baseQuery),
    tagTypes: ['chores'],
    endpoints: (builder) => ({
        getChores: builder.query({
            query: () => 'chores',
            transformResponse: (response) => response.data,
            providesTags: ['chores'],
            invalidatesTags: ['chores']
        }),
        addChore: builder.mutation({
            query: ({
                name,
                description = '',
                startAt = new Date(),
                endAt = null,
                hasTime = false,
                frequency,
                selectedTags = []
            }) => ({
                url: 'chores',
                method: 'POST',
                body: {
                    name,
                    description,
                    start_at: startAt,
                    end_at: endAt,
                    has_time: hasTime,
                    frequency,
                    selectedTags
                },
                validateStatus: (response, result) => {
                    if(!result.success) {
                        console.error(result);
                        return false;
                    }
                    return response.status === 200 && result.success;
                }
            }),
            invalidatesTags: ['chores']
        }),
        updateChore:  builder.mutation({
            query: ({
                uuid,
                enabled,
                name,
                description,
                startAt,
                endAt,
                hasTime,
                frequency,
                selectedTags
            }) => ({
                url: 'chores',
                method: 'PUT',
                body: {
                    uuid,
                    ...(typeof enabled === 'undefined' ? {} : { enabled }),
                    ...(typeof name === 'undefined' ? {} : { name }),
                    ...(typeof description === 'undefined' ? {} : { description }),
                    ...(typeof startAt === 'undefined' ? {} : { start_at: startAt }),
                    ...(typeof endAt === 'undefined' ? {} : { end_at: endAt }),
                    ...(typeof hasTime === 'undefined' ? {} : { has_time: hasTime }),
                    ...(typeof frequency === 'undefined' ? {} : { frequency }),
                    ...(typeof selectedTags === 'undefined' ? {} : { selectedTags: selectedTags.map(t => t.uuid) })
                },
                validateStatus: (response, result) => {
                    if(!result.success) {
                        console.error(result);
                        return false;
                    }
                    return response.status === 200 && result.success;
                }
            }),
            invalidatesTags: ['chores']
        }),
        rescheduleChore: builder.mutation({
            query: ({
                uuid,
                scheduledAt = new Date()
            }) => ({
                url: `chores/${uuid}`,
                method: 'PUT',
                body: {
                    scheduledAt
                },
            }),
            invalidatesTags: ['chores']
        })
    })
});

export const {
    useAddChoreMutation,
    useRescheduleChoreMutation,
    useUpdateChoreMutation,
    useGetChoresQuery
} = choresApi;
