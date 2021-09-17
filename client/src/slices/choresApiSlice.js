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
            })
        }),
        updateChore:  builder.mutation({
            query: ({
                uuid,
                enabled = null,
                name = '',
                description = '',
                isFrequencyChecked = null,
                scheduledAt = '',
                hasTime = null,
                frequencyAmount = 0,
                frequencyType = '',
                frequencySubtype = '',
                selectedTags = null
            }) => ({
                url: 'chores',
                method: 'PUT',
                body: {
                    uuid,
                    enabled,
                    name,
                    description,
                    scheduled_at: scheduledAt,
                    has_time: hasTime,
                    frequency: frequencyAmount ? JSON.stringify({
                        repeatType: isFrequencyChecked ? frequencyType : 'once',
                        repeatAmount: frequencyAmount || 0,
                        repeatSubtype: frequencySubtype || ''
                    }) : null,
                    ...(selectedTags ? { selectedTags: selectedTags.map(t => t.uuid) } : {})
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
