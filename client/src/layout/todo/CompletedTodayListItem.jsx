import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import CancelIcon from '@material-ui/icons/Cancel';
import Collapse from '@material-ui/core/Collapse';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import SaveIcon from '@material-ui/icons/SaveOutlined';
import TableCell from '@material-ui/core/TableCell';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import styles from '../../styles';
import format from 'date-fns/format';
import formatDistance from 'date-fns/formatDistance';
import { DATE_AND_TIME_FORMAT, TIME_FORMAT } from '../../constants/dateTimeFormats';
import DateFnsUtils from '@date-io/date-fns'; // choose your lib
import {
    DateTimePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { useUpdateEventMutation } from '../../slices/eventsApiSlice';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: styles.paper,
        textAlign: 'left',
        '& hr': {
            margin: theme.spacing(0, 0.5),
        }
    },
    form: {
        display: 'block',
        width: '100%',
        flexGrow: 3
    },
    header: {
        display: 'inline',
        textAlign: 'left',
        fontSize: '2rem',
        margin: '0.5rem',
        color: styles.primary
    },
    listItem: {
        backgroundColor: '#fff',
        border: '1px solid lightgrey',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    marginRight: {
        marginRight: '0.5rem'
    }
}));

export default function CompletedTodayListItem({ event }) {
    const [updateEvent, { isEventUpdateLoading }] = useUpdateEventMutation();
    const [open, setOpen] = useState(false);
    const [isEditing, setEditing] = useState(false);
    const [selectedStartDate, handleStartDateChange] = useState(event.startedAt);
    const [selectedCompleteDate, handleCompleteDateChange] = useState(event.completedAt);
    const [location, setLocation] = useState(event.location);
    const [notes, setNotes] = useState(event.notes);
    const classes = useStyles();

    async function handleEventUpdate(){
        await updateEvent({
            ...event,
            startedAt: selectedStartDate,
            completedAt: selectedCompleteDate,
            location,
            notes
        });
        setEditing(false);
    }

    if(isEventUpdateLoading) {
        return (<div>Updating...</div>);
    }
    return (
        <>
            <TableRow className={classes.root}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{event.name}</TableCell>
                <TableCell>
                    {!isEditing ?
                        ((event.startedAt && format(event.startedAt, DATE_AND_TIME_FORMAT)) || '--') :
                        (
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <DateTimePicker value={selectedStartDate} onChange={handleStartDateChange} />
                            </MuiPickersUtilsProvider>
                        )
                    }
                </TableCell>
                <TableCell>
                    {!isEditing ?
                        ((event.completedAt && format(event.completedAt, TIME_FORMAT)) || '--') :
                        (
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <DateTimePicker value={selectedCompleteDate} onChange={handleCompleteDateChange} />
                            </MuiPickersUtilsProvider>
                        )
                    }
                </TableCell>
                <TableCell>
                    {!isEditing ?
                        (event.startedAt && event.completedAt && formatDistance(event.startedAt, event.completedAt)) || '--' :
                        (selectedStartDate && selectedCompleteDate && formatDistance(selectedStartDate, selectedCompleteDate)) || ''
                    }
                </TableCell>
                <TableCell>{!isEditing ? event.location || '' : (
                    <TextField value={location} onChange={(evt) => setLocation(evt.target.value)} />
                )}</TableCell>
                <TableCell>
                    {!isEditing ? (
                        <>
                            <IconButton size="small" onClick={()=> setEditing(true)}><EditIcon /></IconButton>
                        </>
                    ) : (
                        <>
                            <Tooltip title="Cancel">
                                <IconButton size="small" onClick={()=> setEditing(false)} ><CancelIcon/></IconButton>
                            </Tooltip>
                            <Tooltip title="Save">
                                <IconButton size="small" onClick={handleEventUpdate} ><SaveIcon /></IconButton>
                            </Tooltip>
                        </>

                    )}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box></Box>
                        <Box>{event.completed_at && format(event.completed_at, DATE_AND_TIME_FORMAT)}</Box>
                        <Box margin={0} className={classes.historyContainer}>
                            <Typography gutterBottom component="span">
                                Notes
                            </Typography>
                            {!isEditing ? (!event.notes ? <p>--</p> : (
                                <p>{event.notes}</p>
                            )) : (
                                <TextField
                                    value={notes}
                                    id="edit-event-notes"
                                    fullWidth
                                    onChange={(evt) => setNotes(evt.target.value)}
                                    variant="filled"
                                />
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}
