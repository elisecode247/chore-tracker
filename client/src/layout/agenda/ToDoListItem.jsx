import { useState } from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DateRangeIcon from '@material-ui/icons/DateRange';
import TimerIcon from '@material-ui/icons/Timer';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { useAddEventMutation, useUpdateEventMutation } from '../../slices/eventsApiSlice';
import { useRescheduleChoreMutation } from '../../slices/choresApiSlice';
import addDays from 'date-fns/addDays';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {
    KeyboardTimePicker,
    KeyboardDatePicker,
    KeyboardDateTimePicker
} from '@material-ui/pickers';
import SaveIcon from '@material-ui/icons/Save';
import UndoIcon from '@material-ui/icons/Undo';
import formatScheduledAt from '../../utilities/formatScheduledAt';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    filterIcon: {
        '&:hover': {
            color: 'orange'
        }
    },
    h1: {
        fontSize: '1.5rem'
    },
    h1Subtitle: {
        fontSize: '1rem',
        marginLeft: '1rem'
    },
    table: {
        minWidth: 750,
    },
    tableCell: {
        display: 'flex'
    },
    editableTableCell: {
        '&:hover': {
            color: 'orange',
            cursor: 'pointer'
        }
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
    submitButton: {
        margin: 'auto 4px 13px 4px'
    }
}));

const ToDoItem = function ({ row, labelId }) {
    const classes = useStyles();
    const [rescheduleChore, { isChoreRescheduleLoading }] = useRescheduleChoreMutation();
    const [addEvent, { isEventAddLoading }] = useAddEventMutation();
    const [updateEvent, { isEventUpdateLoading }] = useUpdateEventMutation();
    const [editChoreDate, setEditChoreDate] = useState(false);
    const [editEventDate, setEditEventDate] = useState(false);
    const [completedDateTime, setCompletedDateTime] = useState(new Date(row.scheduledAt));
    const [startDate, setStartDate] = useState(new Date(row.scheduledAt));
    const [startTime, setStartTime] = useState(new Date(row.scheduledAt));

    const handleCompletedEvent = function (uuid, status) {
        if (status === 'Not yet') {
            addEvent({
                choreUuid: uuid,
                status: 'done',
                completedAt: new Date()
            });
        } else if (status === 'progress') {
            updateEvent({
                uuid,
                status: 'done',
                completedAt: new Date()
            });
        }
    };

    const handleRescheduleTomorrowEvent = function (uuid, scheduledAt) {
        rescheduleChore({
            uuid,
            scheduledAt: addDays(new Date(), 1)
        });
    };

    const handleAddProgressEvent = function (choreUuid) {
        addEvent({
            choreUuid,
            status: 'progress',
            completedAt: new Date()
        });
    };

    const handleEditCompletedDate = () => {
        updateEvent({
            uuid: row.uuid,
            status: 'done',
            completedAt: completedDateTime
        });
        setEditEventDate(false);
    };

    const handleChoreStartDate = () => {
        const hasTime = row.hasTime;
        const scheduledAt = formatScheduledAt(startDate, hasTime && startTime);

        rescheduleChore({
            uuid: row.uuid,
            scheduledAt
        });
        setEditChoreDate(false);

    };

    if (isEventAddLoading || isEventUpdateLoading || isChoreRescheduleLoading) {
        return (<div>Loading...</div>);
    }

    return (
        <TableRow
            hover
            role="checkbox"
            tabIndex={-1}
            key={`${row.uuid}`}
        >
            <TableCell padding="checkbox">
                {row.type === 'chore' ? (
                    <div className={classes.tableCell}>
                        <Tooltip title="Reschedule tomorrow">
                            <IconButton aria-label="Reschedule tomorrow" onClick={() => handleRescheduleTomorrowEvent(row.uuid, row)}>
                                <WatchLaterIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Reschedule">
                            <IconButton aria-label="Reschedule" className={classes.editableTableCell} onClick={() => setEditChoreDate(true)}>
                                <DateRangeIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                ) : null}
                {editChoreDate ? (
                    <>
                        <KeyboardDatePicker
                            disableToolbar
                            variant="inline"
                            format="MM/dd/yyyy"
                            margin="normal"
                            id="scheduled-chore-date-local"
                            label="Starting Date"
                            value={startDate}
                            onChange={setStartDate}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                        {row.hasTime ? (
                            <KeyboardTimePicker
                                margin="normal"
                                id="scheduled-chore-time-local"
                                label="Starting Time"
                                value={startTime}
                                onChange={setStartTime}
                                KeyboardButtonProps={{
                                    'aria-label': 'change time',
                                }}
                                variant="inline"
                            />
                        ) : null}
                        <Tooltip title="Undo">
                            <IconButton onClick={()=> setEditChoreDate(false)}>
                                <UndoIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Save Reschedule">
                            <IconButton aria-label="Update Chore Start Date" onClick={() => handleChoreStartDate(row.uuid, row.status)}>
                                <CheckCircleIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                ) : null}
            </TableCell>
            <TableCell component="th" id={labelId} scope="row" padding="none">
                {row.name}
            </TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell align="right">{row.formattedDueDate}</TableCell>
            <TableCell>{row.formattedFrequency}</TableCell>
            <TableCell align="right">
                {row.type === 'chore' ? row.formattedLastCompletedDate : editEventDate ? (
                    <span>
                        <KeyboardDateTimePicker
                            margin="normal"
                            id="scheduled-chore-time-local"
                            label="Completed Date and Time"
                            value={completedDateTime}
                            onChange={setCompletedDateTime}
                            KeyboardButtonProps={{
                                'aria-label': 'change date and time',
                            }}
                            variant="inline"
                        />
                        <IconButton onClick={()=> setEditEventDate(false)}>
                            <UndoIcon />
                        </IconButton>
                        <IconButton onClick={handleEditCompletedDate}>
                            <SaveIcon />
                        </IconButton>
                    </span>
                ) : (
                    <span className={classes.editableTableCell} onClick={() => setEditEventDate(true)}>
                        {row.formattedLastCompletedDate}
                    </span>
                )}
            </TableCell>
            <TableCell padding="checkbox">
                <div className={classes.tableCell}>
                    {row.status === 'Not yet' ? (
                        <Tooltip title="Set start time now">
                            <IconButton aria-label="Set start time now" onClick={() => handleAddProgressEvent(row.choreUuid)}>
                                <TimerIcon />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                    {row.status !== 'done' ? (
                        <Tooltip title="Mark Complete">
                            <IconButton aria-label="Mark Complete" onClick={() => handleCompletedEvent(row.uuid, row.status)}>
                                <CheckCircleIcon />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                </div>
            </TableCell>
        </TableRow>
    );
};

export default ToDoItem;
