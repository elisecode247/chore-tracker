import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const signUpUser = createAsyncThunk(
    'user/signUpUser',
    async ({ email, password }, thunkAPI) => {
        try {
            const response = await fetch(
                `${window.location.origin}/api/v1/users`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        password
                    }),
                }
            );
            let jsonResponse = await response.json();

            if (response.status === 200) {
                localStorage.setItem('token', jsonResponse.data.token);
                return { ...jsonResponse.data, email: email };
            } else {
                return thunkAPI.rejectWithValue(jsonResponse.data);
            }
        } catch (e) {
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
);

export const loginUser = createAsyncThunk(
    'user/login',
    async ({ email, password }, thunkAPI) => {
        try {
            const response = await fetch(
                `${window.location.origin}/api/v1/auth/local`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: email,
                        password
                    })
                }
            );
            let jsonResponse = await response.json();

            if (response.status === 200 && jsonResponse.success === true) {
                localStorage.setItem('token', jsonResponse.data.token);
                return jsonResponse.data.user;
            } else {
                return thunkAPI.rejectWithValue(jsonResponse.errorMessage);
            }
        } catch (e) {
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
);

export const fetchUserByToken = createAsyncThunk(
    'user/fetchUserByToken',
    async ({ token }, thunkAPI) => {
        try {
            const response = await fetch(
                `${window.location.origin}/api/v1/auth/local`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            let jsonResponse = await response.json();

            if (response.status === 200 && jsonResponse.success) {
                return jsonResponse.data;
            } else {
                return thunkAPI.rejectWithValue(jsonResponse.errorMessage);
            }
        } catch (e) {
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
);

export const updateUserSettings = createAsyncThunk(
    'user/settings',
    async (settings, thunkAPI) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${window.location.origin}/api/v1/user/settings`,
                {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(settings)
                }
            );
            let jsonResponse = await response.json();

            if (response.status === 200 && jsonResponse.success === true) {
                localStorage.setItem('token', jsonResponse.data.token);
                return jsonResponse.data.user.settings;
            } else {
                return thunkAPI.rejectWithValue(jsonResponse.errorMessage);
            }
        } catch (e) {
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
);

export const userApi = createSlice({
    name: 'user',
    initialState: {
        uuid: '',
        email: '',
        username: '',
        settings: {},
        isFetching: false,
        isSuccess: false,
        isError: false,
        errorMessage: ''
    },
    reducers: {
        clearState: (state) => {
            state.isError = false;
            state.isSuccess = false;
            state.isFetching = false;
            return state;
        },
    },
    extraReducers: {
        [signUpUser.fulfilled]: (state, { payload }) => {
            state.isFetching = false;
            state.isSuccess = true;
            state.email = payload.user.email;
            state.username = payload.user.name;
        },
        [signUpUser.pending]: (state) => {
            state.isFetching = true;
        },
        [signUpUser.rejected]: (state, { payload }) => {
            state.isFetching = false;
            state.isError = true;
            state.errorMessage = payload.message;
        },
        [loginUser.fulfilled]: (state, { payload }) => {
            state.uuid = payload.uuid;
            state.email = payload.email;
            state.isFetching = false;
            state.isSuccess = true;
            return state;
        },
        [loginUser.rejected]: (state, { payload }) => {
            state.isFetching = false;
            state.isError = true;
            state.errorMessage = payload;
        },
        [loginUser.pending]: (state) => {
            state.isFetching = true;
        },
        [fetchUserByToken.pending]: (state) => {
            state.isFetching = true;
        },
        [fetchUserByToken.fulfilled]: (state, { payload }) => {
            state.isError = false;
            state.isSuccess = true;
            state.isFetching = false;
            state.uuid = payload.uuid;
            state.email = payload.email;
            state.username = payload.email;
            state.settings = payload.settings;
        },
        [fetchUserByToken.rejected]: (state) => {
            state.isError = true;
            state.isSuccess = false;
            state.isFetching = false;
        },
        [updateUserSettings.pending]: (state) => {
            state.isError = false;
            state.isSuccess = false;
            state.isFetching = true;
        },
        [updateUserSettings.fulfilled]: (state, { payload }) => {
            state.settings = payload;
            state.isError = false;
            state.isSuccess = true;
            state.isFetching = false;
        },
        [updateUserSettings.rejected]: (state) => {
            state.isError = true;
            state.isSuccess = false;
            state.isFetching = false;
        },
    },
});

export const { clearState } = userApi.actions;

export const userSelector = (state) => state.user;
