import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useAddEventMutation } from '../../slices/eventsApiSlice';
import Box from '@material-ui/core/Box';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import { DATE_AND_TIME_FORMAT } from '../../constants/dateTimeFormats';
import format from 'date-fns/format';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 'fit-content',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.secondary
    }
}));

export default function SuggestedChore({ chore, idx }) {
    const classes = useStyles();
    const [addEvent, { isEventAddLoading }] = useAddEventMutation();
    const [open, setOpen] = useState(false);

    function rescheduleTask(event){
        event.stopPropagation();
        alert('Under Construction');
    }

    function handleTaskStart(event){
        addEvent({
            choreUuid: chore.uuid,
            status: 'progress',
            startedAt: new Date()
        });
    }

    function handleTaskComplete(event){
        addEvent({
            choreUuid: chore.uuid,
            status: 'done',
            completedAt: new Date()
        });
    }

    if(isEventAddLoading) {
        return (<>Loading...</>);
    }

    return (
        <>
            <TableRow>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>
                    {chore.name}
                </TableCell>
                <TableCell>{formatStatus(chore.status)}</TableCell>
                <TableCell>{(chore.lastCompletedDate && format(chore.lastCompletedDate, DATE_AND_TIME_FORMAT)) || 'Unknown'}</TableCell>
                <TableCell align="right">
                    <ButtonGroup variant="contained" size="small">
                        <Button onClick={rescheduleTask}>Reschedule</Button>
                        <Button color="secondary" onClick={handleTaskStart}>Mark Start</Button>
                        <Button color="primary" onClick={handleTaskComplete}>Mark Complete</Button>
                    </ButtonGroup>
                </TableCell>
            </TableRow>
            <TableRow className={classes.root} container="true" align="center">
                <TableCell colSpan={4} style={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Collapse in={open}>
                        <Box>Last done: {chore.lastCompletedDate && format(chore.lastCompletedDate, DATE_AND_TIME_FORMAT)}</Box>
                        <Box margin={1}>
                            {chore.description && <h3>How</h3>}
                            {chore.description && <div>{chore.description}</div>}
                            {chore.reason && <h3>Why is it important to do?</h3>}
                            {chore.reason && <div>{chore.reason}</div>}
                            {chore.location && <h3>Where</h3>}
                            {chore.location && <div>{chore.location}</div>}
                            {chore.tags && <h3>Tags</h3>}
                            {chore.tags && (
                                <Box margin={1}>
                                    {!chore.tags ? '' : chore.tags.map((tag, idx) => (
                                        <Chip key={idx} label={tag.name} variant="outlined" />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

function formatStatus(status) {
    switch (status) {
    case 'progress':
        return 'In Progress';
    case 'done':
        return 'Done';
    default:
        return 'Not started';
    }
}
