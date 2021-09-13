
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import agenda from '../../../slices/agendaSlice';
import IconButton from '@material-ui/core/IconButton';
import { filterHeadStyles as useStyles } from './styles';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import format from 'date-fns/format';
import { DATE_AND_TIME_FORMAT } from '../../../constants/dateTimeFormats';

export default function ToDoListSkippedFilterHead({ chores, todaySkippedChores }) {
    const classes = useStyles();
    const [view, setView] = useState(localStorage.getItem('agendaIgnoreTodayFilterView') === 'true');
    const dispatch = useDispatch();
    const { updateTodayIgnoredChores } = agenda.actions;

    const handleSelectedTagsChange = (event) => {
        const { value } = event.target;
        dispatch(updateTodayIgnoredChores(value.map(v => {
            return (typeof v === 'string') ? { uuid: v, date: format(new Date(), DATE_AND_TIME_FORMAT) } : v;
        })));
    };

    const handleViewChange = function() {
        setView(!view);
        localStorage.setItem('agendaIgnoreTodayFilterView', !view);
    };

    if (!view) {
        return (
            <div className={`${classes.root} ${classes.inline}`}>
                <h3 className={classes.inline}>Today's Ignored Chores</h3>
                <Tooltip title="Toggle View"><IconButton onClick={handleViewChange}><VisibilityOffIcon /></IconButton></Tooltip>
            </div>
        );
    }

    return (
        <div className={classes.root}>
            <h3 className={classes.inline}>Today's Ignored Chores</h3>
            <Tooltip title="Toggle View"><IconButton onClick={handleViewChange}><VisibilityIcon /></IconButton></Tooltip>
            <FormControl variant="filled" className={classes.formControl}>
                <Select
                    id="demo-multiple-chip"
                    multiple
                    value={todaySkippedChores.map(c => c.uuid)}
                    onChange={handleSelectedTagsChange}
                    input={<Input id="select-multiple-chip" />}
                    renderValue={(skippedChoreUuids) => (
                        <div className={classes.chips}>
                            {
                                skippedChoreUuids.map((skippedChore, key) => {
                                    const selectedChores = chores.find(c => c.uuid === skippedChore);
                                    if (!selectedChores) return null;
                                    return (
                                        <Chip key={key} label={selectedChores.name} className={classes.chip} />
                                    );
                                })
                            }
                        </div>
                    )}
                    variant="outlined"
                >
                    {chores.map((chore, index) => {
                        return (
                            <MenuItem key={index} value={chore.uuid}>
                                {chore.name}
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
        </div>
    );
}
