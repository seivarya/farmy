import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:6767/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// add the stored jwt to each request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("farmy_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// unwrap responses and normalize errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Unable to connect to the Farmy server. Please check your connection.";

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
