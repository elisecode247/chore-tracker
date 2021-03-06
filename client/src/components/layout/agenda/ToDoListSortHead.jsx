
import React, { useCallback, useState } from 'react';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import { useSelector, useDispatch } from 'react-redux';
import { addSort, reOrderSorts } from '../../../slices/agendaSlice';
import { sortHeadStyles as useStyles } from './styles';
import SortInput from './ToDoListSortInput';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import Tooltip from '@material-ui/core/Tooltip';


export default function ToDoListSortHead({ headCells }) {
    const classes = useStyles();
    const dispatch = useDispatch();
    const sorts = useSelector((state) => state.agenda.sorts);
    const [view, setView] = useState(localStorage.getItem('sortView') === 'true');

    const handleViewChange = function() {
        setView(!view);
        localStorage.setItem('sortView', !view);
    };

    const moveItem = useCallback((dragIndex, hoverIndex) => {
        dispatch(reOrderSorts({ sorts, dragIndex, hoverIndex }));
    }, [sorts, dispatch]);

    if (!view) {
        return (
            <div className={`${classes.root} ${classes.inline}`}>
                <h3 className={classes.inline}>Sort</h3>
                <Tooltip title="Toggle View"><IconButton onClick={handleViewChange}><VisibilityOffIcon /></IconButton></Tooltip>
            </div>
        );
    }

    return (
        <div className={classes.root}>
            <h3 className={classes.inline}>Sort</h3>
            <Tooltip title="Toggle View"><IconButton onClick={handleViewChange}><VisibilityIcon /></IconButton></Tooltip>
            <Tooltip title="Add Sort"><IconButton onClick={() => dispatch(addSort())}><AddIcon /></IconButton></Tooltip>
            <div className={classes.sortsContainer}>
                {sorts.map((sort, key) => {
                    return (
                        <SortInput moveItem={moveItem} headCells={headCells} index={sort.id} key={key} sort={sort} />
                    );
                })}
            </div>
        </div>
    );
}
