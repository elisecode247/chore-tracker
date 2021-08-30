import { configureStore } from '@reduxjs/toolkit';
import { choresApi } from './slices/choresApiSlice';
import { eventsApi } from './slices/eventsApiSlice';
import { tagsApi } from './slices/tagsApiSlice';
import { userApi } from './slices/userApiSlice';

export const store = configureStore({
    reducer: {
        [choresApi.reducerPath]: choresApi.reducer,
        [eventsApi.reducerPath]: eventsApi.reducer,
        [tagsApi.reducerPath]: tagsApi.reducer,
        [userApi.name]: userApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(choresApi.middleware, eventsApi.middleware, tagsApi.middleware)
});
