
import React, { useState } from 'react';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import { filterHeadStyles as useStyles } from './styles';
import FilterInput from './ChoresListFilterInput';
import { useDispatch } from 'react-redux';
import agenda from '../../../slices/agendaSlice';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import Tooltip from '@material-ui/core/Tooltip';

export default function ChoresListFilterHead({ filters }) {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { addFilter } = agenda.actions;
    const [view, setView] = useState(localStorage.getItem('filterView') === 'true');

    const handleViewChange = function() {
        setView(!view);
        localStorage.setItem('filterView', !view);
    };

    if (!view) {
        return (
            <div className={`${classes.root}`}>
                <h3 className={classes.inline}>Filters</h3>
                <Tooltip title="Toggle View"><IconButton onClick={handleViewChange}><VisibilityOffIcon /></IconButton></Tooltip>
            </div>
        );
    }

    return (
        <div className={classes.root}>
            <h3 className={classes.inline}>Filters</h3>
            <Tooltip title="Toggle View"><IconButton onClick={handleViewChange}><VisibilityIcon /></IconButton></Tooltip>
            <Tooltip title="Add Filter"><IconButton onClick={() => dispatch(addFilter())}><AddIcon /></IconButton></Tooltip>
            <div className={classes.filterContainer}>
                {filters.map((filter, key) => {
                    return (
                        <FilterInput key={key} filter={filter} />
                    );
                })}
            </div>
        </div>
    );
}
