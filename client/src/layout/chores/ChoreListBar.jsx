import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import AddChoreModal from './AddChoreModal';
import useStyles from './ChoresListBarStyles';

export default function ChoreListBar() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <AppBar className={classes.appBar} position="static">
                <Toolbar>
                    <AddChoreModal />
                </Toolbar>
            </AppBar>
        </div>
    );
}
