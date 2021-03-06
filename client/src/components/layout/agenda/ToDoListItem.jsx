import { useState } from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DateRangeIcon from '@material-ui/icons/DateRange';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import TimerIcon from '@material-ui/icons/Timer';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { useAddEventMutation, useUpdateEventMutation } from '../../../slices/eventsApiSlice';
import { useRescheduleChoreMutation } from '../../../slices/choresApiSlice';
import {
    KeyboardTimePicker,
    KeyboardDatePicker,
    KeyboardDateTimePicker
} from '@material-ui/pickers';
import SaveIcon from '@material-ui/icons/Save';
import UndoIcon from '@material-ui/icons/Undo';
import formatScheduledAt from '../../../utilities/formatScheduledAt';
import { toDoItemStyles as useStyles } from './styles';
import agendaStatuses from '../../../constants/agendaStatuses';
import EditIcon from '@material-ui/icons/Edit';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import agenda from '../../../slices/agendaSlice';
import { useDispatch } from 'react-redux';

export default function ToDoListItem({
    headCells, row, labelId, setDeleteEventModalUuid, isEventDeleteLoading
}) {
    const classes = useStyles();
    const [rescheduleChore, { isChoreRescheduleLoading }] = useRescheduleChoreMutation();
    const [addEvent, { isEventAddLoading }] = useAddEventMutation();
    const [updateEvent, { isEventUpdateLoading }] = useUpdateEventMutation();
    const [editChoreDate, setEditChoreDate] = useState(false);
    const [editEventDate, setEditEventDate] = useState(false);
    const [completedDateTime, setCompletedDateTime] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const dispatch = useDispatch();
    const { ignoreChoreToday } = agenda.actions;

    const handleCompletedEvent = function (uuid, type) {
        if (type === 'chore') {
            addEvent({
                choreUuid: uuid,
                status: 'done',
                completedAt: new Date()
            });
        } else if (type === 'event') {
            updateEvent({
                uuid,
                status: 'done',
                completedAt: new Date()
            });
        }
    };

    const handleIgnoreChoreToday = function (uuid) {
        dispatch(ignoreChoreToday({ uuid }));
    };

    const handleAddProgressEvent = function (uuid) {
        addEvent({
            choreUuid: uuid,
            status: 'progress',
            startedAt: new Date()
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

    if (isEventAddLoading || isEventUpdateLoading || isChoreRescheduleLoading || isEventDeleteLoading) {
        return (<div>Loading...</div>);
    }

    return (
        <TableRow
            role="checkbox"
            tabIndex={-1}
            key={`${row.uuid}`}
        >
            <TableCell padding="checkbox">
                {row.type === 'chore' ? (
                    <div className={classes.tableCell}>
                        <Tooltip title="Skip chore today">
                            <IconButton aria-label="Skip chore today" onClick={() => handleIgnoreChoreToday(row.uuid)}>
                                <VisibilityOffIcon />
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
                            <IconButton onClick={() => setEditChoreDate(false)}>
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
            <TableCell>{agendaStatuses[row.status]}</TableCell>
            <TableCell align="right">{row.formattedDueDate}</TableCell>
            {headCells.findIndex(c => c.id === 'frequency') >= 0 ? (
                <TableCell>{row.formattedFrequency}</TableCell>) : null
            }
            {headCells.findIndex(c => c.id === 'lastCompletedDate') >= 0 ? (
                <TableCell align="right">
                    {row.type === 'chore' ? row.formattedLastCompletedDate : (row.status === 'done' && editEventDate) ? (
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
                            <IconButton onClick={() => setEditEventDate(false)}>
                                <UndoIcon />
                            </IconButton>
                            <IconButton onClick={handleEditCompletedDate}>
                                <SaveIcon />
                            </IconButton>
                        </span>
                    ) : row.status === 'done' && !editEventDate ? (
                        <span>{row.formattedLastCompletedDate}</span>
                    ) : (
                        <span className={classes.editableTableCell}>
                            {row.formattedLastCompletedDate}
                        </span>
                    )}
                </TableCell>) : null}
            <TableCell padding="checkbox">
                <div className={classes.tableCell}>
                    {row.type === 'chore' ? (
                        <Tooltip title="Set start time now">
                            <IconButton aria-label="Set start time now" onClick={() => handleAddProgressEvent(row.uuid)}>
                                <TimerIcon />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                    {row.status !== 'done' ? (
                        <Tooltip title="Mark Complete">
                            <IconButton aria-label="Mark Complete" onClick={() => handleCompletedEvent(row.uuid, row.type)}>
                                <CheckCircleIcon />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                    {row.type === 'event' ? (
                        <>
                            <Tooltip title="Edit Event">
                                <IconButton onClick={() => setEditEventDate(true)}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Event">
                                <IconButton aria-label="Delete Event" onClick={()=>setDeleteEventModalUuid(row.uuid)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : null}
                </div>
            </TableCell>
        </TableRow>
    );
}
