import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8001/api",
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    config.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
    return config;
});

export default api;
