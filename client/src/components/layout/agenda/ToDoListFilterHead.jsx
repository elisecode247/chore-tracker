
import React, { useState } from 'react';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { filterHeadStyles as useStyles } from './styles';
import FilterInput from './FilterInput';
import { useSelector, useDispatch } from 'react-redux';
import agenda from '../../../slices/agendaSlice';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

export default function ToDoListFilterHead({ headCells }) {
    const classes = useStyles();
    const filters = useSelector((state) => state.agenda.filters);
    const dispatch = useDispatch();
    const { addFilter } = agenda.actions;
    const [view, setView] = useState(localStorage.getItem('filterView') === 'true');

    const handleViewChange = function() {
        setView(!view);
        localStorage.setItem('filterView', !view);
    };

    if (!view) {
        return (<Button onClick={handleViewChange}><VisibilityOffIcon />Filters</Button>);
    }

    return (
        <div className={classes.root}>
            <IconButton onClick={handleViewChange}><VisibilityIcon /></IconButton>
            <h3 className={classes.inline}>Filters</h3>
            <IconButton onClick={() => dispatch(addFilter())}><AddIcon /></IconButton>
            <div className={classes.filterContainer}>
                {filters.map((filter, key) => {
                    return (
                        <FilterInput key={key} headCells={headCells} filter={filter} />
                    );
                })}
            </div>
        </div>
    );
}
