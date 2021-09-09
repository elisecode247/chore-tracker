import React, { useEffect, useState } from 'react';
import DashboardBar from './DashboardBar';
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
import AddChorePanel from '../chores/AddChorePanel';
const defaultSelectedTab = (
    localStorage.getItem('selectedTabIndex') &&
    parseInt(localStorage.getItem('selectedTabIndex'))
) || 0;

const Dashboard = function() {
    const dispatch = useDispatch();
    const history = useHistory();
    const [selectedTab, setTab] = useState(defaultSelectedTab);
    const [token] = useState(localStorage.getItem('token'));
    const { isFetching, isError } = useSelector(userSelector);
    const onLogOut = () => {
        localStorage.removeItem('token');
        history.push('/login');
    };

    const handleSetTab = (val) => {
        localStorage.setItem('selectedTabIndex', val);
        setTab(val);
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
                    <DashboardBar isFetching={isFetching} onLogOut={onLogOut} selectedTab={selectedTab} setTab={handleSetTab} />
                    <TabPanel value={selectedTab} index={0}>
                        <Agenda />
                    </TabPanel>
                    <TabPanel value={selectedTab} index={1}>
                        <EventsList />
                    </TabPanel>
                    <TabPanel value={selectedTab} index={2}>
                        <ChoresList />
                    </TabPanel>
                    <TabPanel value={selectedTab} index={3}>
                        <AddChorePanel />
                    </TabPanel>
                    <TabPanel value={selectedTab} index={4}>
                        <UserSettings />
                    </TabPanel>
                </MuiPickersUtilsProvider>
            )}
        </>
    );
};

export default Dashboard;
