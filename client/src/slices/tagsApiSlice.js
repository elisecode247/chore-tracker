import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const tagsApi = createApi({
    reducerPath: 'tags',
    baseQuery: fetchBaseQuery({ baseUrl: window.location.href + '/api/v1/' }),
    tagTypes: ['tags'],
    endpoints: (builder) => ({
        getTags: builder.query({
            query: () => 'tags',
            transformResponse: (response) => response.data,
            providesTags: ['tags'],

        }),
        addTag: builder.mutation({
            query: ({ name, description }) => ({
                url: 'tags',
                method: 'POST',
                body: { name, description },
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: ['tags']
        }),
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useAddTagMutation, useGetTagsQuery } = tagsApi;
