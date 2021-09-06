
import React from 'react';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import { filterHeadStyles as useStyles } from './styles';
import FilterInput from './FilterInput';
import { useSelector, useDispatch } from 'react-redux';
import agenda from '../../../slices/agendaSlice';

export default function ToDoListFilterHead({ headCells }) {
    const classes = useStyles();
    const filters = useSelector((state) => state.agenda.filters);
    const dispatch = useDispatch();
    const { addFilter } = agenda.actions;

    return (
        <div className={classes.root}>
            <h2>Filter</h2>
            <IconButton onClick={() => dispatch(addFilter())}><AddIcon /></IconButton>
            {filters.map((filter, key) => {
                return (
                    <FilterInput key={key} headCells={headCells} filter={filter} />
                );
            })}
        </div>
    );
}
