import axiosInstance from "./axios";

const accountService = {
    login: async (username, password) => {
        try {
            const response = await axiosInstance.post('/login', {
                username: username,
                password: password
            });
            return response.data;
        } catch (error) {
            console.error('Error while logging in', error);
            return null;
        }
    },
    register: async (username, password, profile) => {
        try {
            const response = await axiosInstance.post('/create_user', {
                username: username,
                password: password,
                profile: profile
            });
            return response.data;
        } catch (error) {
            console.error('Error while registering', error);
            return null;
        }
    }
}

export default accountService;