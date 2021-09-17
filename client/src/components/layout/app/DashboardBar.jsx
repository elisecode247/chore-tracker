import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import { useSelector } from 'react-redux';
import { userSelector } from '../../../slices/userApiSlice';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        marginBottom: '2rem',
        padding: '1rem',
        minHeight: '64px'
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    tabs: {
        width: '100%'
    },
    title: {
        flexGrow: 1,
    },
    login: {
        // TODO fix later for mobile
        float: 'right'
    }
}));

const a11yProps = function(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
};

export default function DashboardBar({ isFetching, onLogin, onLogOut, selectedTab, setTab }) {
    const classes = useStyles();
    const { email } = useSelector(userSelector);
    const [auth, setAuth] = React.useState(true);

    const handleChange = (event) => {
        if (!event.target.checked) {
            onLogOut();
        }
        setAuth(event.target.checked);
    };

    if (isFetching) {
        return (<>Fetching...</>);
    }
    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    return (
        <div className={classes.root}>
            <AppBar>
                <Toolbar className={classes.toolbar}>
                    <Tabs
                        className={classes.tabs} value={selectedTab} onChange={handleTabChange} aria-label="page tabs"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab label="Calendar" {...a11yProps(0)} />
                        <Tab label="Chores" {...a11yProps(1)} />
                        <Tab label="Add New Chore" {...a11yProps(2)} />
                        <Tab label="Settings" {...a11yProps(3)} />
                    </Tabs>
                    <FormGroup className={classes.login}>
                        <FormControlLabel
                            control={<Switch checked={auth} onChange={handleChange} aria-label="login switch" />}
                            label={auth ? email : 'Login'}
                            labelPlacement="start"
                        />
                    </FormGroup>
                </Toolbar>
            </AppBar>
        </div>
    );
}
