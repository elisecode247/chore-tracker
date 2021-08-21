import React, { useState } from 'react';
import { useGetDoneEventsQuery } from '../../slices/eventsApiSlice';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Paper from '@material-ui/core/Paper';
import startOfMonth from 'date-fns/startOfMonth';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import getDay from 'date-fns/getDay';
import isSameDay from 'date-fns/isSameDay';
import getDaysInMonth from 'date-fns/getDaysInMonth';

const today = new Date();
const firstDate = startOfMonth(today);
const initDays = [];
for (let i = 0; i < getDay(firstDate); i++) {
    initDays.push(null);
}
initDays.push(firstDate);

let dateCounter = firstDate;
for (let i = 1; i < getDaysInMonth(today); i++) {
    dateCounter = addDays(dateCounter, 1);
    initDays.push(dateCounter);
}


export default function EventsList() {
    const { data: events } = useGetDoneEventsQuery();
    const [days] = useState(initDays);
    const [view, setView] = useState('day');
    const classes = useStyles();

    return (
        <Grid container className={classes.root} spacing={1}>
            <Grid item xs={12}>
                <Paper className={classes.control}>
                    <h2>{formattedDateHeader(view)}</h2>
                    <Grid container>
                        <Grid item>
                            <RadioGroup
                                name="calendarView"
                                aria-label="Calendar View"
                                value={view}
                                onChange={(evt) => setView(evt.target.value)}
                                row
                            >
                                {['day', 'week', 'month', 'year'].map((value) => (
                                    <FormControlLabel
                                        key={value}
                                        value={value}
                                        control={<Radio />}
                                        label={value}
                                    />
                                ))}
                            </RadioGroup>
                        </Grid>
                    </Grid>
                    {view === 'month' ? (
                        <Grid container>
                            {days.map((value, index) => {
                                if (!value) {
                                    return (
                                        <div className={classes.paper} key={index}></div>
                                    );
                                }
                                return (
                                    <div className={isToday(value) ? classes.today : classes.paper} key={index}>
                                        <div>{format(value, 'EEEE')}</div>
                                        <div>{format(value, 'd')}</div>
                                        <div className={classes.completedEventsContainer}>
                                            {
                                                events
                                                    .filter((event, index) => {
                                                        return (event.completed_date && isSameDay(new Date(event.completed_date), value));

                                                    })
                                                    .map(event => {
                                                        return (
                                                            <div className={classes.completedEvent} key={index}>
                                                                {event.name}
                                                            </div>
                                                        );
                                                    })
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </Grid>) : (<>Under Construction</>)}
                </Paper>
            </Grid>

        </Grid>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    today: {
        height: 140,
        width: '13%',
        border: '1px solid grey',
        backgroundColor: 'lightblue'
    },
    paper: {
        height: 140,
        width: '13%',
        border: '1px solid grey'
    },
    control: {
        padding: theme.spacing(2),
    },
    completedEvent: {
        width: '100%',
        fontSize: '0.75rem',
        border: '1px solid green',
        backgroundColor: 'lightgreen'
    },
    completedEventsContainer: {
        overflow: 'hidden'
    }
}));

function formattedDateHeader(view) {
    switch (view) {
    case 'day':
        return format(new Date(), 'MMMM dd, y');
    case 'month':
        return format(new Date(), 'MMMM y');
    default:
        return format(new Date(), 'MMMM y');
    }
}
