import { configureStore } from '@reduxjs/toolkit';
import { agendaName, agendaReducer } from './slices/agendaSlice';
import { choresApi } from './slices/choresApiSlice';
import { eventsApi } from './slices/eventsApiSlice';
import { journalApi } from './slices/journalApiSlice';
import { tagsApi } from './slices/tagsApiSlice';
import { userApi } from './slices/userApiSlice';
export const store = configureStore({
    reducer: {
        [agendaName]: agendaReducer,
        [choresApi.reducerPath]: choresApi.reducer,
        [eventsApi.reducerPath]: eventsApi.reducer,
        [journalApi.reducerPath]: journalApi.reducer,
        [tagsApi.reducerPath]: tagsApi.reducer,
        [userApi.name]: userApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(
                choresApi.middleware,
                eventsApi.middleware,
                journalApi.middleware,
                tagsApi.middleware
            )
});

store.subscribe(()=>{
    localStorage.setItem('filters', JSON.stringify(store.getState().agenda.filters));
});
