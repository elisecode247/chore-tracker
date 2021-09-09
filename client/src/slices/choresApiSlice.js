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
                isFrequencyChecked,
                reason = '',
                location = '',
                scheduledAt = new Date(),
                hasTime = false,
                frequencyAmount,
                frequencyType,
                frequencySubtype,
                selectedTags = []
            }) => ({
                url: 'chores',
                method: 'POST',
                body: {
                    name,
                    description,
                    reason,
                    location,
                    scheduledAt,
                    hasTime,
                    frequency: JSON.stringify({
                        repeatType: isFrequencyChecked ? frequencyType : 'once',
                        repeatAmount: frequencyAmount || 1,
                        repeatSubtype: frequencySubtype || ''
                    }),
                    selectedTags
                },
                validateStatus: (response, result) => {
                    if(!result.success) {
                        console.error(result);
                    }
                    return response.status === 200 && result.success;
                }
            })
        }),
        updateChore:  builder.mutation({
            query: ({
                uuid,
                name = '',
                description = '',
                isFrequencyChecked,
                reason = '',
                location = '',
                scheduledAt = new Date(),
                hasTime = false,
                frequencyAmount = 1,
                frequencyType = 'day',
                frequencySubtype = 'once',
                selectedTags = []
            }) => ({
                url: 'chores',
                method: 'PUT',
                body: {
                    uuid,
                    name,
                    description,
                    reason,
                    location,
                    scheduledAt,
                    hasTime,
                    frequency: JSON.stringify({
                        repeatType: isFrequencyChecked ? frequencyType : 'once',
                        repeatAmount: frequencyAmount || 1,
                        repeatSubtype: frequencySubtype || ''
                    }),
                    selectedTags
                },
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
