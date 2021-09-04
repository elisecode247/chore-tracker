import React, { useEffect, useState } from 'react';
import DashboardBar from './DashboardBar';
import ChoreListBar from '../chores/ChoreListBar';
import ChoresList from '../chores/ChoresList';
import EventsList from '../events/EventsList';
import TabPanel from './TabPanel';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector, fetchUserByToken, clearState } from '../../../slices/userApiSlice';
import Agenda from '../agenda';
import UserSettings from '../user/UserSettings';

function Dashboard() {
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
                        <Agenda />
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
