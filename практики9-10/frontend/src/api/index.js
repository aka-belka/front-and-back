import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3001/api",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
    }
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('Нет refresh токена');
                }

                const response = await axios.post('http://localhost:3000/api/auth/refresh', {
                    refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const api = {
    register: async (user) => {
        let response = await apiClient.post("/auth/register", user);
        return response.data;
    },

    login: async (credentials) => {
        let response = await apiClient.post("/auth/login", credentials);
        return response.data;
    },

    getMe: async (id) => {
        let response = await apiClient.get("/auth/me");
        return response.data;
    },
    createProduct: async (product) => {
        let response = await apiClient.post("/products", product);
        return response.data;
    },

    getProducts: async () => {
        let response = await apiClient.get("/products");
        return response.data;
    },

    getProductById: async (id) => {
        let response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    updateProduct: async (id, product) => {
        let response = await apiClient.put(`/products/${id}`,product);
        return response.data;
    },

    deleteProduct: async (id) => {
        let response = await apiClient.delete(`/products/${id}`);
        return response.data;
    }
}