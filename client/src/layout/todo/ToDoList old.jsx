import React, { useState } from 'react';
import { useGetChoresQuery } from '../../slices/choresApiSlice';
import {
    useAddEventMutation,
    useGetDoneTodayEventsQuery,
} from '../../slices/eventsApiSlice';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import isSameDay from 'date-fns/isSameDay';
import isBefore from 'date-fns/isBefore';
import format from 'date-fns/format';
import styles from '../../styles';
import SuggestedChore from './SuggestedChore';
import CompletedTodayListItem from './CompletedTodayListItem';
import { DAY_OF_WEEK_AND_DATE } from '../../constants/dateTimeFormats';
import { formatGetDoneTodayEvents } from '../../utilities/events';
import { formatChores } from '../../utilities/chores';

const useStyles = makeStyles((theme) => ({
    button: {
        margin: '1rem auto auto auto'
    },
    section: {
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    root: {
        backgroundColor: styles.paper,
        textAlign: 'left',
        padding: '2rem 0'
    },
    article: {
        margin: '2rem auto',
        border: '1px solid lightgrey'
    },
    h1: {
        display: 'inline',
        textAlign: 'left',
        fontSize: '1.8rem',
        margin: '0.5rem',
        color: styles.primary
    },
    h2: {
        display: 'inline',
        textAlign: 'left',
        fontSize: '1.5rem',
        margin: '0.5rem',
        color: styles.primary
    },
    listItem: {
        backgroundColor: styles.paper,
    }
}));

export default function ToDoList() {
    const classes = useStyles();
    const { data: choresFromServer, error, isLoading } = useGetChoresQuery();
    const { data: eventsCompletedTodayFromServer, error: completedEventsTodayError, isLoading: isCompletedEventsTodayLoading } = useGetDoneTodayEventsQuery();
    const [addEvent, { isEventAddLoading }] = useAddEventMutation();
    const [completedEvent, setCompletedEvent] = useState(null);
    const [sectionSuggestionsOpened, toggleSectionSuggestionsOpened] = useState(true);
    const [sectionCompletedTodayOpened, toggleSectionCompletedTodayOpened] = useState(true);
    const today = new Date();
    const chores = formatChores(choresFromServer);
    const eventsDoneToday = formatGetDoneTodayEvents(eventsCompletedTodayFromServer);
    const handleAddEventSelect = function (event) {
        addEvent({
            choreUuid: completedEvent.uuid,
            status: 'done',
            completedAt: new Date()
        });
        setCompletedEvent(null);
    };


    if (error) {
        console.error(error);
        return (<div>Error</div>);
    }

    if (isEventAddLoading) {
        return (<div>Saving Completed Event...</div>);
    }

    if (isLoading) {
        return (<div>Loading...</div>);
    }

    return (
        <Paper className={classes.root} >
            <article className={classes.article}>
                <header>
                    <Button onClick={() => toggleSectionSuggestionsOpened(!sectionSuggestionsOpened)}>
                        {sectionSuggestionsOpened ? <ExpandLess /> : <ExpandMore />}
                    </Button>
                    <h1 className={classes.h2}>Agenda</h1>
                    <span>{format(today, DAY_OF_WEEK_AND_DATE)}</span>
                </header>
                <Collapse in={sectionSuggestionsOpened}>
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Last Completed</TableCell>
                                <TableCell>Frequency</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {chores.filter((chore, idx) => (isBefore(chore.dueDate, today) || isSameDay(chore.dueDate, today)))
                                .map((chore, idx) => {
                                    return (
                                        <SuggestedChore chore={chore} key={idx} />
                                    );
                                })}
                        </TableBody>
                    </Table>
                </Collapse>
                <section className={classes.section}>
                    <p>Add Completed Chore: </p>
                    <Autocomplete
                        id="combo-box-chores"
                        value={completedEvent}
                        onChange={(event, newValue) => {
                            setCompletedEvent(newValue);
                        }}
                        options={choresFromServer}
                        getOptionLabel={(option) => option.name}
                        size="small"
                        style={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label="Select chore" variant="outlined" />}
                    />
                    <Button className={classes.button} color="primary" onClick={handleAddEventSelect} variant="contained">Submit completed chore</Button>
                </section>
            </article>
            <article className={classes.article}>
                <header>
                    <h2 className={classes.h2}>Completed</h2>
                    <Button onClick={() => toggleSectionCompletedTodayOpened(!sectionCompletedTodayOpened)}>
                        {sectionCompletedTodayOpened ? <ExpandLess /> : <ExpandMore />}
                    </Button>
                </header>
                <Collapse in={sectionCompletedTodayOpened}>
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Started</TableCell>
                                <TableCell>Completed</TableCell>
                                <TableCell>Time Spent</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Edit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isCompletedEventsTodayLoading ? <>Loading...</> :
                                (completedEventsTodayError ? <>Error</> :
                                    eventsDoneToday.map((event, idx) => {
                                        return (<CompletedTodayListItem key={idx} event={event} />);
                                    })
                                )
                            }
                        </TableBody>
                    </Table>
                </Collapse>
            </article>
        </Paper>
    );
}

