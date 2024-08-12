import axiosInstance from "axios";

const accountService = {
    login: async (username, password) => {
        try {
            const formdata = new FormData();
            formdata.append('username', username);
            formdata.append('password', password);
            const response = await axiosInstance.post('/api/account/login', formdata);
            return response.data;
        } catch (error) {
            console.error('Error while logging in', error);
            return null;
        }
    },
    register: async (username, password, profile) => {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('profile', profile);
            const response = await axiosInstance.post('/api/account/create_user', formData);
            return response.data;
        } catch (error) {
            console.error('Error while registering', error);
            return null;
        }
    }
}

export default accountService;