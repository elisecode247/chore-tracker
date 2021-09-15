import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import Login from '../login';
import SignUp from '../signUp';
import Dashboard from './Dashboard';
import { PrivateRoute } from './PrivateRoute';

function App() {

    return (
        <>
            <CssBaseline />
            <Router>
                <Switch>
                    <Route exact component={Login} path="/login" />
                    <Route exact component={SignUp} path="/signUp" />
                    <PrivateRoute exact component={Dashboard} path="/" />
                </Switch>
            </Router>
        </>
    );
}

export default App;
