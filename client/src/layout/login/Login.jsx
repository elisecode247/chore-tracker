import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, userSelector, clearState } from '../../slices/userApiSlice';

const Login = () => {
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
        <>
            <h1>Login</h1>
            <form method="POST" onSubmit={onSubmit}>
                <label htmlFor="email"> Email address </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                />
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                />
                <button type="submit">{isFetching ? 'Fetching...' : 'Login'}</button>
            </form>
            {errorMessage ? (<div style={{ color: 'red' }}>{errorMessage}</div>) : null }
            <p>Or <Link to="signUp"> Sign up</Link></p>

        </>
    );
};

export default Login;
