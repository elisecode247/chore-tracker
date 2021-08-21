import React, { useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from './AppBar';
import ChoreListBar from '../chores/ChoreListBar';
import ChoresList from '../chores/ChoresList';
import EventsList from '../events/EventsList';
import ToDoList from '../todo/ToDoList';
import Paper from '@material-ui/core/Paper';
import TabPanel from './TabPanel';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

function App() {
    const [selectedTab, setTab] = useState(0);

    return (
        <>
            <CssBaseline />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <AppBar selectedTab={selectedTab} setTab={setTab} />
                <TabPanel value={selectedTab} index={1}>
                    <EventsList />
                </TabPanel>
                <TabPanel value={selectedTab} index={2}>
                    <ChoreListBar />
                    <ChoresList />
                </TabPanel>
                <TabPanel value={selectedTab} index={0}>
                    <ToDoList />
                </TabPanel>
                <TabPanel value={selectedTab} index={3}>
                    <Paper elevation={3} >
                        <h1>Account Settings</h1>
                        <p>Under Construction</p>
                    </Paper>
                </TabPanel>
            </MuiPickersUtilsProvider>
        </>
    );
}

export default App;
