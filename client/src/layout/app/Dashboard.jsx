import React, { useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import DashboardBar from './DashboardBar';
import ChoreListBar from '../chores/ChoreListBar';
import ChoresList from '../chores/ChoresList';
import EventsList from '../events/EventsList';
import Journal from '../journal/journal';
import ToDoList from '../agenda/ToDoList';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import TabPanel from './TabPanel';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector, fetchUserByToken, clearState } from '../../slices/userApiSlice';
import clsx from 'clsx';
import { DAY_OF_WEEK_AND_DATE } from '../../constants/dateTimeFormats';
import format from 'date-fns/format';
import UserSettings from '../user/UserSettings';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%'
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
}));

function Dashboard() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const history = useHistory();
    const [selectedTab, setTab] = useState(0);
    const [token] = useState(localStorage.getItem('token'));
    const { isFetching, isError } = useSelector(userSelector);
    const onLogOut = () => {
        localStorage.removeItem('token');
        history.push('/login');
    };

    useEffect(() => {
        dispatch(fetchUserByToken({ token }));
    }, [dispatch, token]);

    useEffect(() => {
        if (isError) {
            dispatch(clearState());
            history.push('/login');
        }
    }, [dispatch, history, isError]);

    return (
        <>
            {isFetching ? <div>Loading...</div> : (
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DashboardBar isFetching={isFetching} onLogOut={onLogOut} selectedTab={selectedTab} setTab={setTab} />
                    <TabPanel value={selectedTab} index={1}>
                        <EventsList />
                    </TabPanel>
                    <TabPanel value={selectedTab} index={2}>
                        <ChoreListBar />
                        <ChoresList />
                    </TabPanel>
                    <TabPanel value={selectedTab} index={0}>
                        <Paper className={classes.paper}>
                            <Toolbar className={clsx(classes.root)}>
                                <Typography className={classes.h1} variant="h1" id="tableTitle" component="div">
                                    Agenda
                                    <span className={classes.h1Subtitle}>{format(new Date(), DAY_OF_WEEK_AND_DATE)}</span>
                                </Typography>
                            </Toolbar>
                            <Journal />
                            <ToDoList />
                        </Paper>
                    </TabPanel>
                    <TabPanel value={selectedTab} index={3}>
                        <UserSettings />
                    </TabPanel>
                </MuiPickersUtilsProvider>
            )}
        </>
    );
}

export default Dashboard;
