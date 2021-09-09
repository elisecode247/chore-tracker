import { createSlice } from '@reduxjs/toolkit';
const savedFilters = localStorage.getItem('choreListFilters');
const savedSorts = localStorage.getItem('choreListSorts');

const initialState = {
    filters: JSON.parse(savedFilters) || [],
    sorts: JSON.parse(savedSorts) || [{ id: 0, name: 'name', direction: 'asc' }]
};

export const choresListSlice = createSlice({
    name: 'choresList',
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
        },
        addSort: (state) => {
            state.sorts.push({ id: state.sorts.length, name: '', direction: 'asc' });
        },
        deleteSort: (state, action) => {
            state.sorts.splice(action.payload, 1).sort((a, b) => a.id - b.id);
            for (let i= 0; i < state.sorts.length; i++) {
                state.sorts[i].id = i;
            }
        },
        updateSort: (state, action) => {
            state.sorts[action.payload.id][action.payload.name] = action.payload.value;
        },
        reOrderSorts: (state, action) => {
            const { dragIndex, hoverIndex, sorts } = action.payload;
            const hoverItem = { ...sorts[hoverIndex], id: dragIndex };
            const dragItem = { ...sorts[dragIndex], id: hoverIndex };
            const updatedSorts = [...sorts ];
            updatedSorts[hoverIndex] = dragItem;
            updatedSorts[dragIndex] = hoverItem;
            return {
                ...state,
                sorts: updatedSorts
            };
        }
    },
});

export const choresListName = choresListSlice.name;
export const choresListReducer = choresListSlice.reducer;

export const { addFilter, deleteFilter, updateFilter, addSort, deleteSort, updateSort, reOrderSorts } = choresListSlice.actions;

export default choresListSlice;
