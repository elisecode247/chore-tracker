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
import UserSettings from '../user/UserSettings';
import AddChorePanel from '../chores/AddChorePanel';
import Journal from '../journal';
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
                        <EventsList />
                    </TabPanel>
                    <TabPanel value={selectedTab} index={1}>
                        <ChoresList />
                    </TabPanel>
                    <TabPanel value={selectedTab} index={2}>
                        <AddChorePanel />
                    </TabPanel>
                    <TabPanel value={selectedTab} index={3}>
                        <UserSettings />
                    </TabPanel>
                    <TabPanel value={selectedTab} index={4}>
                        <Journal />
                    </TabPanel>
                </MuiPickersUtilsProvider>
            )}
        </>
    );
};

export default Dashboard;
