import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api", withCredentials: true });
api.interceptors.response.use((response) => response, (error) => Promise.reject(new Error(error.response?.data?.message || error.message || "Request failed")));
export default api;
