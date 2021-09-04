import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import AppBar from '@material-ui/core/AppBar';
import AppTabs from './AppTabs';
import Toolbar from '@material-ui/core/Toolbar';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import { useSelector } from 'react-redux';
import { userSelector } from '../../../slices/userApiSlice';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

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

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <AppTabs selectedTab={selectedTab} setTab={setTab} />
                    <FormGroup>
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
