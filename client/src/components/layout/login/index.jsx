import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, userSelector, clearState } from '../../../slices/userApiSlice';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex'
    },
    paper: {
        margin: 'auto auto',
        padding: '1rem',
        width: '100%',
        maxWidth: '700px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        '&> *': {
            margin: '1rem'
        }
    },
    heading1: {
        textAlign: 'center'
    },
    heading2: {
        margin: '1rem'
    },
    linkButton: {
        margin: '1rem',
        color: 'rgba(0, 0, 0, 0.88)',
        fontSize: '0.875rem',
        minWidth: '64px',
        boxSizing: 'border-box',
        transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 500,
        lineHeight: 1.75,
        borderRadius: '4px',
        letterSpacing: '0.02857em',
        textTransform: 'uppercase',
        border: '1px solid rgba(0, 0, 0, 0.23)',
        padding: '5px 15px',
        textDecoration: 'none',
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
        }
    }
}));

const Login = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const history = useHistory();
    const { isFetching, isSuccess, isError, errorMessage } = useSelector(userSelector);
    const onSubmit = (syntheticBaseEvent) => {
        dispatch(loginUser({ email: syntheticBaseEvent.target[0].value, password: syntheticBaseEvent.target[1].value }));
    };
    useEffect(() => () => dispatch(clearState()), [dispatch]);

    useEffect(() => {
        if (isError) {
            dispatch(clearState());
        } else if (isSuccess) {
            dispatch(clearState());
            history.push('/');
        }
    }, [dispatch, errorMessage, history, isError, isSuccess]);

    if (isFetching) {
        return <div>Fetching...</div>;
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.paper} elevation={3}>
                <Typography className={classes.heading1} variant="h3" id="login-header" component="h1">
                    Chore App
                </Typography>
                <Typography className={classes.heading2} variant="h4" id="login-header" component="h2">
                    Login
                </Typography>
                <form className={classes.form} method="POST" onSubmit={onSubmit}>
                    <TextField
                        autoComplete="email"
                        id="email"
                        label="Email Address"
                        name="email"
                        type="email"
                        required
                    />
                    <TextField
                        autoComplete="current-password"
                        id="email"
                        label="Password"
                        name="password"
                        type="password"
                        required
                    />
                    <Button color="primary" type="submit" variant="contained">
                        {isFetching ? 'Fetching...' : 'Login'}
                    </Button>
                </form>
                {errorMessage ? (<div style={{ color: 'red' }}>{errorMessage}</div>) : null}
                <Link className={classes.linkButton} color="secondary" to="signUp"> Sign up</Link>
            </Paper>
        </div>
    );
};

export default Login;
