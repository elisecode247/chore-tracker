import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signUpUser, userSelector, clearState } from '../../../slices/userApiSlice';

const SignUp = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const { isFetching, isSuccess, isError, errorMessage } = useSelector(userSelector);
    const onSubmit = (data) => dispatch(signUpUser(data));

    useEffect(() => (() => dispatch(clearState())), [dispatch]);

    useEffect(() => {
        if (isSuccess) {
            dispatch(clearState());
            history.push('/');
        } else if (isError) {
            dispatch(clearState());
        }
    }, [dispatch, errorMessage, history, isSuccess, isError]);

    if (isError) {
        return 'Error occurred';
    }

    return (
        <>
            <h1>
                Sign Up
            </h1>
            <form
                onSubmit={onSubmit}
                method="POST"
            >
                <label htmlFor="email" >Email address</label>
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
                <button type="submit" >
                    {isFetching ? 'Fetching...' : 'Sign up'}
                </button>
            </form>
            <p>Or <Link to="login"> Login</Link></p>
        </>
    );
};

export default SignUp;
