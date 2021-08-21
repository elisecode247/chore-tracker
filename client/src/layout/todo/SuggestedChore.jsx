import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useAddEventMutation } from '../../slices/eventsApiSlice';
import { useRescheduleChoreMutation } from '../../slices/choresApiSlice';
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
import rescheduleTomorrow from '../../utilities/rescheduleTomorrow';

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
    const [ rescheduleChore, { isChoreUpdateLoading }] = useRescheduleChoreMutation();

    const [open, setOpen] = useState(false);

    function rescheduleChoreTomorrow(evt){
        evt.stopPropagation();

        const scheduledAt = rescheduleTomorrow(chore.scheduledAt);

        rescheduleChore({
            uuid: chore.uuid,
            scheduledAt
        });
    }

    function rescheduleTask(evt){
        evt.stopPropagation();
    }

    function handleEventStart(evt){
        evt.stopPropagation();
        addEvent({
            choreUuid: chore.uuid,
            status: 'progress',
            completedAt: new Date()
        });
    }

    function handleEventDone(evt){
        evt.stopPropagation();
        addEvent({
            choreUuid: chore.uuid,
            status: 'done',
            completedAt: new Date()
        });
    }

    if(isEventAddLoading || isChoreUpdateLoading) {
        return (<>Loading...</>);
    }

    return (
        <>
            <TableRow>
                <TableCell>
                    <ButtonGroup variant="contained" size="small">
                        <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                        <Button color="secondary" onClick={rescheduleChoreTomorrow}>Skip</Button>
                        <Button onClick={rescheduleTask}>Reschedule</Button>
                        <Button onClick={handleEventStart}>Mark Complete</Button>
                        <Button color="primary" onClick={handleEventDone}>Mark Complete</Button>
                    </ButtonGroup>
                </TableCell>
                <TableCell>
                    {chore.name}
                </TableCell>
                <TableCell>{(chore.formattedLastCompletedDate) || 'Unknown'}</TableCell>
                <TableCell>{chore.when}</TableCell>
                <TableCell align="right">
                </TableCell>
            </TableRow>
            <TableRow className={classes.root} container="true" align="center">
                <TableCell colSpan={4} style={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Collapse in={open}>
                        <Box margin={1}>
                            <h3>Reason</h3>
                            <div>{chore.reason || '--'}</div>
                            <h3>How</h3>
                            <div>{chore.description || '--'}</div>
                            <h3>Where</h3>
                            <div>{chore.location || '--'}</div>
                            <h3>Tags</h3>
                            <Box margin={1}>
                                {!chore.tags ? '' : chore.tags.map((tag, idx) => (
                                    <Chip key={idx} label={tag.name} variant="outlined" />
                                ))}
                            </Box>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}
