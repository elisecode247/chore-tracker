const baseQuery = {
    baseUrl: `${window.location.origin}/api/v1/`,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    }
};

export default baseQuery;
