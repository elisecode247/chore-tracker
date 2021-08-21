import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import useStyles from './AppTabsStyles';

const a11yProps = function(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
};

export default function AppTabs({ selectedTab, setTab }) {
    const classes = useStyles();

    const handleChange = (event, newValue) => {
        setTab(newValue);
    };

    return (
        <div className={classes.root}>
            <AppBar className={classes.appBar} elevation={0} position="static">
                <Tabs value={selectedTab} onChange={handleChange} aria-label="page tabs">
                    <Tab label="Agenda" {...a11yProps(0)} />
                    <Tab label="Calendar" {...a11yProps(1)} />
                    <Tab label="Chores" {...a11yProps(2)} />
                </Tabs>
            </AppBar>
        </div>
    );
}
