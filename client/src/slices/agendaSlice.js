import { createSlice } from '@reduxjs/toolkit';
const savedFilters = localStorage.getItem('filters');

const initialState = {
    filters: JSON.parse(savedFilters) || [],
};

export const agendaSlice = createSlice({
    name: 'agenda',
    initialState,
    reducers: {
        addFilter: (state) => {
            state.filters.push({ id: state.filters.length, name: '', value: '', operator: '' });
        },
        deleteFilter: (state, action) => {
            state.filters.splice(action.payload, 1);
            for (let i= 0; i < state.filters.length; i++) {
                state.filters[i].id = i;
            }
        },
        updateFilter: (state, action) => {
            state.filters[action.payload.id][action.payload.name] = action.payload.value;
            if(action.payload.name === 'name') {
                state.filters[action.payload.id].operator = '';
                state.filters[action.payload.id].value = action.payload.value === 'status' ? [] : '';
            }
        }
    },
});

export const agendaName = agendaSlice.name;
export const agendaReducer = agendaSlice.reducer;

export const { addFilter, deleteFilter } = agendaSlice.actions;

export default agendaSlice;
